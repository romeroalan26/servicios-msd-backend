import pool from '../config/database';
import { Seleccion, CreateSeleccionData } from '../models/seleccion';
import { NotificationService } from './notificationService';
import { AuditService } from './auditService';
import { EmpleadoService } from './empleadoService';
import { ServicioService } from './servicioService';

export interface EmpleadoConPrioridad {
  id: number;
  nombre: string;
  email: string;
  prioridad: number;
  rol: string;
}

export interface ServicioDisponible {
  id: number;
  nombre: string;
  descripcion: string;
  dias_totales: number;
  dias_disponibles: number;
}

export class SeleccionService {
  /**
   * Obtiene el empleado con la prioridad más alta que no tenga selección
   */
  static async getEmpleadoConPrioridadMasAlta(
    anno: number,
  ): Promise<EmpleadoConPrioridad | null> {
    const query = `
      SELECT e.id, e.nombre, e.email, e.prioridad, e.rol
      FROM empleados e
      WHERE e.activo = true 
        AND e.rol = 'empleado'
        AND e.prioridad IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM selecciones s 
          WHERE s.empleado_id = e.id AND s.anno = $1
        )
      ORDER BY e.prioridad ASC
      LIMIT 1
    `;

    const result = await pool.query(query, [anno]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Verifica si un empleado puede seleccionar un servicio
   */
  static async puedeSeleccionarServicio(
    empleadoId: number,
    anno: number,
  ): Promise<boolean> {
    // Verificar si ya tiene una selección para este año
    const seleccionExistente = await pool.query(
      'SELECT id FROM selecciones WHERE empleado_id = $1 AND anno = $2',
      [empleadoId, anno],
    );

    if (seleccionExistente.rows.length > 0) {
      return false; // Ya tiene una selección
    }

    // Verificar si es el empleado con prioridad más alta
    const empleadoConPrioridad =
      await this.getEmpleadoConPrioridadMasAlta(anno);
    return empleadoConPrioridad?.id === empleadoId;
  }

  /**
   * Obtiene los servicios disponibles para seleccionar
   */
  static async getServiciosDisponibles(
    anno: number,
  ): Promise<ServicioDisponible[]> {
    const query = `
      SELECT 
        s.id,
        s.nombre,
        s.descripcion,
        COUNT(sd.id) as dias_totales,
        COUNT(sd.id) - COALESCE(COUNT(e.id), 0) as dias_disponibles
      FROM servicios s
      LEFT JOIN servicio_dias sd ON s.id = sd.servicio_id
      LEFT JOIN excepciones e ON sd.servicio_id = e.servicio_id 
        AND sd.fecha = e.fecha 
        AND sd.tanda = e.tanda 
        AND e.activo = true
      WHERE s.activo = true
        AND NOT EXISTS (
          SELECT 1 FROM selecciones sel 
          WHERE sel.servicio_id = s.id AND sel.anno = $1
        )
      GROUP BY s.id, s.nombre, s.descripcion
      ORDER BY s.nombre
    `;

    const result = await pool.query(query, [anno]);
    return result.rows;
  }

  /**
   * Verifica si un servicio está disponible
   */
  static async servicioDisponible(
    servicioId: number,
    anno: number,
  ): Promise<boolean> {
    const result = await pool.query(
      'SELECT id FROM selecciones WHERE servicio_id = $1 AND anno = $2',
      [servicioId, anno],
    );
    return result.rows.length === 0;
  }

  /**
   * Crea una nueva selección de servicio
   */
  static async crearSeleccion(
    seleccionData: CreateSeleccionData,
  ): Promise<Seleccion> {
    // Verificar que el servicio esté disponible
    const disponible = await this.servicioDisponible(
      seleccionData.servicio_id,
      seleccionData.anno,
    );
    if (!disponible) {
      throw new Error('El servicio ya no está disponible');
    }

    // Verificar que el empleado pueda seleccionar
    const puedeSeleccionar = await this.puedeSeleccionarServicio(
      seleccionData.empleado_id,
      seleccionData.anno,
    );
    if (!puedeSeleccionar) {
      throw new Error('No puedes seleccionar un servicio en este momento');
    }

    // Crear la selección
    const result = await pool.query(
      'INSERT INTO selecciones (empleado_id, servicio_id, anno, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
      [
        seleccionData.empleado_id,
        seleccionData.servicio_id,
        seleccionData.anno,
      ],
    );

    // Rotar las prioridades después de la selección
    await this.rotarPrioridades(seleccionData.empleado_id);

    // Obtener información del empleado y servicio para notificaciones
    const empleado = await EmpleadoService.getEmpleadoById(
      seleccionData.empleado_id,
    );
    const servicio = await ServicioService.getServicioById(
      seleccionData.servicio_id,
    );

    if (empleado && servicio) {
      // Obtener información del primer día del servicio para la notificación
      const servicioConDias = await ServicioService.getServicioConDias(
        servicio.id,
      );
      const primerDia = servicioConDias?.dias?.[0];

      if (primerDia) {
        // Enviar notificaciones
        await NotificationService.sendAllNotifications({
          empleado,
          servicio,
          fecha: primerDia.fecha.toISOString().split('T')[0],
          tanda: primerDia.tanda,
          turnoNombre: primerDia.turno_nombre,
        });
      }

      // Registrar en auditoría
      await AuditService.logSelection(
        seleccionData.empleado_id,
        seleccionData.servicio_id,
        seleccionData.anno,
        {
          empleado_nombre: empleado.nombre,
          servicio_nombre: servicio.nombre,
        },
      );
    }

    return result.rows[0];
  }

  /**
   * Rota las prioridades de forma justa después de una selección
   * El empleado que selecciona pasa a prioridad 20, los demás suben una posición
   */
  static async rotarPrioridades(empleadoId: number): Promise<void> {
    // Obtener todos los empleados activos ordenados por prioridad
    const empleadosResult = await pool.query(
      "SELECT id, prioridad FROM empleados WHERE activo = true AND rol = 'empleado' ORDER BY prioridad ASC",
    );

    const empleados = empleadosResult.rows;
    if (empleados.length === 0) return;

    // Encontrar el empleado que seleccionó
    const empleadoSeleccion = empleados.find((e) => e.id === empleadoId);
    if (!empleadoSeleccion) return;

    // Crear el nuevo mapeo de prioridades
    const nuevasPrioridades = new Map<number, number>();

    // El empleado que seleccionó pasa a prioridad 20
    nuevasPrioridades.set(empleadoId, 20);

    // Los demás empleados suben una posición
    let nuevaPrioridad = 1;
    for (const empleado of empleados) {
      if (empleado.id !== empleadoId) {
        nuevasPrioridades.set(empleado.id, nuevaPrioridad);
        nuevaPrioridad++;
      }
    }

    // Actualizar todas las prioridades en una transacción
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const [id, prioridad] of nuevasPrioridades) {
        await client.query(
          'UPDATE empleados SET prioridad = $1, updated_at = NOW() WHERE id = $2',
          [prioridad, id],
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Mueve la prioridad de un empleado al final (método legacy - mantenido para compatibilidad)
   * @deprecated Usar rotarPrioridades en su lugar
   */
  static async moverPrioridadAlFinal(empleadoId: number): Promise<void> {
    // Obtener la prioridad más alta actual
    const maxPrioridadResult = await pool.query(
      "SELECT COALESCE(MAX(prioridad), 0) as max_prioridad FROM empleados WHERE activo = true AND rol = 'empleado'",
    );
    const nuevaPrioridad = maxPrioridadResult.rows[0].max_prioridad + 1;

    // Actualizar la prioridad del empleado
    await pool.query(
      'UPDATE empleados SET prioridad = $1, updated_at = NOW() WHERE id = $2',
      [nuevaPrioridad, empleadoId],
    );
  }

  /**
   * Obtiene la selección de un empleado
   */
  static async getSeleccionEmpleado(
    empleadoId: number,
    anno: number,
  ): Promise<Seleccion | null> {
    const result = await pool.query(
      'SELECT * FROM selecciones WHERE empleado_id = $1 AND anno = $2',
      [empleadoId, anno],
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Obtiene todas las selecciones de un año
   */
  static async getSeleccionesAnno(anno: number): Promise<Seleccion[]> {
    const result = await pool.query(
      'SELECT * FROM selecciones WHERE anno = $1 ORDER BY created_at ASC',
      [anno],
    );
    return result.rows;
  }

  /**
   * Libera la selección de un empleado (opcional)
   */
  static async liberarSeleccion(
    empleadoId: number,
    anno: number,
  ): Promise<void> {
    // Verificar que tenga una selección
    const seleccion = await this.getSeleccionEmpleado(empleadoId, anno);
    if (!seleccion) {
      throw new Error('No tienes una selección para liberar');
    }

    // Eliminar la selección
    await pool.query(
      'DELETE FROM selecciones WHERE empleado_id = $1 AND anno = $2',
      [empleadoId, anno],
    );

    // Rotar las prioridades después de liberar la selección
    await this.rotarPrioridades(empleadoId);
  }

  /**
   * Obtiene estadísticas de selecciones
   */
  static async getEstadisticasSelecciones(anno: number): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) as total_selecciones,
        COUNT(DISTINCT s.servicio_id) as servicios_seleccionados,
        COUNT(DISTINCT s.empleado_id) as empleados_con_seleccion
      FROM selecciones s
      WHERE s.anno = $1
    `;

    const result = await pool.query(query, [anno]);
    return result.rows[0];
  }

  /**
   * Intercambia un día dentro del servicio seleccionado por el empleado
   */
  static async intercambiarDia(
    empleadoId: number,
    anno: number,
    liberar_dia_id: number,
    tomar_dia_id: number,
  ): Promise<{ liberado: number; tomado: number }> {
    // 1. Verificar que el empleado tenga una selección
    const seleccion = await this.getSeleccionEmpleado(empleadoId, anno);
    if (!seleccion) {
      throw new Error('No tienes un servicio seleccionado para este año');
    }

    // 2. Verificar que el día a liberar pertenece al servicio seleccionado
    const diaLiberar = await pool.query(
      'SELECT * FROM servicio_dias WHERE id = $1 AND servicio_id = $2',
      [liberar_dia_id, seleccion.servicio_id],
    );
    if (diaLiberar.rows.length === 0) {
      throw new Error(
        'El día a liberar no pertenece a tu servicio seleccionado',
      );
    }

    // 3. Verificar que el día a tomar pertenece al mismo servicio y está disponible
    const diaTomar = await pool.query(
      'SELECT * FROM servicio_dias WHERE id = $1 AND servicio_id = $2',
      [tomar_dia_id, seleccion.servicio_id],
    );
    if (diaTomar.rows.length === 0) {
      throw new Error('El día a tomar no pertenece a tu servicio seleccionado');
    }

    // 4. Verificar que el día a tomar no esté ocupado por una excepción activa
    const excepcionTomar = await pool.query(
      'SELECT * FROM excepciones WHERE servicio_id = $1 AND fecha = $2 AND tanda = $3 AND activo = true',
      [seleccion.servicio_id, diaTomar.rows[0].fecha, diaTomar.rows[0].tanda],
    );
    if (excepcionTomar.rows.length > 0) {
      throw new Error('El día que deseas tomar no está disponible');
    }

    // 5. Registrar la excepción para liberar el día (tipo: "ausencia")
    await pool.query(
      'INSERT INTO excepciones (empleado_id, servicio_id, fecha, tanda, tipo, motivo, activo, created_by, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, true, $1, NOW(), NOW())',
      [
        empleadoId,
        seleccion.servicio_id,
        diaLiberar.rows[0].fecha,
        diaLiberar.rows[0].tanda,
        'ausencia',
        'Intercambio de día',
      ],
    );

    // 6. Registrar la excepción para tomar el nuevo día (tipo: "ajuste")
    await pool.query(
      'INSERT INTO excepciones (empleado_id, servicio_id, fecha, tanda, tipo, motivo, activo, created_by, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, true, $1, NOW(), NOW())',
      [
        empleadoId,
        seleccion.servicio_id,
        diaTomar.rows[0].fecha,
        diaTomar.rows[0].tanda,
        'ajuste',
        'Intercambio de día',
      ],
    );

    return { liberado: liberar_dia_id, tomado: tomar_dia_id };
  }
}
