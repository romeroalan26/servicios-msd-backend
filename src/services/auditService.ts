import pool from '../config/database';

export interface AuditLogData {
  tabla: string;
  accion:
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'SELECT'
    | 'LOGIN'
    | 'LOGOUT'
    | 'SELECTION';
  registro_id?: number;
  datos_anteriores?: any;
  datos_nuevos?: any;
  usuario_id?: number;
}

export class AuditService {
  /**
   * Registra una entrada en el log de auditoría
   */
  static async log(data: AuditLogData): Promise<void> {
    try {
      const query = `
        INSERT INTO audit_log (tabla, accion, registro_id, datos_anteriores, datos_nuevos, usuario_id)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;

      const values = [
        data.tabla,
        data.accion,
        data.registro_id || null,
        data.datos_anteriores ? JSON.stringify(data.datos_anteriores) : null,
        data.datos_nuevos ? JSON.stringify(data.datos_nuevos) : null,
        data.usuario_id || null,
      ];

      await pool.query(query, values);
      console.log(`📝 Auditoría registrada: ${data.accion} en ${data.tabla}`);
    } catch (error) {
      console.error('❌ Error registrando auditoría:', error);
      // No lanzamos el error para no interrumpir el flujo principal
    }
  }

  /**
   * Registra la creación de un registro
   */
  static async logCreate(
    tabla: string,
    datos_nuevos: any,
    usuario_id?: number,
  ): Promise<void> {
    await this.log({
      tabla,
      accion: 'CREATE',
      datos_nuevos,
      usuario_id,
    });
  }

  /**
   * Registra la actualización de un registro
   */
  static async logUpdate(
    tabla: string,
    registro_id: number,
    datos_anteriores: any,
    datos_nuevos: any,
    usuario_id?: number,
  ): Promise<void> {
    await this.log({
      tabla,
      accion: 'UPDATE',
      registro_id,
      datos_anteriores,
      datos_nuevos,
      usuario_id,
    });
  }

  /**
   * Registra la eliminación de un registro
   */
  static async logDelete(
    tabla: string,
    registro_id: number,
    datos_anteriores: any,
    usuario_id?: number,
  ): Promise<void> {
    await this.log({
      tabla,
      accion: 'DELETE',
      registro_id,
      datos_anteriores,
      usuario_id,
    });
  }

  /**
   * Registra el inicio de sesión
   */
  static async logLogin(usuario_id: number, datos_nuevos?: any): Promise<void> {
    await this.log({
      tabla: 'empleados',
      accion: 'LOGIN',
      datos_nuevos: {
        ...datos_nuevos,
        timestamp: new Date().toISOString(),
      },
      usuario_id,
    });
  }

  /**
   * Registra el cierre de sesión
   */
  static async logLogout(usuario_id: number): Promise<void> {
    await this.log({
      tabla: 'empleados',
      accion: 'LOGOUT',
      datos_nuevos: {
        timestamp: new Date().toISOString(),
      },
      usuario_id,
    });
  }

  /**
   * Registra una selección de servicio
   */
  static async logSelection(
    empleado_id: number,
    servicio_id: number,
    anno: number,
    datos_nuevos?: any,
  ): Promise<void> {
    await this.log({
      tabla: 'selecciones',
      accion: 'SELECTION',
      registro_id: servicio_id,
      datos_nuevos: {
        empleado_id,
        servicio_id,
        anno,
        ...datos_nuevos,
        timestamp: new Date().toISOString(),
      },
      usuario_id: empleado_id,
    });
  }

  /**
   * Obtiene el historial de auditoría con filtros opcionales
   */
  static async getAuditLog(
    filters: {
      tabla?: string;
      accion?: string;
      usuario_id?: number;
      fecha_desde?: string;
      fecha_hasta?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<any[]> {
    try {
      let query = `
        SELECT 
          al.id,
          al.tabla,
          al.accion,
          al.registro_id,
          al.datos_anteriores,
          al.datos_nuevos,
          al.usuario_id,
          e.nombre as usuario_nombre,
          e.email as usuario_email,
          al.created_at
        FROM audit_log al
        LEFT JOIN empleados e ON al.usuario_id = e.id
        WHERE 1=1
      `;

      const values: any[] = [];
      let paramIndex = 1;

      if (filters.tabla) {
        query += ` AND al.tabla = $${paramIndex}`;
        values.push(filters.tabla);
        paramIndex++;
      }

      if (filters.accion) {
        query += ` AND al.accion = $${paramIndex}`;
        values.push(filters.accion);
        paramIndex++;
      }

      if (filters.usuario_id) {
        query += ` AND al.usuario_id = $${paramIndex}`;
        values.push(filters.usuario_id);
        paramIndex++;
      }

      if (filters.fecha_desde) {
        query += ` AND al.created_at >= $${paramIndex}`;
        values.push(filters.fecha_desde);
        paramIndex++;
      }

      if (filters.fecha_hasta) {
        query += ` AND al.created_at <= $${paramIndex}`;
        values.push(filters.fecha_hasta);
        paramIndex++;
      }

      query += ` ORDER BY al.created_at DESC`;

      if (filters.limit) {
        query += ` LIMIT $${paramIndex}`;
        values.push(filters.limit);
        paramIndex++;
      }

      if (filters.offset) {
        query += ` OFFSET $${paramIndex}`;
        values.push(filters.offset);
      }

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('❌ Error obteniendo log de auditoría:', error);
      throw error;
    }
  }

  /**
   * Limpia registros antiguos del log de auditoría (más de X días)
   */
  static async cleanOldLogs(daysToKeep: number = 365): Promise<number> {
    try {
      const query = `
        DELETE FROM audit_log 
        WHERE created_at < NOW() - INTERVAL '${daysToKeep} days'
      `;

      const result = await pool.query(query);
      console.log(
        `🧹 Limpiados ${result.rowCount} registros antiguos del log de auditoría`,
      );
      return result.rowCount || 0;
    } catch (error) {
      console.error('❌ Error limpiando log de auditoría:', error);
      throw error;
    }
  }
}
