import { Request, Response } from 'express';
import { ServicioService } from '../services/servicioService';
import { CreateServicioData, CreateServicioDiaData } from '../models/servicio';
import { ApiResponseBuilder, PaginationOptions } from '../models/apiResponse';

export class ServicioController {
  /**
   * @openapi
   * /api/servicios:
   *   get:
   *     summary: Obtener todos los servicios
   *     description: Retorna la lista de todos los servicios activos con sus días y paginación. Los empleados verán solo sus excepciones, mientras que los administradores ven todas las excepciones.
   *     tags: [Servicios]
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
   *           default: s.id
   *           enum: [s.id, s.nombre, s.descripcion, s.created_at, s.updated_at]
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
   *         description: Buscar en nombre y descripción del servicio
   *       - in: query
   *         name: fechaDesde
   *         schema:
   *           type: string
   *           format: date
   *         description: Filtrar servicios con días desde esta fecha (YYYY-MM-DD)
   *       - in: query
   *         name: fechaHasta
   *         schema:
   *           type: string
   *           format: date
   *         description: Filtrar servicios con días hasta esta fecha (YYYY-MM-DD)
   *       - in: query
   *         name: tanda
   *         schema:
   *           type: string
   *           enum: [mañana, tarde, noche]
   *         description: Filtrar por tanda específica
   *       - in: query
   *         name: turnoId
   *         schema:
   *           type: integer
   *         description: Filtrar por ID de turno específico
   *       - in: query
   *         name: incluirDias
   *         schema:
   *           type: boolean
   *           default: true
   *         description: Incluir información de días de servicio en la respuesta
   *       - in: query
   *         name: incluirExcepciones
   *         schema:
   *           type: boolean
   *           default: true
   *         description: Incluir información de excepciones en la respuesta
   *     responses:
   *       200:
   *         description: Lista de servicios obtenida exitosamente
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
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                             example: 1
   *                           nombre:
   *                             type: string
   *                             example: "Servicio de Guardia"
   *                           descripcion:
   *                             type: string
   *                             example: "Servicio de guardia en turno de noche"
   *                           activo:
   *                             type: boolean
   *                             example: true
   *                           dias:
   *                             type: array
   *                             items:
   *                               $ref: '#/components/schemas/ServicioDia'
   *                     pagination:
   *                       $ref: '#/components/schemas/PaginationInfo'
   *             example:
   *               success: true
   *               data:
   *                 - id: 1
   *                   nombre: "Servicio de Guardia"
   *                   descripcion: "Servicio de guardia en turno de noche"
   *                   activo: true
   *                   dias:
   *                     - id: 1
   *                       servicio_id: 1
   *                       fecha: "2024-01-15"
   *                       tanda: "noche"
   *                       turno_id: 1
   *                       turno_codigo: "GUA-NOC"
   *                       turno_nombre: "Guardia Nocturna"
   *               pagination:
   *                 page: 1
   *                 limit: 10
   *                 totalElements: 2
   *                 totalPages: 1
   *                 hasNext: false
   *                 hasPrevious: false
   *               message: "Servicios obtenidos exitosamente"
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
  static async getServicios(req: Request, res: Response): Promise<void> {
    try {
      const empleadoId = req.user?.id;

      // Extraer parámetros de paginación
      const page = parseInt(req.query.page as string);
      const limit = parseInt(req.query.limit as string);

      const paginationOptions: PaginationOptions = {
        page: isNaN(page) ? 1 : page,
        limit: isNaN(limit) ? 10 : limit,
        sortBy: (req.query.sortBy as string) || 's.id',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
        // Nuevos filtros
        activo:
          req.query.activo !== undefined
            ? req.query.activo === 'true'
            : undefined,
        search: req.query.search as string,
        fechaDesde: req.query.fechaDesde as string,
        fechaHasta: req.query.fechaHasta as string,
        tanda: req.query.tanda as string,
        turnoId: req.query.turnoId
          ? parseInt(req.query.turnoId as string)
          : undefined,
        incluirDias:
          req.query.incluirDias !== undefined
            ? req.query.incluirDias === 'true'
            : true,
        incluirExcepciones:
          req.query.incluirExcepciones !== undefined
            ? req.query.incluirExcepciones === 'true'
            : true,
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

      // Validar fechas
      if (
        paginationOptions.fechaDesde &&
        !/^\d{4}-\d{2}-\d{2}$/.test(paginationOptions.fechaDesde)
      ) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error(
              'Formato de fechaDesde inválido. Use YYYY-MM-DD',
            ),
          );
        return;
      }

      if (
        paginationOptions.fechaHasta &&
        !/^\d{4}-\d{2}-\d{2}$/.test(paginationOptions.fechaHasta)
      ) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error(
              'Formato de fechaHasta inválido. Use YYYY-MM-DD',
            ),
          );
        return;
      }

      // Validar rango de fechas
      if (paginationOptions.fechaDesde && paginationOptions.fechaHasta) {
        const desde = new Date(paginationOptions.fechaDesde);
        const hasta = new Date(paginationOptions.fechaHasta);
        if (desde > hasta) {
          res
            .status(400)
            .json(
              ApiResponseBuilder.error(
                'fechaDesde no puede ser mayor que fechaHasta',
              ),
            );
          return;
        }
      }

      // Validar tanda
      if (
        paginationOptions.tanda &&
        !['mañana', 'tarde', 'noche'].includes(paginationOptions.tanda)
      ) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error('Tanda debe ser: mañana, tarde o noche'),
          );
        return;
      }

      const result = await ServicioService.getServiciosConDias(
        empleadoId,
        paginationOptions,
      );

      res.json(
        ApiResponseBuilder.paginated(
          result.data,
          result.pagination.page,
          result.pagination.limit,
          result.pagination.totalElements,
          'Servicios obtenidos exitosamente',
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
   * /api/servicios/{id}:
   *   get:
   *     summary: Obtener un servicio específico
   *     description: Retorna un servicio específico con sus días. Los empleados verán solo sus excepciones, mientras que los administradores ven todas las excepciones.
   *     tags: [Servicios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: ID del servicio
   *       - in: query
   *         name: fechaDesde
   *         schema:
   *           type: string
   *           format: date
   *         description: Filtrar días desde esta fecha (YYYY-MM-DD)
   *       - in: query
   *         name: fechaHasta
   *         schema:
   *           type: string
   *           format: date
   *         description: Filtrar días hasta esta fecha (YYYY-MM-DD)
   *       - in: query
   *         name: tanda
   *         schema:
   *           type: string
   *           enum: [mañana, tarde, noche]
   *         description: Filtrar por tanda específica
   *       - in: query
   *         name: turnoId
   *         schema:
   *           type: integer
   *         description: Filtrar por ID de turno específico
   *       - in: query
   *         name: incluirExcepciones
   *         schema:
   *           type: boolean
   *           default: true
   *         description: Incluir información de excepciones en la respuesta
   *       - in: query
   *         name: soloFuturos
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Mostrar solo días futuros (desde hoy)
   *     responses:
   *       200:
   *         description: Servicio obtenido exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: integer
   *                           example: 1
   *                         nombre:
   *                           type: string
   *                           example: "Servicio de Guardia"
   *                         descripcion:
   *                           type: string
   *                           example: "Servicio de guardia en turno de noche"
   *                         activo:
   *                           type: boolean
   *                           example: true
   *                         dias:
   *                           type: array
   *                           items:
   *                             $ref: '#/components/schemas/ServicioDia'
   *             example:
   *               success: true
   *               data:
   *                 id: 1
   *                 nombre: "Servicio de Guardia"
   *                 descripcion: "Servicio de guardia en turno de noche"
   *                 activo: true
   *                 dias:
   *                   - id: 1
   *                     servicio_id: 1
   *                     fecha: "2024-01-15"
   *                     tanda: "noche"
   *                     turno_id: 1
   *                     turno_codigo: "GUA-NOC"
   *                     turno_nombre: "Guardia Nocturna"
   *               message: "Servicio obtenido exitosamente"
   *               timestamp: "2024-01-15T10:30:00.000Z"
   *       400:
   *         description: ID de servicio inválido
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "ID de servicio inválido"
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
   *         description: Servicio no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Servicio no encontrado"
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
  static async getServicio(req: Request, res: Response): Promise<void> {
    try {
      const servicioId = parseInt(req.params.id);
      const empleadoId = req.user?.id;

      if (isNaN(servicioId)) {
        res
          .status(400)
          .json(ApiResponseBuilder.error('ID de servicio inválido'));
        return;
      }

      // Procesar query parameters para filtros
      const filtros = {
        fechaDesde: req.query.fechaDesde as string,
        fechaHasta: req.query.fechaHasta as string,
        tanda: req.query.tanda as string,
        turnoId: req.query.turnoId
          ? parseInt(req.query.turnoId as string)
          : undefined,
        incluirExcepciones:
          req.query.incluirExcepciones !== undefined
            ? req.query.incluirExcepciones === 'true'
            : true,
        soloFuturos: req.query.soloFuturos === 'true',
      };

      // Validar fechas
      if (
        filtros.fechaDesde &&
        !/^\d{4}-\d{2}-\d{2}$/.test(filtros.fechaDesde)
      ) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error(
              'Formato de fechaDesde inválido. Use YYYY-MM-DD',
            ),
          );
        return;
      }

      if (
        filtros.fechaHasta &&
        !/^\d{4}-\d{2}-\d{2}$/.test(filtros.fechaHasta)
      ) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error(
              'Formato de fechaHasta inválido. Use YYYY-MM-DD',
            ),
          );
        return;
      }

      // Validar rango de fechas
      if (filtros.fechaDesde && filtros.fechaHasta) {
        const desde = new Date(filtros.fechaDesde);
        const hasta = new Date(filtros.fechaHasta);
        if (desde > hasta) {
          res
            .status(400)
            .json(
              ApiResponseBuilder.error(
                'fechaDesde no puede ser mayor que fechaHasta',
              ),
            );
          return;
        }
      }

      // Validar tanda
      if (
        filtros.tanda &&
        !['mañana', 'tarde', 'noche'].includes(filtros.tanda)
      ) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error('Tanda debe ser: mañana, tarde o noche'),
          );
        return;
      }

      // Si soloFuturos está activado, establecer fechaDesde como hoy
      if (filtros.soloFuturos) {
        const hoy = new Date().toISOString().split('T')[0];
        if (!filtros.fechaDesde || filtros.fechaDesde < hoy) {
          filtros.fechaDesde = hoy;
        }
      }

      const servicio = await ServicioService.getServicioConDias(
        servicioId,
        empleadoId,
        filtros,
      );

      if (!servicio) {
        res
          .status(404)
          .json(ApiResponseBuilder.error('Servicio no encontrado'));
        return;
      }

      res.json(
        ApiResponseBuilder.success(servicio, 'Servicio obtenido exitosamente'),
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json(ApiResponseBuilder.error(errorMessage));
    }
  }

  /**
   * @openapi
   * /api/servicios:
   *   post:
   *     summary: Crear un nuevo servicio
   *     description: Crea un nuevo servicio. Solo los administradores pueden crear servicios.
   *     tags: [Servicios]
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
   *               - descripcion
   *             properties:
   *               nombre:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 255
   *                 description: Nombre del servicio
   *                 example: "Servicio de Guardia"
   *               descripcion:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 1000
   *                 description: Descripción detallada del servicio
   *                 example: "Servicio de guardia en turno de noche para atención de emergencias"
   *           example:
   *             nombre: "Servicio de Guardia"
   *             descripcion: "Servicio de guardia en turno de noche para atención de emergencias"
   *     responses:
   *       201:
   *         description: Servicio creado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/Servicio'
   *             example:
   *               success: true
   *               data:
   *                 id: 1
   *                 nombre: "Servicio de Guardia"
   *                 descripcion: "Servicio de guardia en turno de noche para atención de emergencias"
   *                 activo: true
   *                 created_at: "2024-01-15T10:30:00.000Z"
   *                 updated_at: "2024-01-15T10:30:00.000Z"
   *               message: "Servicio creado exitosamente"
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
   *                       example: "Nombre y descripción son requeridos"
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
  static async createServicio(req: Request, res: Response): Promise<void> {
    try {
      const servicioData: CreateServicioData = req.body;

      // Validar campos requeridos
      if (!servicioData.nombre || !servicioData.descripcion) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error('Nombre y descripción son requeridos'),
          );
        return;
      }

      const nuevoServicio = await ServicioService.createServicio(servicioData);

      res
        .status(201)
        .json(
          ApiResponseBuilder.success(
            nuevoServicio,
            'Servicio creado exitosamente',
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
   * /api/servicios/{id}/dias:
   *   post:
   *     summary: Agregar día a un servicio
   *     description: Agrega un día específico a un servicio. Solo los administradores pueden agregar días a los servicios.
   *     tags: [Servicios]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: ID del servicio
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - fecha
   *               - tanda
   *               - turno_id
   *             properties:
   *               fecha:
   *                 type: string
   *                 format: date
   *                 description: Fecha del día de servicio (formato YYYY-MM-DD)
   *                 example: "2024-01-15"
   *               tanda:
   *                 type: string
   *                 enum: [mañana, tarde, noche]
   *                 description: Tanda del día
   *                 example: "noche"
   *               turno_id:
   *                 type: integer
   *                 minimum: 1
   *                 description: ID del turno asignado
   *                 example: 1
   *           example:
   *             fecha: "2024-01-15"
   *             tanda: "noche"
   *             turno_id: 1
   *     responses:
   *       201:
   *         description: Día agregado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/ServicioDia'
   *             example:
   *               success: true
   *               data:
   *                 id: 1
   *                 servicio_id: 1
   *                 fecha: "2024-01-15"
   *                 tanda: "noche"
   *                 turno_id: 1
   *                 turno_codigo: "GUA-NOC"
   *                 turno_nombre: "Guardia Nocturna"
   *                 created_at: "2024-01-15T10:30:00.000Z"
   *                 updated_at: "2024-01-15T10:30:00.000Z"
   *               message: "Día agregado exitosamente"
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
   *                       example: "Fecha, tanda y turno_id son requeridos"
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
   *         description: Servicio no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Servicio no encontrado"
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
  static async addDiaServicio(req: Request, res: Response): Promise<void> {
    try {
      const servicioId = parseInt(req.params.id);
      const diaData: CreateServicioDiaData = {
        ...req.body,
        servicio_id: servicioId,
      };

      if (isNaN(servicioId)) {
        res
          .status(400)
          .json(ApiResponseBuilder.error('ID de servicio inválido'));
        return;
      }

      // Validar campos requeridos
      if (!diaData.fecha || !diaData.tanda || !diaData.turno_id) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error('Fecha, tanda y turno_id son requeridos'),
          );
        return;
      }

      const nuevoDia = await ServicioService.addDiaServicio(diaData);

      res
        .status(201)
        .json(
          ApiResponseBuilder.success(nuevoDia, 'Día agregado exitosamente'),
        );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json(ApiResponseBuilder.error(errorMessage));
    }
  }
}
