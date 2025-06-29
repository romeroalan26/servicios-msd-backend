import { Request, Response } from 'express';
import { TurnoService } from '../services/turnoService';
import { CreateTurnoData, UpdateTurnoData } from '../models/turno';
import { ApiResponseBuilder, PaginationOptions } from '../models/apiResponse';

export class TurnoController {
  /**
   * @openapi
   * /api/turnos:
   *   get:
   *     summary: Obtener todos los turnos
   *     description: Retorna la lista de todos los turnos con paginación y filtros opcionales.
   *     tags: [Turnos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Número de página (mínimo 1)
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: Elementos por página (mínimo 1, máximo 100)
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           default: t.id
   *           enum: [t.id, t.codigo, t.nombre, t.descripcion, t.activo, t.created_at, t.updated_at]
   *         description: Campo para ordenar los resultados
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: asc
   *         description: Orden de clasificación (ascendente o descendente)
   *       - in: query
   *         name: activo
   *         schema:
   *           type: boolean
   *         description: Filtrar por estado activo/inactivo
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Buscar en código, nombre y descripción del turno
   *     responses:
   *       200:
   *         description: Lista de turnos obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Turno'
   *                     pagination:
   *                       $ref: '#/components/schemas/PaginationInfo'
   *             example:
   *               success: true
   *               data:
   *                 - id: 1
   *                   codigo: "CA"
   *                   nombre: "Cabina"
   *                   descripcion: "Posición en cabina de control"
   *                   activo: true
   *                   created_at: "2024-01-15T10:30:00.000Z"
   *                   updated_at: "2024-01-15T10:30:00.000Z"
   *                 - id: 2
   *                   codigo: "OF"
   *                   nombre: "Oficina"
   *                   descripcion: "Posición en oficina administrativa"
   *                   activo: true
   *                   created_at: "2024-01-15T10:30:00.000Z"
   *                   updated_at: "2024-01-15T10:30:00.000Z"
   *               pagination:
   *                 page: 1
   *                 limit: 10
   *                 totalElements: 8
   *                 totalPages: 1
   *                 hasNext: false
   *                 hasPrevious: false
   *               message: "Turnos obtenidos exitosamente"
   *               timestamp: "2024-01-15T10:30:00.000Z"
   *       400:
   *         description: Parámetros de paginación inválidos
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "La página debe ser mayor a 0"
   *       401:
   *         description: No autenticado
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Token no proporcionado"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Error interno del servidor"
   */
  static async getTurnos(req: Request, res: Response): Promise<void> {
    try {
      // Extraer parámetros de paginación
      const page = parseInt(req.query.page as string);
      const limit = parseInt(req.query.limit as string);

      const paginationOptions: PaginationOptions = {
        page: isNaN(page) ? 1 : page,
        limit: isNaN(limit) ? 10 : limit,
        sortBy: (req.query.sortBy as string) || 't.id',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
        activo:
          req.query.activo !== undefined
            ? req.query.activo === 'true'
            : undefined,
        search: req.query.search as string,
      };

      // Validar parámetros
      if ((paginationOptions.page ?? 1) < 1) {
        res
          .status(400)
          .json(ApiResponseBuilder.error('La página debe ser mayor a 0'));
        return;
      }

      if (
        (paginationOptions.limit ?? 10) < 1 ||
        (paginationOptions.limit ?? 10) > 100
      ) {
        res
          .status(400)
          .json(ApiResponseBuilder.error('El límite debe estar entre 1 y 100'));
        return;
      }

      const result = await TurnoService.getTurnos(paginationOptions);

      res.json(
        ApiResponseBuilder.paginated(
          result.data,
          result.pagination.page,
          result.pagination.limit,
          result.pagination.totalElements,
          'Turnos obtenidos exitosamente',
        ),
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json(ApiResponseBuilder.error(errorMessage));
    }
  }

  /**
   * @openapi
   * /api/turnos/{id}:
   *   get:
   *     summary: Obtener un turno específico
   *     description: Retorna un turno específico por su ID.
   *     tags: [Turnos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: ID del turno
   *     responses:
   *       200:
   *         description: Turno obtenido exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/Turno'
   *             example:
   *               success: true
   *               data:
   *                 id: 1
   *                 codigo: "CA"
   *                 nombre: "Cabina"
   *                 descripcion: "Posición en cabina de control"
   *                 activo: true
   *                 created_at: "2024-01-15T10:30:00.000Z"
   *                 updated_at: "2024-01-15T10:30:00.000Z"
   *               message: "Turno obtenido exitosamente"
   *               timestamp: "2024-01-15T10:30:00.000Z"
   *       400:
   *         description: ID de turno inválido
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "ID de turno inválido"
   *       401:
   *         description: No autenticado
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Token no proporcionado"
   *       404:
   *         description: Turno no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Turno no encontrado"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Error interno del servidor"
   */
  static async getTurno(req: Request, res: Response): Promise<void> {
    try {
      const turnoId = parseInt(req.params.id);

      if (isNaN(turnoId)) {
        res.status(400).json(ApiResponseBuilder.error('ID de turno inválido'));
        return;
      }

      const turno = await TurnoService.getTurnoById(turnoId);

      if (!turno) {
        res.status(404).json(ApiResponseBuilder.error('Turno no encontrado'));
        return;
      }

      res.json(
        ApiResponseBuilder.success(turno, 'Turno obtenido exitosamente'),
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json(ApiResponseBuilder.error(errorMessage));
    }
  }

  /**
   * @openapi
   * /api/turnos:
   *   post:
   *     summary: Crear un nuevo turno
   *     description: Crea un nuevo turno. Solo los administradores pueden crear turnos.
   *     tags: [Turnos]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - codigo
   *               - nombre
   *               - descripcion
   *             properties:
   *               codigo:
   *                 type: string
   *                 maxLength: 10
   *                 description: "Código único del turno (ej: CA, OF, GU)"
   *                 example: "CA"
   *               nombre:
   *                 type: string
   *                 maxLength: 100
   *                 description: Nombre del turno
   *                 example: "Cabina"
   *               descripcion:
   *                 type: string
   *                 maxLength: 500
   *                 description: Descripción detallada del turno
   *                 example: "Posición en cabina de control"
   *           example:
   *             codigo: "CA"
   *             nombre: "Cabina"
   *             descripcion: "Posición en cabina de control"
   *     responses:
   *       201:
   *         description: Turno creado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/Turno'
   *             example:
   *               success: true
   *               data:
   *                 id: 9
   *                 codigo: "CA"
   *                 nombre: "Cabina"
   *                 descripcion: "Posición en cabina de control"
   *                 activo: true
   *                 created_at: "2024-01-15T10:30:00.000Z"
   *                 updated_at: "2024-01-15T10:30:00.000Z"
   *               message: "Turno creado exitosamente"
   *               timestamp: "2024-01-15T10:30:00.000Z"
   *       400:
   *         description: Datos inválidos
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Código, nombre y descripción son requeridos"
   *       401:
   *         description: No autenticado
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Token no proporcionado"
   *       403:
   *         description: Acceso denegado (solo administradores)
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Acceso denegado. Se requieren permisos de administrador"
   *       409:
   *         description: Conflicto - código ya existe
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Ya existe un turno con ese código"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Error interno del servidor"
   */
  static async createTurno(req: Request, res: Response): Promise<void> {
    try {
      const turnoData: CreateTurnoData = req.body;

      // Validar campos requeridos
      if (!turnoData.codigo || !turnoData.nombre || !turnoData.descripcion) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error(
              'Código, nombre y descripción son requeridos',
            ),
          );
        return;
      }

      // Validar longitud de campos
      if (turnoData.codigo.length > 10) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error(
              'El código no puede tener más de 10 caracteres',
            ),
          );
        return;
      }

