import { Request, Response } from 'express';
import { SeleccionService } from '../services/seleccionService';
import { CreateSeleccionData } from '../models/seleccion';
import { ApiResponseBuilder } from '../models/apiResponse';

export class SeleccionController {
  /**
   * @openapi
   * /api/selecciones/disponibles:
   *   get:
   *     summary: Obtener servicios disponibles para seleccionar
   *     description: Retorna la lista de servicios disponibles para el empleado con prioridad más alta. Solo los empleados con prioridad 1 pueden ver esta lista.
   *     tags: [Selecciones]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: anno
   *         schema:
   *           type: integer
   *           default: 2024
   *         description: Año para el cual obtener los servicios disponibles
   *     responses:
   *       200:
   *         description: Lista de servicios disponibles obtenida exitosamente
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
   *                             example: "Servicio de Guardia Nocturna"
   *                           descripcion:
   *                             type: string
   *                             example: "Guardia de seguridad en turno nocturno"
   *                           dias_totales:
   *                             type: integer
   *                             example: 183
   *                           dias_disponibles:
   *                             type: integer
   *                             example: 180
   *             example:
   *               success: true
   *               data:
   *                 - id: 1
   *                   nombre: "Servicio de Guardia Nocturna"
   *                   descripcion: "Guardia de seguridad en turno nocturno"
   *                   dias_totales: 183
   *                   dias_disponibles: 180
   *                 - id: 2
   *                   nombre: "Servicio de Operaciones Diurnas"
   *                   descripcion: "Operaciones técnicas durante el día"
   *                   dias_totales: 156
   *                   dias_disponibles: 155
   *               message: "Servicios disponibles obtenidos exitosamente"
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
   *       403:
   *         description: No autorizado para ver servicios disponibles
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "No tienes prioridad para seleccionar servicios"
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
  static async getServiciosDisponibles(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const empleadoId = req.user?.id;
      const anno =
        parseInt(req.query.anno as string) || new Date().getFullYear();

      // Verificar si el empleado puede ver servicios disponibles
      const puedeSeleccionar = await SeleccionService.puedeSeleccionarServicio(
        empleadoId!,
        anno,
      );
      if (!puedeSeleccionar) {
        res
          .status(403)
          .json(
            ApiResponseBuilder.error(
              'No tienes prioridad para seleccionar servicios en este momento',
            ),
          );
        return;
      }

      const servicios = await SeleccionService.getServiciosDisponibles(anno);

      res.json(
        ApiResponseBuilder.success(
          servicios,
          'Servicios disponibles obtenidos exitosamente',
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
   * /api/selecciones:
   *   post:
   *     summary: Seleccionar un servicio
   *     description: Permite a un empleado seleccionar un servicio disponible. Solo los empleados con prioridad 1 pueden seleccionar. Al seleccionar, la prioridad pasa al final.
   *     tags: [Selecciones]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - servicio_id
   *               - anno
   *             properties:
   *               servicio_id:
   *                 type: integer
   *                 minimum: 1
   *                 description: ID del servicio a seleccionar
   *                 example: 1
   *               anno:
   *                 type: integer
   *                 minimum: 2020
   *                 maximum: 2030
   *                 description: Año para el cual seleccionar el servicio
   *                 example: 2024
   *           example:
   *             servicio_id: 1
   *             anno: 2024
   *     responses:
   *       201:
   *         description: Servicio seleccionado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/Seleccion'
   *             example:
   *               success: true
   *               data:
   *                 id: 1
   *                 empleado_id: 1
   *                 servicio_id: 1
   *                 anno: 2024
   *                 created_at: "2024-01-15T10:30:00.000Z"
   *                 updated_at: "2024-01-15T10:30:00.000Z"
   *               message: "Servicio seleccionado exitosamente"
   *               timestamp: "2024-01-15T10:30:00.000Z"
   *       400:
   *         description: Datos de selección inválidos
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "El servicio ya no está disponible"
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
   *         description: No autorizado para seleccionar
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "No puedes seleccionar un servicio en este momento"
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
  static async crearSeleccion(req: Request, res: Response): Promise<void> {
    try {
      const empleadoId = req.user?.id;
      const { servicio_id, anno } = req.body;

      // Validar datos requeridos
      if (!servicio_id || !anno) {
        res
          .status(400)
          .json(ApiResponseBuilder.error('servicio_id y anno son requeridos'));
        return;
      }

      // Validar tipos de datos
      if (typeof servicio_id !== 'number' || servicio_id < 1) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error(
              'servicio_id debe ser un número mayor a 0',
            ),
          );
        return;
      }

      if (typeof anno !== 'number' || anno < 2020 || anno > 2030) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error(
              'anno debe ser un año válido entre 2020 y 2030',
            ),
          );
        return;
      }

      const seleccionData: CreateSeleccionData = {
        empleado_id: empleadoId!,
        servicio_id,
        anno,
      };

      const seleccion = await SeleccionService.crearSeleccion(seleccionData);

      res
        .status(201)
        .json(
          ApiResponseBuilder.success(
            seleccion,
            'Servicio seleccionado exitosamente',
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
   * /api/selecciones/mi-seleccion:
   *   get:
   *     summary: Obtener mi selección actual
   *     description: Retorna la selección actual del empleado autenticado para un año específico.
   *     tags: [Selecciones]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: anno
   *         schema:
   *           type: integer
   *           default: 2024
   *         description: Año para el cual obtener la selección
   *     responses:
   *       200:
   *         description: Selección obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/Seleccion'
   *             example:
   *               success: true
   *               data:
   *                 id: 1
   *                 empleado_id: 1
   *                 servicio_id: 1
   *                 anno: 2024
   *                 created_at: "2024-01-15T10:30:00.000Z"
   *                 updated_at: "2024-01-15T10:30:00.000Z"
   *               message: "Selección obtenida exitosamente"
   *               timestamp: "2024-01-15T10:30:00.000Z"
   *       404:
   *         description: No se encontró selección
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "No tienes una selección para este año"
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
  static async getMiSeleccion(req: Request, res: Response): Promise<void> {
    try {
      const empleadoId = req.user?.id;
      const anno =
        parseInt(req.query.anno as string) || new Date().getFullYear();

      const seleccion = await SeleccionService.getSeleccionEmpleado(
        empleadoId!,
        anno,
      );

      if (!seleccion) {
        res
          .status(404)
          .json(
            ApiResponseBuilder.error('No tienes una selección para este año'),
          );
        return;
      }

      res.json(
        ApiResponseBuilder.success(
          seleccion,
          'Selección obtenida exitosamente',
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
   * /api/selecciones/estado:
   *   get:
   *     summary: Obtener estado de selecciones
   *     description: Retorna información sobre el estado actual de las selecciones, incluyendo quién tiene prioridad y estadísticas.
   *     tags: [Selecciones]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: anno
   *         schema:
   *           type: integer
   *           default: 2024
   *         description: Año para el cual obtener el estado
   *     responses:
   *       200:
   *         description: Estado obtenido exitosamente
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
   *                         proximo_empleado:
   *                           type: object
   *                           nullable: true
   *                           properties:
   *                             id:
   *                               type: integer
   *                             nombre:
   *                               type: string
   *                             prioridad:
   *                               type: integer
   *                         estadisticas:
   *                           type: object
   *                           properties:
   *                             total_selecciones:
   *                               type: integer
   *                             servicios_seleccionados:
   *                               type: integer
   *                             empleados_con_seleccion:
   *                               type: integer
   *             example:
   *               success: true
   *               data:
   *                 proximo_empleado:
   *                   id: 2
   *                   nombre: "María García"
   *                   prioridad: 1
   *                 estadisticas:
   *                   total_selecciones: 5
   *                   servicios_seleccionados: 5
   *                   empleados_con_seleccion: 5
   *               message: "Estado obtenido exitosamente"
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
  static async getEstadoSelecciones(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const anno =
        parseInt(req.query.anno as string) || new Date().getFullYear();

      const [proximoEmpleado, estadisticas] = await Promise.all([
        SeleccionService.getEmpleadoConPrioridadMasAlta(anno),
        SeleccionService.getEstadisticasSelecciones(anno),
      ]);

      const estado = {
        proximo_empleado: proximoEmpleado,
        estadisticas,
      };

      res.json(
        ApiResponseBuilder.success(estado, 'Estado obtenido exitosamente'),
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json(ApiResponseBuilder.error(errorMessage));
    }
  }

  /**
   * @openapi
   * /api/selecciones/intercambiar-dia:
   *   patch:
   *     summary: Intercambiar días dentro del servicio seleccionado
   *     description: Permite a un empleado liberar un día y tomar otro disponible dentro de su propio servicio seleccionado para el año.
   *     tags: [Selecciones]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - liberar_dia_id
   *               - tomar_dia_id
   *               - anno
   *             properties:
   *               liberar_dia_id:
   *                 type: integer
   *                 description: ID del día a liberar
   *                 example: 123
   *               tomar_dia_id:
   *                 type: integer
   *                 description: ID del día a tomar
   *                 example: 456
   *               anno:
   *                 type: integer
   *                 description: Año de la selección
   *                 example: 2024
   *     responses:
   *       200:
   *         description: Intercambio realizado exitosamente
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
   *                         liberado:
   *                           type: integer
   *                           example: 123
   *                         tomado:
   *                           type: integer
   *                           example: 456
   *             example:
   *               success: true
   *               data:
   *                 liberado: 123
   *                 tomado: 456
   *               message: "Intercambio realizado exitosamente"
   *               timestamp: "2024-01-15T10:30:00.000Z"
   *       400:
   *         description: Datos inválidos o intercambio no permitido
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "El día a tomar no está disponible"
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
  static async intercambiarDia(req: Request, res: Response): Promise<void> {
    try {
      const empleadoId = req.user?.id;
      const { liberar_dia_id, tomar_dia_id, anno } = req.body;

      if (!liberar_dia_id || !tomar_dia_id || !anno) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error(
              'liberar_dia_id, tomar_dia_id y anno son requeridos',
            ),
          );
        return;
      }

      if (
        typeof liberar_dia_id !== 'number' ||
        typeof tomar_dia_id !== 'number' ||
        typeof anno !== 'number'
      ) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error(
              'Los parámetros deben ser números válidos',
            ),
          );
        return;
      }

      const resultado = await SeleccionService.intercambiarDia(
        empleadoId!,
        anno,
        liberar_dia_id,
        tomar_dia_id,
      );

      res.json(
        ApiResponseBuilder.success(
          resultado,
          'Intercambio realizado exitosamente',
        ),
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      res.status(400).json(ApiResponseBuilder.error(errorMessage));
    }
  }

  /**
   * @openapi
   * /api/selecciones/liberar:
   *   post:
   *     summary: Liberar selección de servicio (Solo Admin)
   *     description: Permite a un administrador liberar la selección de un empleado, eliminando su selección y moviendo su prioridad al final. Solo administradores pueden usar este endpoint.
   *     tags: [Selecciones]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - empleado_id
   *               - anno
   *             properties:
   *               empleado_id:
   *                 type: integer
   *                 description: ID del empleado cuya selección se va a liberar
   *                 example: 2
   *               anno:
   *                 type: integer
   *                 description: Año de la selección a liberar
   *                 example: 2024
   *     responses:
   *       200:
   *         description: Selección liberada exitosamente
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
   *                         empleado_id:
   *                           type: integer
   *                           example: 2
   *                         servicio_id:
   *                           type: integer
   *                           example: 1
   *                         anno:
   *                           type: integer
   *                           example: 2024
   *             example:
   *               success: true
   *               data:
   *                 empleado_id: 2
   *                 servicio_id: 1
   *                 anno: 2024
   *               message: "Selección liberada exitosamente"
   *               timestamp: "2024-01-15T10:30:00.000Z"
   *       400:
   *         description: Datos inválidos o empleado sin selección
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "El empleado no tiene una selección para este año"
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
   *         description: No autorizado (solo administradores)
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Acceso denegado. Se requiere rol de administrador"
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
  static async liberarSeleccion(req: Request, res: Response): Promise<void> {
    try {
      const { empleado_id, anno } = req.body;

      if (!empleado_id || !anno) {
        res
          .status(400)
          .json(ApiResponseBuilder.error('empleado_id y anno son requeridos'));
        return;
      }

      if (typeof empleado_id !== 'number' || typeof anno !== 'number') {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error(
              'Los parámetros deben ser números válidos',
            ),
          );
        return;
      }

      // Verificar que el empleado tenga una selección
      const seleccion = await SeleccionService.getSeleccionEmpleado(
        empleado_id,
        anno,
      );
      if (!seleccion) {
        res
          .status(400)
          .json(
            ApiResponseBuilder.error(
              'El empleado no tiene una selección para este año',
            ),
          );
        return;
      }

      // Liberar la selección
      await SeleccionService.liberarSeleccion(empleado_id, anno);

      res.json(
        ApiResponseBuilder.success(
          { empleado_id, servicio_id: seleccion.servicio_id, anno },
          'Selección liberada exitosamente',
        ),
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json(ApiResponseBuilder.error(errorMessage));
    }
  }
}
