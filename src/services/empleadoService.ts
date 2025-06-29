import pool from '../config/database';
import {
  Empleado,
  CreateEmpleadoData,
  UpdateEmpleadoData,
} from '../models/empleado';
import { PaginationOptions, PaginationResult } from '../models/apiResponse';
import bcrypt from 'bcrypt';

export class EmpleadoService {
  /**
   * Obtiene todos los empleados con paginación
   */
  static async getEmpleados(
    paginationOptions?: PaginationOptions,
  ): Promise<PaginationResult<Empleado>> {
    const page = paginationOptions?.page || 1;
    const limit = paginationOptions?.limit || 10;
    const offset = (page - 1) * limit;
    const sortBy = paginationOptions?.sortBy || 'e.id';
    const sortOrder = paginationOptions?.sortOrder || 'asc';

    // Construir condiciones WHERE
    const whereConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Filtro por estado activo/inactivo
    if (paginationOptions?.activo !== undefined) {
      whereConditions.push(`e.activo = $${paramIndex++}`);
      params.push(paginationOptions.activo);
    }

    // Filtro por rol
    if (paginationOptions?.rol) {
      whereConditions.push(`e.rol = $${paramIndex++}`);
      params.push(paginationOptions.rol);
    }

    // Filtro de búsqueda en nombre y email
    if (paginationOptions?.search) {
      whereConditions.push(
        `(e.nombre ILIKE $${paramIndex} OR e.email ILIKE $${paramIndex})`,
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
      FROM empleados e
      ${whereClause}
    `;

    const countResult = await pool.query(countQuery, params);
    const totalElements = parseInt(countResult.rows[0].total);

    // Query principal con paginación
    const query = `
      SELECT 
        e.id,
        e.nombre,
        e.email,
        e.rol,
        e.prioridad,
        e.activo,
        e.created_at,
        e.updated_at
      FROM empleados e
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
   * Obtiene un empleado por ID
   */
  static async getEmpleadoById(empleadoId: number): Promise<Empleado | null> {
    try {
      const query = `
        SELECT id, nombre, email, rol, prioridad, activo, created_at, updated_at
        FROM empleados
        WHERE id = $1
      `;

      const result = await pool.query(query, [empleadoId]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error obteniendo empleado por ID:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo empleado
   */
  static async createEmpleado(
    empleadoData: CreateEmpleadoData,
  ): Promise<Empleado> {
    try {
      // Verificar que el email no exista
      const existingEmpleado = await pool.query(
        'SELECT id FROM empleados WHERE email = $1',
        [empleadoData.email],
      );

      if (existingEmpleado.rows.length > 0) {
        throw new Error('Ya existe un empleado con ese email');
      }

      // Hash de la contraseña
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(empleadoData.password, saltRounds);

      // Determinar prioridad inicial
      let prioridad = empleadoData.prioridad;
      if (!prioridad && empleadoData.rol === 'empleado') {
        // Obtener la prioridad más alta y agregar 1
        const maxPrioridadResult = await pool.query(
          "SELECT COALESCE(MAX(prioridad), 0) as max_prioridad FROM empleados WHERE activo = true AND rol = 'empleado'",
        );
        prioridad = maxPrioridadResult.rows[0].max_prioridad + 1;
      }

      const query = `
        INSERT INTO empleados (nombre, email, password_hash, rol, prioridad, activo, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
        RETURNING id, nombre, email, rol, prioridad, activo, created_at, updated_at
      `;

      const result = await pool.query(query, [
        empleadoData.nombre,
        empleadoData.email,
        passwordHash,
        empleadoData.rol,
        prioridad,
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error creando empleado:', error);
      throw error;
    }
  }

  /**
   * Actualiza un empleado existente
   */
  static async updateEmpleado(
    empleadoId: number,
    updateData: UpdateEmpleadoData,
  ): Promise<Empleado> {
    try {
      // Verificar que el empleado existe
      const existingEmpleado = await this.getEmpleadoById(empleadoId);
      if (!existingEmpleado) {
        throw new Error('Empleado no encontrado');
      }

      // Si se está actualizando el email, verificar que no exista otro con el mismo email
      if (updateData.email && updateData.email !== existingEmpleado.email) {
        const duplicateEmpleado = await pool.query(
          'SELECT id FROM empleados WHERE email = $1 AND id != $2',
          [updateData.email, empleadoId],
        );

        if (duplicateEmpleado.rows.length > 0) {
          throw new Error('Ya existe otro empleado con ese email');
        }
      }

      // Construir query dinámicamente
      const updateFields: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (updateData.nombre !== undefined) {
        updateFields.push(`nombre = $${paramIndex++}`);
        params.push(updateData.nombre);
      }

      if (updateData.email !== undefined) {
        updateFields.push(`email = $${paramIndex++}`);
        params.push(updateData.email);
      }

      if (updateData.password !== undefined) {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(updateData.password, saltRounds);
        updateFields.push(`password_hash = $${paramIndex++}`);
        params.push(passwordHash);
      }

      if (updateData.rol !== undefined) {
        updateFields.push(`rol = $${paramIndex++}`);
        params.push(updateData.rol);
      }

      if (updateData.prioridad !== undefined) {
        updateFields.push(`prioridad = $${paramIndex++}`);
        params.push(updateData.prioridad);
      }

      if (updateData.activo !== undefined) {
        updateFields.push(`activo = $${paramIndex++}`);
        params.push(updateData.activo);
      }

      if (updateFields.length === 0) {
        throw new Error('No se proporcionaron campos para actualizar');
      }

      updateFields.push(`updated_at = NOW()`);
      params.push(empleadoId);

      const query = `
        UPDATE empleados 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, nombre, email, rol, prioridad, activo, created_at, updated_at
      `;

      const result = await pool.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('Error actualizando empleado:', error);
      throw error;
    }
  }

  /**
   * Elimina un empleado (marca como inactivo)
   */
  static async deleteEmpleado(empleadoId: number): Promise<void> {
    try {
      // Verificar que el empleado existe
      const existingEmpleado = await this.getEmpleadoById(empleadoId);
      if (!existingEmpleado) {
        throw new Error('Empleado no encontrado');
      }

      // Verificar que no tenga selecciones activas
      const seleccionesActivas = await pool.query(
        'SELECT COUNT(*) as count FROM selecciones WHERE empleado_id = $1',
        [empleadoId],
      );

      if (parseInt(seleccionesActivas.rows[0].count) > 0) {
        throw new Error(
          'No se puede eliminar el empleado porque tiene selecciones activas',
        );
      }

      // Marcar como inactivo en lugar de eliminar físicamente
      await pool.query(
        'UPDATE empleados SET activo = false, updated_at = NOW() WHERE id = $1',
        [empleadoId],
      );
    } catch (error) {
      console.error('Error eliminando empleado:', error);
      throw error;
    }
  }

  /**
   * Cambia el rol de un empleado
   */
  static async cambiarRol(
    empleadoId: number,
    nuevoRol: 'admin' | 'empleado',
  ): Promise<Empleado> {
    try {
      // Verificar que el empleado existe
      const existingEmpleado = await this.getEmpleadoById(empleadoId);
      if (!existingEmpleado) {
        throw new Error('Empleado no encontrado');
      }

      // Si está cambiando de admin a empleado, asignar prioridad
      let prioridad = existingEmpleado.prioridad;
      if (existingEmpleado.rol === 'admin' && nuevoRol === 'empleado') {
        const maxPrioridadResult = await pool.query(
          "SELECT COALESCE(MAX(prioridad), 0) as max_prioridad FROM empleados WHERE activo = true AND rol = 'empleado'",
        );
        prioridad = maxPrioridadResult.rows[0].max_prioridad + 1;
      }

      // Si está cambiando de empleado a admin, quitar prioridad
      if (existingEmpleado.rol === 'empleado' && nuevoRol === 'admin') {
        prioridad = null;
      }

      const query = `
        UPDATE empleados 
        SET rol = $1, prioridad = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING id, nombre, email, rol, prioridad, activo, created_at, updated_at
      `;

      const result = await pool.query(query, [nuevoRol, prioridad, empleadoId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error cambiando rol de empleado:', error);
      throw error;
    }
  }

  /**
   * Cambia la prioridad de un empleado
   */
  static async cambiarPrioridad(
    empleadoId: number,
    nuevaPrioridad: number,
  ): Promise<Empleado> {
    try {
      // Verificar que el empleado existe y es empleado (no admin)
      const existingEmpleado = await this.getEmpleadoById(empleadoId);
      if (!existingEmpleado) {
        throw new Error('Empleado no encontrado');
      }

      if (existingEmpleado.rol === 'admin') {
        throw new Error('No se puede cambiar la prioridad de un administrador');
      }

      // Verificar que la prioridad no esté ocupada por otro empleado
      const prioridadOcupada = await pool.query(
        "SELECT id FROM empleados WHERE prioridad = $1 AND id != $2 AND activo = true AND rol = 'empleado'",
        [nuevaPrioridad, empleadoId],
      );

      if (prioridadOcupada.rows.length > 0) {
        throw new Error('La prioridad ya está ocupada por otro empleado');
      }

      const query = `
        UPDATE empleados 
        SET prioridad = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, nombre, email, rol, prioridad, activo, created_at, updated_at
      `;

      const result = await pool.query(query, [nuevaPrioridad, empleadoId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error cambiando prioridad de empleado:', error);
      throw error;
    }
  }

  /**
   * Resetea todas las prioridades de empleados (1-20)
   */
  static async resetearPrioridades(): Promise<void> {
    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Obtener todos los empleados activos ordenados por ID
        const empleadosResult = await client.query(
          "SELECT id FROM empleados WHERE activo = true AND rol = 'empleado' ORDER BY id",
        );

        const empleados = empleadosResult.rows;
        if (empleados.length === 0) {
          throw new Error('No hay empleados activos para resetear prioridades');
        }

        // Asignar prioridades secuenciales (1, 2, 3, ...)
        for (let i = 0; i < empleados.length; i++) {
          await client.query(
            'UPDATE empleados SET prioridad = $1, updated_at = NOW() WHERE id = $2',
            [i + 1, empleados[i].id],
          );
        }

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error reseteando prioridades:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los empleados activos (sin paginación)
   */
  static async getEmpleadosActivos(): Promise<Empleado[]> {
    try {
      const query = `
        SELECT id, nombre, email, rol, prioridad, activo, created_at, updated_at
        FROM empleados
        WHERE activo = true
        ORDER BY rol DESC, prioridad ASC
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo empleados activos:', error);
      throw error;
    }
  }

  /**
   * Obtiene empleados por rol
   */
  static async getEmpleadosPorRol(rol: string): Promise<Empleado[]> {
    try {
      const query = `
        SELECT id, nombre, email, rol, prioridad, activo, created_at, updated_at
        FROM empleados
        WHERE rol = $1 AND activo = true
        ORDER BY nombre
      `;

      const result = await pool.query(query, [rol]);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo empleados por rol:', error);
      throw error;
    }
  }
}