      if (turnoData.nombre.length > 100) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error(
              'El nombre no puede tener más de 100 caracteres',
            ),
          );
        return;
      }

      if (turnoData.descripcion.length > 500) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error(
              'La descripción no puede tener más de 500 caracteres',
            ),
          );
        return;
      }

      const nuevoTurno = await TurnoService.createTurno(turnoData);

      res
        .status(201)
        .json(
          ApiResponseBuilder.success(nuevoTurno, 'Turno creado exitosamente'),
        );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';

      // Manejar errores específicos
      if (errorMessage.includes('Ya existe un turno con ese código')) {
        res.status(409).json(ApiResponseBuilder.error(errorMessage));
      } else {
        res.status(500).json(ApiResponseBuilder.error(errorMessage));
      }
    }
  }

  /**
   * @openapi
   * /api/turnos/{id}:
   *   put:
   *     summary: Actualizar un turno
   *     description: Actualiza un turno existente. Solo los administradores pueden actualizar turnos.
   *     tags: [Turnos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: ID del turno
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               codigo:
   *                 type: string
   *                 maxLength: 10
   *                 description: Código único del turno
   *                 example: "CA"
   *               nombre:
   *                 type: string
   *                 maxLength: 100
   *                 description: Nombre del turno
   *                 example: "Cabina de Control"
   *               descripcion:
   *                 type: string
   *                 maxLength: 500
   *                 description: Descripción detallada del turno
   *                 example: "Posición en cabina de control principal"
   *               activo:
   *                 type: boolean
   *                 description: Estado activo/inactivo del turno
   *                 example: true
   *           example:
   *             nombre: "Cabina de Control"
   *             descripcion: "Posición en cabina de control principal"
   *     responses:
   *       200:
   *         description: Turno actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/Turno'
   *             example:
   *               success: true
   *               data:
   *                 id: 1
   *                 codigo: "CA"
   *                 nombre: "Cabina de Control"
   *                 descripcion: "Posición en cabina de control principal"
   *                 activo: true
   *                 created_at: "2024-01-15T10:30:00.000Z"
   *                 updated_at: "2024-01-15T10:35:00.000Z"
   *               message: "Turno actualizado exitosamente"
   *               timestamp: "2024-01-15T10:35:00.000Z"
   *       400:
   *         description: Datos inválidos
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "ID de turno inválido"
   *       401:
   *         description: No autenticado
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Token no proporcionado"
   *       403:
   *         description: Acceso denegado (solo administradores)
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Acceso denegado. Se requieren permisos de administrador"
   *       404:
   *         description: Turno no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Turno no encontrado"
   *       409:
   *         description: Conflicto - código ya existe
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Ya existe otro turno con ese código"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Error interno del servidor"
   */
  static async updateTurno(req: Request, res: Response): Promise<void> {
    try {
      const turnoId = parseInt(req.params.id);
      const updateData: UpdateTurnoData = req.body;

      if (isNaN(turnoId)) {
        res.status(400).json(ApiResponseBuilder.error('ID de turno inválido'));
        return;
      }

      // Validar que al menos un campo se proporcione
      if (
        updateData.codigo === undefined &&
        updateData.nombre === undefined &&
        updateData.descripcion === undefined &&
        updateData.activo === undefined
      ) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error(
              'Debe proporcionar al menos un campo para actualizar',
            ),
          );
        return;
      }

      // Validar longitud de campos si se proporcionan
      if (updateData.codigo && updateData.codigo.length > 10) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error(
              'El código no puede tener más de 10 caracteres',
            ),
          );
        return;
      }

      if (updateData.nombre && updateData.nombre.length > 100) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error(
              'El nombre no puede tener más de 100 caracteres',
            ),
          );
        return;
      }

      if (updateData.descripcion && updateData.descripcion.length > 500) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error(
              'La descripción no puede tener más de 500 caracteres',
            ),
          );
        return;
      }

      const turnoActualizado = await TurnoService.updateTurno(
        turnoId,
        updateData,
      );

      res.json(
        ApiResponseBuilder.success(
          turnoActualizado,
          'Turno actualizado exitosamente',
        ),
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';

      // Manejar errores específicos
      if (errorMessage.includes('Turno no encontrado')) {
        res.status(404).json(ApiResponseBuilder.error(errorMessage));
      } else if (errorMessage.includes('Ya existe otro turno con ese código')) {
        res.status(409).json(ApiResponseBuilder.error(errorMessage));
      } else {
        res.status(500).json(ApiResponseBuilder.error(errorMessage));
      }
    }
  }

  /**
   * @openapi
   * /api/turnos/{id}:
   *   delete:
   *     summary: Eliminar un turno
   *     description: Marca un turno como inactivo. Solo los administradores pueden eliminar turnos. No se puede eliminar un turno que esté siendo usado en servicios.
   *     tags: [Turnos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: ID del turno
   *     responses:
   *       200:
   *         description: Turno eliminado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: null
   *                     message:
   *                       type: string
   *                       example: "Turno eliminado exitosamente"
   *             example:
   *               success: true
   *               data: null
   *               message: "Turno eliminado exitosamente"
   *               timestamp: "2024-01-15T10:40:00.000Z"
   *       400:
   *         description: ID de turno inválido
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "ID de turno inválido"
   *       401:
   *         description: No autenticado
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Token no proporcionado"
   *       403:
   *         description: Acceso denegado (solo administradores)
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Acceso denegado. Se requieren permisos de administrador"
   *       404:
   *         description: Turno no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Turno no encontrado"
   *       409:
   *         description: Conflicto - turno en uso
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "No se puede eliminar el turno porque está siendo usado en servicios"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Error interno del servidor"
   */
  static async deleteTurno(req: Request, res: Response): Promise<void> {
    try {
      const turnoId = parseInt(req.params.id);

      if (isNaN(turnoId)) {
        res.status(400).json(ApiResponseBuilder.error('ID de turno inválido'));
        return;
      }

      await TurnoService.deleteTurno(turnoId);

      res.json(
        ApiResponseBuilder.success(null, 'Turno eliminado exitosamente'),
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';

      // Manejar errores específicos
      if (errorMessage.includes('Turno no encontrado')) {
        res.status(404).json(ApiResponseBuilder.error(errorMessage));
      } else if (errorMessage.includes('está siendo usado en servicios')) {
        res.status(409).json(ApiResponseBuilder.error(errorMessage));
      } else {
        res.status(500).json(ApiResponseBuilder.error(errorMessage));
      }
    }
  }

  /**
   * @openapi
   * /api/turnos/activos:
   *   get:
   *     summary: Obtener turnos activos
   *     description: Retorna la lista de todos los turnos activos sin paginación.
   *     tags: [Turnos]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de turnos activos obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Turno'
   *             example:
   *               success: true
   *               data:
   *                 - id: 1
   *                   codigo: "CA"
   *                   nombre: "Cabina"
   *                   descripcion: "Posición en cabina de control"
   *                   activo: true
   *                   created_at: "2024-01-15T10:30:00.000Z"
   *                   updated_at: "2024-01-15T10:30:00.000Z"
   *                 - id: 2
   *                   codigo: "OF"
   *                   nombre: "Oficina"
   *                   descripcion: "Posición en oficina administrativa"
   *                   activo: true
   *                   created_at: "2024-01-15T10:30:00.000Z"
   *                   updated_at: "2024-01-15T10:30:00.000Z"
   *               message: "Turnos activos obtenidos exitosamente"
   *               timestamp: "2024-01-15T10:30:00.000Z"
   *       401:
   *         description: No autenticado
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Token no proporcionado"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Error interno del servidor"
   */
  static async getTurnosActivos(req: Request, res: Response): Promise<void> {
    try {
      const turnos = await TurnoService.getTurnosActivos();

      res.json(
        ApiResponseBuilder.success(
          turnos,
          'Turnos activos obtenidos exitosamente',
        ),
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json(ApiResponseBuilder.error(errorMessage));
    }
  }
}
