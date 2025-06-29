import { Request, Response } from 'express';
import { EmpleadoService } from '../services/empleadoService';
import { ApiResponseBuilder } from '../models/apiResponse';

export class EmpleadoController {
  /**
   * @swagger
   * /api/empleados:
   *   get:
   *     summary: Obtiene lista de empleados con paginación
   *     tags: [Empleados]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número de página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Elementos por página
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           default: id
   *         description: Campo para ordenar
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: asc
   *         description: Orden de clasificación
   *       - in: query
   *         name: activo
   *         schema:
   *           type: boolean
   *         description: Filtrar por estado activo
   *       - in: query
   *         name: rol
   *         schema:
   *           type: string
   *           enum: [empleado, admin]
   *         description: Filtrar por rol
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Buscar en nombre y email
   *     responses:
   *       200:
   *         description: Lista de empleados obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Empleado'
   *                 pagination:
   *                   $ref: '#/components/schemas/Pagination'
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Acceso denegado
   */
  static async getEmpleados(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder, activo, rol, search } = req.query;

      const paginationOptions = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        activo: activo !== undefined ? activo === 'true' : undefined,
        rol: rol as 'empleado' | 'admin',
        search: search as string,
      };

      const result = await EmpleadoService.getEmpleados(paginationOptions);

      res.json(
        ApiResponseBuilder.paginated(
          result.data,
          result.pagination.page,
          result.pagination.limit,
          result.pagination.totalElements,
          'Empleados obtenidos exitosamente',
        ),
      );
    } catch (error) {
      console.error('Error obteniendo empleados:', error);
      res
        .status(500)
        .json(
          ApiResponseBuilder.error(
            error instanceof Error
              ? error.message
              : 'Error interno del servidor',
          ),
        );
    }
  }

  /**
   * @swagger
   * /api/empleados/{id}:
   *   get:
   *     summary: Obtiene un empleado por ID
   *     tags: [Empleados]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del empleado
   *     responses:
   *       200:
   *         description: Empleado obtenido exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Empleado'
   *       404:
   *         description: Empleado no encontrado
   *       401:
   *         description: No autorizado
   */
  static async getEmpleadoById(req: Request, res: Response): Promise<void> {
    try {
      const empleadoId = parseInt(req.params.id);

      if (isNaN(empleadoId)) {
        res
          .status(400)
          .json(ApiResponseBuilder.error('ID de empleado inválido'));
        return;
      }

      const empleado = await EmpleadoService.getEmpleadoById(empleadoId);

      if (!empleado) {
        res
          .status(404)
          .json(ApiResponseBuilder.error('Empleado no encontrado'));
        return;
      }

      res.json(
        ApiResponseBuilder.success(empleado, 'Empleado obtenido exitosamente'),
      );
    } catch (error) {
      console.error('Error obteniendo empleado:', error);
      res
        .status(500)
        .json(
          ApiResponseBuilder.error(
            error instanceof Error
              ? error.message
              : 'Error interno del servidor',
          ),
        );
    }
  }

  /**
   * @swagger
   * /api/empleados:
   *   post:
   *     summary: Crea un nuevo empleado
   *     tags: [Empleados]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nombre
   *               - email
   *               - password
   *               - rol
   *             properties:
   *               nombre:
   *                 type: string
   *                 description: Nombre completo del empleado
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email del empleado
   *               password:
   *                 type: string
   *                 minLength: 6
   *                 description: Contraseña del empleado
   *               rol:
   *                 type: string
   *                 enum: [empleado, admin]
   *                 description: Rol del empleado
   *               prioridad:
   *                 type: integer
   *                 minimum: 1
   *                 description: Prioridad para selección de servicios (solo empleados)
   *     responses:
   *       201:
   *         description: Empleado creado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Empleado'
   *       400:
   *         description: Datos inválidos
   *       409:
   *         description: Email ya existe
   *       401:
   *         description: No autorizado
   */
  static async createEmpleado(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, email, password, rol, prioridad } = req.body;

      // Validaciones básicas
      if (!nombre || !email || !password || !rol) {
        res
          .status(400)
          .json(ApiResponseBuilder.error('Todos los campos son requeridos'));
        return;
      }

      if (password.length < 6) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error(
              'La contraseña debe tener al menos 6 caracteres',
            ),
          );
        return;
      }

      if (!['empleado', 'admin'].includes(rol)) {
        res.status(400).json(ApiResponseBuilder.error('Rol inválido'));
        return;
      }

      const empleado = await EmpleadoService.createEmpleado({
        nombre,
        email,
        password,
        rol,
        prioridad,
      });

      res
        .status(201)
        .json(
          ApiResponseBuilder.success(empleado, 'Empleado creado exitosamente'),
        );
    } catch (error) {
      console.error('Error creando empleado:', error);

      if (error instanceof Error && error.message.includes('Ya existe')) {
        res.status(409).json(ApiResponseBuilder.error(error.message));
        return;
      }

      res
        .status(500)
        .json(
          ApiResponseBuilder.error(
            error instanceof Error
              ? error.message
              : 'Error interno del servidor',
          ),
        );
    }
  }

  /**
   * @swagger
   * /api/empleados/{id}:
   *   put:
   *     summary: Actualiza un empleado existente
   *     tags: [Empleados]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del empleado
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nombre:
   *                 type: string
   *                 description: Nombre completo del empleado
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email del empleado
   *               password:
   *                 type: string
   *                 minLength: 6
   *                 description: Nueva contraseña del empleado
   *               rol:
   *                 type: string
   *                 enum: [empleado, admin]
   *                 description: Rol del empleado
   *               prioridad:
   *                 type: integer
   *                 minimum: 1
   *                 description: Prioridad para selección de servicios
   *               activo:
   *                 type: boolean
   *                 description: Estado activo del empleado
   *     responses:
   *       200:
   *         description: Empleado actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Empleado'
   *       400:
   *         description: Datos inválidos
   *       404:
   *         description: Empleado no encontrado
   *       409:
   *         description: Email ya existe
   *       401:
   *         description: No autorizado
   */
  static async updateEmpleado(req: Request, res: Response): Promise<void> {
    try {
      const empleadoId = parseInt(req.params.id);
      const updateData = req.body;

      if (isNaN(empleadoId)) {
        res
          .status(400)
          .json(ApiResponseBuilder.error('ID de empleado inválido'));
        return;
      }

      // Validaciones básicas
      if (updateData.password && updateData.password.length < 6) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error(
              'La contraseña debe tener al menos 6 caracteres',
            ),
          );
        return;
      }

      if (updateData.rol && !['empleado', 'admin'].includes(updateData.rol)) {
        res.status(400).json(ApiResponseBuilder.error('Rol inválido'));
        return;
      }

      const empleado = await EmpleadoService.updateEmpleado(
        empleadoId,
        updateData,
      );

      res.json(
        ApiResponseBuilder.success(
          empleado,
          'Empleado actualizado exitosamente',
        ),
      );
    } catch (error) {
      console.error('Error actualizando empleado:', error);

      if (error instanceof Error && error.message.includes('no encontrado')) {
        res.status(404).json(ApiResponseBuilder.error(error.message));
        return;
      }

      if (error instanceof Error && error.message.includes('Ya existe')) {
        res.status(409).json(ApiResponseBuilder.error(error.message));
        return;
      }

      res
        .status(500)
        .json(
          ApiResponseBuilder.error(
            error instanceof Error
              ? error.message
              : 'Error interno del servidor',
          ),
        );
    }
  }

  /**
   * @swagger
   * /api/empleados/{id}:
   *   delete:
   *     summary: Elimina un empleado (marca como inactivo)
   *     tags: [Empleados]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del empleado
   *     responses:
   *       200:
   *         description: Empleado eliminado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *       400:
   *         description: No se puede eliminar (tiene selecciones activas)
   *       404:
   *         description: Empleado no encontrado
   *       401:
   *         description: No autorizado
   */
  static async deleteEmpleado(req: Request, res: Response): Promise<void> {
    try {
      const empleadoId = parseInt(req.params.id);

      if (isNaN(empleadoId)) {
        res
          .status(400)
          .json(ApiResponseBuilder.error('ID de empleado inválido'));
        return;
      }

      await EmpleadoService.deleteEmpleado(empleadoId);

      res.json(
        ApiResponseBuilder.success(null, 'Empleado eliminado exitosamente'),
      );
    } catch (error) {
      console.error('Error eliminando empleado:', error);

      if (error instanceof Error && error.message.includes('no encontrado')) {
        res.status(404).json(ApiResponseBuilder.error(error.message));
        return;
      }

      if (
        error instanceof Error &&
        error.message.includes('selecciones activas')
      ) {
        res.status(400).json(ApiResponseBuilder.error(error.message));
        return;
      }

      res
        .status(500)
        .json(
          ApiResponseBuilder.error(
            error instanceof Error
              ? error.message
              : 'Error interno del servidor',
          ),
        );
    }
  }

  /**
   * @swagger
   * /api/empleados/{id}/rol:
   *   put:
   *     summary: Cambia el rol de un empleado
   *     tags: [Empleados]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del empleado
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - rol
   *             properties:
   *               rol:
   *                 type: string
   *                 enum: [empleado, admin]
   *                 description: Nuevo rol del empleado
   *     responses:
   *       200:
   *         description: Rol cambiado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Empleado'
   *       400:
   *         description: Rol inválido
   *       404:
   *         description: Empleado no encontrado
   *       401:
   *         description: No autorizado
   */
  static async cambiarRol(req: Request, res: Response): Promise<void> {
    try {
      const empleadoId = parseInt(req.params.id);
      const { rol } = req.body;

      if (isNaN(empleadoId)) {
        res
          .status(400)
          .json(ApiResponseBuilder.error('ID de empleado inválido'));
        return;
      }

      if (!rol || !['empleado', 'admin'].includes(rol)) {
        res.status(400).json(ApiResponseBuilder.error('Rol inválido'));
        return;
      }

      const empleado = await EmpleadoService.cambiarRol(empleadoId, rol);

      res.json(
        ApiResponseBuilder.success(empleado, 'Rol cambiado exitosamente'),
      );
    } catch (error) {
      console.error('Error cambiando rol:', error);

      if (error instanceof Error && error.message.includes('no encontrado')) {
        res.status(404).json(ApiResponseBuilder.error(error.message));
        return;
      }

      res
        .status(500)
        .json(
          ApiResponseBuilder.error(
            error instanceof Error
              ? error.message
              : 'Error interno del servidor',
          ),
        );
    }
  }

  /**
   * @swagger
   * /api/empleados/{id}/prioridad:
   *   put:
   *     summary: Cambia la prioridad de un empleado
   *     tags: [Empleados]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del empleado
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - prioridad
   *             properties:
   *               prioridad:
   *                 type: integer
   *                 minimum: 1
   *                 description: Nueva prioridad del empleado
   *     responses:
   *       200:
   *         description: Prioridad cambiada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Empleado'
   *       400:
   *         description: Prioridad inválida o ya ocupada
   *       404:
   *         description: Empleado no encontrado
   *       401:
   *         description: No autorizado
   */
  static async cambiarPrioridad(req: Request, res: Response): Promise<void> {
    try {
      const empleadoId = parseInt(req.params.id);
      const { prioridad } = req.body;

      if (isNaN(empleadoId)) {
        res
          .status(400)
          .json(ApiResponseBuilder.error('ID de empleado inválido'));
        return;
      }

      if (!prioridad || prioridad < 1) {
        res.status(400).json(ApiResponseBuilder.error('Prioridad inválida'));
        return;
      }

      const empleado = await EmpleadoService.cambiarPrioridad(
        empleadoId,
        prioridad,
      );

      res.json(
        ApiResponseBuilder.success(empleado, 'Prioridad cambiada exitosamente'),
      );
    } catch (error) {
      console.error('Error cambiando prioridad:', error);

      if (error instanceof Error && error.message.includes('no encontrado')) {
        res.status(404).json(ApiResponseBuilder.error(error.message));
        return;
      }

      if (error instanceof Error && error.message.includes('administrador')) {
        res.status(400).json(ApiResponseBuilder.error(error.message));
        return;
      }

      if (error instanceof Error && error.message.includes('ya está ocupada')) {
        res.status(400).json(ApiResponseBuilder.error(error.message));
        return;
      }

      res
        .status(500)
        .json(
          ApiResponseBuilder.error(
            error instanceof Error
              ? error.message
              : 'Error interno del servidor',
          ),
        );
    }
  }

  /**
   * @swagger
   * /api/empleados/reset-prioridades:
   *   post:
   *     summary: Resetea todas las prioridades de empleados (1-20)
   *     tags: [Empleados]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Prioridades reseteadas exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *       400:
   *         description: No hay empleados activos
   *       401:
   *         description: No autorizado
   */
  static async resetearPrioridades(req: Request, res: Response): Promise<void> {
    try {
      await EmpleadoService.resetearPrioridades();

      res.json(
        ApiResponseBuilder.success(null, 'Prioridades reseteadas exitosamente'),
      );
    } catch (error) {
      console.error('Error reseteando prioridades:', error);

      if (
        error instanceof Error &&
        error.message.includes('No hay empleados')
      ) {
        res.status(400).json(ApiResponseBuilder.error(error.message));
        return;
      }

      res
        .status(500)
        .json(
          ApiResponseBuilder.error(
            error instanceof Error
              ? error.message
              : 'Error interno del servidor',
          ),
        );
    }
  }

  /**
   * @swagger
   * /api/empleados/activos:
   *   get:
   *     summary: Obtiene todos los empleados activos (sin paginación)
   *     tags: [Empleados]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de empleados activos obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Empleado'
   *       401:
   *         description: No autorizado
   */
  static async getEmpleadosActivos(req: Request, res: Response): Promise<void> {
    try {
      const empleados = await EmpleadoService.getEmpleadosActivos();

      res.json(
        ApiResponseBuilder.success(
          empleados,
          'Empleados activos obtenidos exitosamente',
        ),
      );
    } catch (error) {
      console.error('Error obteniendo empleados activos:', error);
      res
        .status(500)
        .json(
          ApiResponseBuilder.error(
            error instanceof Error
              ? error.message
              : 'Error interno del servidor',
          ),
        );
    }
  }
}
