import pool from '../config/database';
import {
  Servicio,
  ServicioDia,
  CreateServicioData,
  CreateServicioDiaData,
} from '../models/servicio';
import { Excepcion } from '../models/excepcion';
import { PaginationOptions, PaginationResult } from '../models/apiResponse';

export interface ServicioConDias extends Servicio {
  dias: ServicioDiaConExcepciones[];
}

export interface ServicioDiaConExcepciones extends ServicioDia {
  turno_codigo: string;
  turno_nombre: string;
  excepciones?: Excepcion[];
}

export class ServicioService {
  /**
   * Obtiene todos los servicios con sus días, considerando excepciones y paginación
   */
  static async getServiciosConDias(
    empleadoId?: number,
    paginationOptions?: PaginationOptions,
  ): Promise<PaginationResult<ServicioConDias>> {
    const page = paginationOptions?.page || 1;
    const limit = paginationOptions?.limit || 10;
    const offset = (page - 1) * limit;
    const sortBy = paginationOptions?.sortBy || 's.id';
    const sortOrder = paginationOptions?.sortOrder || 'asc';

    // Construir condiciones WHERE
    const whereConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Filtro básico de servicios activos
    whereConditions.push('s.activo = true');

    // Filtro por estado activo/inactivo
    if (paginationOptions?.activo !== undefined) {
      whereConditions.push(`s.activo = $${paramIndex++}`);
      params.push(paginationOptions.activo);
    }

    // Filtro de búsqueda en nombre y descripción
    if (paginationOptions?.search) {
      whereConditions.push(
        `(s.nombre ILIKE $${paramIndex} OR s.descripcion ILIKE $${paramIndex})`,
      );
      params.push(`%${paginationOptions.search}%`);
      paramIndex++;
    }

    // Filtro por rango de fechas
    if (paginationOptions?.fechaDesde) {
      whereConditions.push(`sd.fecha >= $${paramIndex++}`);
      params.push(paginationOptions.fechaDesde);
    }

    if (paginationOptions?.fechaHasta) {
      whereConditions.push(`sd.fecha <= $${paramIndex++}`);
      params.push(paginationOptions.fechaHasta);
    }

    // Filtro por tanda
    if (paginationOptions?.tanda) {
      whereConditions.push(`sd.tanda = $${paramIndex++}`);
      params.push(paginationOptions.tanda);
    }

    // Filtro por turno
    if (paginationOptions?.turnoId) {
      whereConditions.push(`sd.turno_id = $${paramIndex++}`);
      params.push(paginationOptions.turnoId);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    // Query para contar total de elementos
    const countQuery = `
      SELECT COUNT(DISTINCT s.id) as total
      FROM servicios s
      LEFT JOIN servicio_dias sd ON s.id = sd.servicio_id
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, params);
    const totalElements = parseInt(countResult.rows[0].total);

    // Query principal con paginación
    let query = `
      SELECT 
        s.id as servicio_id,
        s.nombre as servicio_nombre,
        s.descripcion as servicio_descripcion,
        s.activo as servicio_activo,
        s.created_at as servicio_created_at,
        s.updated_at as servicio_updated_at
    `;

    // Incluir información de días si se solicita
    if (paginationOptions?.incluirDias !== false) {
      query += `,
        sd.id as dia_id,
        sd.fecha,
        sd.tanda,
        sd.turno_id,
        t.codigo as turno_codigo,
        t.nombre as turno_nombre
      `;
    }

    // Incluir información de excepciones si se solicita
    if (paginationOptions?.incluirExcepciones !== false) {
      query += `,
        e.id as excepcion_id,
        e.tipo as excepcion_tipo,
        e.motivo as excepcion_motivo,
        e.turno_reemplazo_id,
        tr.codigo as turno_reemplazo_codigo,
        tr.nombre as turno_reemplazo_nombre
      `;
    }

    query += `
      FROM servicios s
    `;

    // JOINs condicionales
    if (paginationOptions?.incluirDias !== false) {
      query += `LEFT JOIN servicio_dias sd ON s.id = sd.servicio_id
                LEFT JOIN turnos t ON sd.turno_id = t.id`;
    }

    if (paginationOptions?.incluirExcepciones !== false) {
      query += `
        LEFT JOIN excepciones e ON sd.servicio_id = e.servicio_id 
          AND sd.fecha = e.fecha 
          AND sd.tanda = e.tanda 
          AND e.activo = true
          ${empleadoId ? `AND e.empleado_id = $${paramIndex++}` : ''}
        LEFT JOIN turnos tr ON e.turno_reemplazo_id = tr.id
      `;
      if (empleadoId) {
        params.push(empleadoId);
      }
    }

    query += `
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    params.push(limit, offset);
    const result = await pool.query(query, params);

    // Agrupar resultados por servicio
    const serviciosMap = new Map<number, ServicioConDias>();

    result.rows.forEach((row) => {
      const servicioId = row.servicio_id;

      if (!serviciosMap.has(servicioId)) {
        serviciosMap.set(servicioId, {
          id: servicioId,
          nombre: row.servicio_nombre,
          descripcion: row.servicio_descripcion,
          activo: row.servicio_activo,
          created_at: row.servicio_created_at,
          updated_at: row.servicio_updated_at,
          dias: [],
        });
      }

      const servicio = serviciosMap.get(servicioId)!;

      // Agregar día si se incluye y existe
      if (paginationOptions?.incluirDias !== false && row.dia_id) {
        const dia: ServicioDiaConExcepciones = {
          id: row.dia_id,
          servicio_id: servicioId,
          fecha: row.fecha,
          tanda: row.tanda,
          turno_id: row.turno_id,
          turno_codigo: row.turno_codigo,
          turno_nombre: row.turno_nombre,
          created_at: row.created_at,
          updated_at: row.updated_at,
          excepciones: [],
        };

        // Agregar excepción si se incluye y existe
        if (
          paginationOptions?.incluirExcepciones !== false &&
          row.excepcion_id
        ) {
          dia.excepciones!.push({
            id: row.excepcion_id,
            empleado_id: empleadoId!,
            servicio_id: servicioId,
            fecha: row.fecha,
            tanda: row.tanda,
            tipo: row.excepcion_tipo,
            motivo: row.excepcion_motivo,
            turno_reemplazo_id: row.turno_reemplazo_id,
            activo: true,
            created_by: 0,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }

        servicio.dias.push(dia);
      }
    });

    const servicios = Array.from(serviciosMap.values());

    return {
      data: servicios,
      pagination: {
        page,
        limit,
        totalElements,
        totalPages: Math.ceil(totalElements / limit),
        hasNext: page < Math.ceil(totalElements / limit),
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Obtiene un servicio específico con sus días
   */
  static async getServicioConDias(
    servicioId: number,
    empleadoId?: number,
    filtros?: {
      fechaDesde?: string;
      fechaHasta?: string;
      tanda?: string;
      turnoId?: number;
      incluirExcepciones?: boolean;
      soloFuturos?: boolean;
    },
  ): Promise<ServicioConDias | null> {
    // Construir condiciones WHERE para los días
    const whereConditions: string[] = ['s.id = $1 AND s.activo = true'];
    const params: any[] = [servicioId];
    let paramIndex = 2;

    // Filtro por rango de fechas
    if (filtros?.fechaDesde) {
      whereConditions.push(`sd.fecha >= $${paramIndex++}`);
      params.push(filtros.fechaDesde);
    }

    if (filtros?.fechaHasta) {
      whereConditions.push(`sd.fecha <= $${paramIndex++}`);
      params.push(filtros.fechaHasta);
    }

    // Filtro por tanda
    if (filtros?.tanda) {
      whereConditions.push(`sd.tanda = $${paramIndex++}`);
      params.push(filtros.tanda);
    }

    // Filtro por turno
    if (filtros?.turnoId) {
      whereConditions.push(`sd.turno_id = $${paramIndex++}`);
      params.push(filtros.turnoId);
    }

    const whereClause = whereConditions.join(' AND ');

    let query = `
      SELECT 
        s.id as servicio_id,
        s.nombre as servicio_nombre,
        s.descripcion as servicio_descripcion,
        s.activo as servicio_activo,
        s.created_at as servicio_created_at,
        s.updated_at as servicio_updated_at,
        sd.id as dia_id,
        sd.fecha,
        sd.tanda,
        sd.turno_id,
        t.codigo as turno_codigo,
        t.nombre as turno_nombre
    `;

    // Incluir información de excepciones si se solicita
    if (filtros?.incluirExcepciones !== false) {
      query += `,
        e.id as excepcion_id,
        e.tipo as excepcion_tipo,
        e.motivo as excepcion_motivo,
        e.turno_reemplazo_id,
        tr.codigo as turno_reemplazo_codigo,
        tr.nombre as turno_reemplazo_nombre
      `;
    }

    query += `
      FROM servicios s
      LEFT JOIN servicio_dias sd ON s.id = sd.servicio_id
      LEFT JOIN turnos t ON sd.turno_id = t.id
    `;

    // JOIN condicional para excepciones
    if (filtros?.incluirExcepciones !== false) {
      query += `
        LEFT JOIN excepciones e ON sd.servicio_id = e.servicio_id 
          AND sd.fecha = e.fecha 
          AND sd.tanda = e.tanda 
          AND e.activo = true
          ${empleadoId ? `AND e.empleado_id = $${paramIndex++}` : ''}
        LEFT JOIN turnos tr ON e.turno_reemplazo_id = tr.id
      `;
      if (empleadoId) {
        params.push(empleadoId);
      }
    }

    query += `
      WHERE ${whereClause}
      ORDER BY sd.fecha, sd.tanda
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return null;
    }

    // Agrupar resultados por servicio
    const servicio: ServicioConDias = {
      id: result.rows[0].servicio_id,
      nombre: result.rows[0].servicio_nombre,
      descripcion: result.rows[0].servicio_descripcion,
      activo: result.rows[0].servicio_activo,
      created_at: result.rows[0].servicio_created_at,
      updated_at: result.rows[0].servicio_updated_at,
      dias: [],
    };

    result.rows.forEach((row) => {
      if (row.dia_id) {
        const dia: ServicioDiaConExcepciones = {
          id: row.dia_id,
          servicio_id: servicio.id,
          fecha: row.fecha,
          tanda: row.tanda,
          turno_id: row.turno_id,
          turno_codigo: row.turno_codigo,
          turno_nombre: row.turno_nombre,
          created_at: row.created_at,
          updated_at: row.updated_at,
          excepciones: [],
        };

        // Agregar excepción si se incluye y existe
        if (filtros?.incluirExcepciones !== false && row.excepcion_id) {
          dia.excepciones!.push({
            id: row.excepcion_id,
            empleado_id: empleadoId!,
            servicio_id: servicio.id,
            fecha: row.fecha,
            tanda: row.tanda,
            tipo: row.excepcion_tipo,
            motivo: row.excepcion_motivo,
            turno_reemplazo_id: row.turno_reemplazo_id,
            activo: true,
            created_by: 0,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }

        servicio.dias.push(dia);
      }
    });

    return servicio;
  }

  /**
   * Crea un nuevo servicio
   */
  static async createServicio(
    servicioData: CreateServicioData,
  ): Promise<Servicio> {
    const query = `
      INSERT INTO servicios (nombre, descripcion, activo, created_at, updated_at)
      VALUES ($1, $2, true, NOW(), NOW())
      RETURNING *
    `;

    const result = await pool.query(query, [
      servicioData.nombre,
      servicioData.descripcion,
    ]);
    return result.rows[0];
  }

  /**
   * Agrega un día a un servicio
   */
  static async addDiaServicio(
    diaData: CreateServicioDiaData,
  ): Promise<ServicioDia> {
    const query = `
      INSERT INTO servicio_dias (servicio_id, fecha, tanda, turno_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;

    const result = await pool.query(query, [
      diaData.servicio_id,
      diaData.fecha,
      diaData.tanda,
      diaData.turno_id,
    ]);

    return result.rows[0];
  }

  /**
   * Verifica si un empleado tiene excepciones para un día específico
   */
  static async getExcepcionesEmpleado(
    empleadoId: number,
    fecha: Date,
    tanda?: string,
  ): Promise<Excepcion[]> {
    let query = `
      SELECT * FROM excepciones 
      WHERE empleado_id = $1 
        AND fecha = $2 
        AND activo = true
    `;
    const params: (number | Date | string)[] = [empleadoId, fecha];

    if (tanda) {
      query += ' AND tanda = $3';
      params.push(tanda);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }
}
