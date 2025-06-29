import pool from '../config/database';
import { Turno, CreateTurnoData, UpdateTurnoData } from '../models/turno';
import { PaginationOptions, PaginationResult } from '../models/apiResponse';

export class TurnoService {
  /**
   * Obtiene todos los turnos con paginación
   */
  static async getTurnos(
    paginationOptions?: PaginationOptions,
  ): Promise<PaginationResult<Turno>> {
    const page = paginationOptions?.page || 1;
    const limit = paginationOptions?.limit || 10;
    const offset = (page - 1) * limit;
    const sortBy = paginationOptions?.sortBy || 't.id';
    const sortOrder = paginationOptions?.sortOrder || 'asc';

    // Construir condiciones WHERE
    const whereConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Filtro por estado activo/inactivo
    if (paginationOptions?.activo !== undefined) {
      whereConditions.push(`t.activo = $${paramIndex++}`);
      params.push(paginationOptions.activo);
    }

    // Filtro de búsqueda en código, nombre y descripción
    if (paginationOptions?.search) {
      whereConditions.push(
        `(t.codigo ILIKE $${paramIndex} OR t.nombre ILIKE $${paramIndex} OR t.descripcion ILIKE $${paramIndex})`,
      );
      params.push(`%${paginationOptions.search}%`);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    // Query para contar total de elementos
    const countQuery = `
      SELECT COUNT(*) as total
      FROM turnos t
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, params);
    const totalElements = parseInt(countResult.rows[0].total);

    // Query principal con paginación
    const query = `
      SELECT 
        t.id,
        t.codigo,
        t.nombre,
        t.descripcion,
        t.activo,
        t.created_at,
        t.updated_at
      FROM turnos t
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    params.push(limit, offset);
    const result = await pool.query(query, params);

    return {
      data: result.rows,
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
   * Obtiene un turno por ID
   */
  static async getTurnoById(turnoId: number): Promise<Turno | null> {
    try {
      const query = `
        SELECT id, codigo, nombre, descripcion, activo, created_at, updated_at
        FROM turnos
        WHERE id = $1
      `;

      const result = await pool.query(query, [turnoId]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error obteniendo turno por ID:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo turno
   */
  static async createTurno(turnoData: CreateTurnoData): Promise<Turno> {
    try {
      // Verificar que el código no exista
      const existingTurno = await pool.query(
        'SELECT id FROM turnos WHERE codigo = $1',
        [turnoData.codigo],
      );

      if (existingTurno.rows.length > 0) {
        throw new Error('Ya existe un turno con ese código');
      }

      const query = `
        INSERT INTO turnos (codigo, nombre, descripcion, activo, created_at, updated_at)
        VALUES ($1, $2, $3, true, NOW(), NOW())
        RETURNING *
      `;

      const result = await pool.query(query, [
        turnoData.codigo,
        turnoData.nombre,
        turnoData.descripcion,
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error creando turno:', error);
      throw error;
    }
  }

  /**
   * Actualiza un turno existente
   */
  static async updateTurno(
    turnoId: number,
    updateData: UpdateTurnoData,
  ): Promise<Turno> {
    try {
      // Verificar que el turno existe
      const existingTurno = await this.getTurnoById(turnoId);
      if (!existingTurno) {
        throw new Error('Turno no encontrado');
      }

      // Si se está actualizando el código, verificar que no exista otro con el mismo código
      if (updateData.codigo && updateData.codigo !== existingTurno.codigo) {
        const duplicateTurno = await pool.query(
          'SELECT id FROM turnos WHERE codigo = $1 AND id != $2',
          [updateData.codigo, turnoId],
        );

        if (duplicateTurno.rows.length > 0) {
          throw new Error('Ya existe otro turno con ese código');
        }
      }

      // Construir query dinámicamente
      const updateFields: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (updateData.codigo !== undefined) {
        updateFields.push(`codigo = $${paramIndex++}`);
        params.push(updateData.codigo);
      }

      if (updateData.nombre !== undefined) {
        updateFields.push(`nombre = $${paramIndex++}`);
        params.push(updateData.nombre);
      }

      if (updateData.descripcion !== undefined) {
        updateFields.push(`descripcion = $${paramIndex++}`);
        params.push(updateData.descripcion);
      }

      if (updateData.activo !== undefined) {
        updateFields.push(`activo = $${paramIndex++}`);
        params.push(updateData.activo);
      }

      if (updateFields.length === 0) {
        throw new Error('No se proporcionaron campos para actualizar');
      }

      updateFields.push(`updated_at = NOW()`);
      params.push(turnoId);

      const query = `
        UPDATE turnos 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error actualizando turno:', error);
      throw error;
    }
  }

  /**
   * Elimina un turno (marca como inactivo)
   */
  static async deleteTurno(turnoId: number): Promise<void> {
    try {
      // Verificar que el turno existe
      const existingTurno = await this.getTurnoById(turnoId);
      if (!existingTurno) {
        throw new Error('Turno no encontrado');
      }

      // Verificar que no esté siendo usado en servicios
      const turnoEnUso = await pool.query(
        'SELECT COUNT(*) as count FROM servicio_dias WHERE turno_id = $1',
        [turnoId],
      );

      if (parseInt(turnoEnUso.rows[0].count) > 0) {
        throw new Error(
          'No se puede eliminar el turno porque está siendo usado en servicios',
        );
      }

      // Marcar como inactivo en lugar de eliminar físicamente
      await pool.query(
        'UPDATE turnos SET activo = false, updated_at = NOW() WHERE id = $1',
        [turnoId],
      );
    } catch (error) {
      console.error('Error eliminando turno:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los turnos activos (sin paginación)
   */
  static async getTurnosActivos(): Promise<Turno[]> {
    try {
      const query = `
        SELECT id, codigo, nombre, descripcion, activo, created_at, updated_at
        FROM turnos
        WHERE activo = true
        ORDER BY codigo
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo turnos activos:', error);
      throw error;
    }
  }
}
