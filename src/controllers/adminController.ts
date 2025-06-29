import { Request, Response } from 'express';
import { ServicioService } from '../services/servicioService';
import { AuditService } from '../services/auditService';
import { NotificationService } from '../services/notificationService';
import { ApiResponseBuilder } from '../models/apiResponse';

export class AdminController {
  /**
   * @openapi
   * /api/admin/servicios/{id}:
   *   put:
   *     summary: Actualizar un servicio (solo admin)
   *     description: Permite a los administradores actualizar la información de un servicio existente
   *     tags: [Administración]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del servicio a actualizar
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nombre:
   *                 type: string
   *                 description: Nombre del servicio
   *               descripcion:
   *                 type: string
   *                 description: Descripción del servicio
   *               activo:
   *                 type: boolean
   *                 description: Estado activo/inactivo del servicio
   *     responses:
   *       200:
   *         description: Servicio actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/Servicio'
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Servicio no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  static async updateServicio(req: Request, res: Response): Promise<void> {
    try {
      const servicioId = parseInt(req.params.id);
      const updateData = req.body;

      if (isNaN(servicioId)) {
        res
          .status(400)
          .json(ApiResponseBuilder.error('ID de servicio inválido'));
        return;
      }

      // Obtener datos anteriores para auditoría
      const servicioAnterior =
        await ServicioService.getServicioById(servicioId);
      if (!servicioAnterior) {
        res
          .status(404)
          .json(ApiResponseBuilder.error('Servicio no encontrado'));
        return;
      }

      // Actualizar servicio
      const servicioActualizado = await ServicioService.updateServicio(
        servicioId,
        updateData,
      );

      // Registrar en auditoría
      await AuditService.logUpdate(
        'servicios',
        servicioId,
        servicioAnterior,
        servicioActualizado,
        req.user?.id,
      );

      res.json(
        ApiResponseBuilder.success(
          servicioActualizado,
          'Servicio actualizado exitosamente',
        ),
      );
    } catch (error) {
      console.error('Error actualizando servicio:', error);
      res
        .status(500)
        .json(ApiResponseBuilder.error('Error interno del servidor'));
    }
  }

  /**
   * @openapi
   * /api/admin/servicios/{id}:
   *   delete:
   *     summary: Eliminar un servicio (solo admin)
   *     description: Permite a los administradores eliminar un servicio (marcar como inactivo)
   *     tags: [Administración]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del servicio a eliminar
   *     responses:
   *       200:
   *         description: Servicio eliminado exitosamente
   *       401:
   *         description: No autorizado
   *       404:
   *         description: Servicio no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  static async deleteServicio(req: Request, res: Response): Promise<void> {
    try {
      const servicioId = parseInt(req.params.id);

      if (isNaN(servicioId)) {
        res
          .status(400)
          .json(ApiResponseBuilder.error('ID de servicio inválido'));
        return;
      }

      // Obtener datos anteriores para auditoría
      const servicioAnterior =
        await ServicioService.getServicioById(servicioId);
      if (!servicioAnterior) {
        res
          .status(404)
          .json(ApiResponseBuilder.error('Servicio no encontrado'));
        return;
      }

      // Eliminar servicio (marcar como inactivo)
      await ServicioService.deleteServicio(servicioId);

      // Registrar en auditoría
      await AuditService.logDelete(
        'servicios',
        servicioId,
        servicioAnterior,
        req.user?.id,
      );

      res.json(
        ApiResponseBuilder.success(null, 'Servicio eliminado exitosamente'),
      );
    } catch (error) {
      console.error('Error eliminando servicio:', error);
      res
        .status(500)
        .json(ApiResponseBuilder.error('Error interno del servidor'));
    }
  }

  /**
   * @openapi
   * /api/admin/audit-log:
   *   get:
   *     summary: Obtener log de auditoría (solo admin)
   *     description: Permite a los administradores consultar el historial de auditoría del sistema
   *     tags: [Administración]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: tabla
   *         schema:
   *           type: string
   *         description: Filtrar por tabla específica
   *       - in: query
   *         name: accion
   *         schema:
   *           type: string
   *           enum: [CREATE, UPDATE, DELETE, SELECT, LOGIN, LOGOUT, SELECTION]
   *         description: Filtrar por tipo de acción
   *       - in: query
   *         name: usuario_id
   *         schema:
   *           type: integer
   *         description: Filtrar por ID de usuario
   *       - in: query
   *         name: fecha_desde
   *         schema:
   *           type: string
   *           format: date
   *         description: Filtrar desde esta fecha (YYYY-MM-DD)
   *       - in: query
   *         name: fecha_hasta
   *         schema:
   *           type: string
   *           format: date
   *         description: Filtrar hasta esta fecha (YYYY-MM-DD)
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 100
   *         description: Número máximo de registros a retornar
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: Número de registros a omitir
   *     responses:
   *       200:
   *         description: Log de auditoría obtenido exitosamente
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
   *                           tabla:
   *                             type: string
   *                           accion:
   *                             type: string
   *                           registro_id:
   *                             type: integer
   *                           datos_anteriores:
   *                             type: object
   *                           datos_nuevos:
   *                             type: object
   *                           usuario_id:
   *                             type: integer
   *                           usuario_nombre:
   *                             type: string
   *                           usuario_email:
   *                             type: string
   *                           created_at:
   *                             type: string
   *                             format: date-time
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  static async getAuditLog(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        tabla: req.query.tabla as string,
        accion: req.query.accion as string,
        usuario_id: req.query.usuario_id
          ? parseInt(req.query.usuario_id as string)
          : undefined,
        fecha_desde: req.query.fecha_desde as string,
        fecha_hasta: req.query.fecha_hasta as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const auditLog = await AuditService.getAuditLog(filters);

      res.json(
        ApiResponseBuilder.success(
          auditLog,
          'Log de auditoría obtenido exitosamente',
        ),
      );
    } catch (error) {
      console.error('Error obteniendo log de auditoría:', error);
      res
        .status(500)
        .json(ApiResponseBuilder.error('Error interno del servidor'));
    }
  }

  /**
   * @openapi
   * /api/admin/reset-anno:
   *   post:
   *     summary: Ejecutar reseteo anual (solo admin)
   *     description: Ejecuta el proceso de reseteo anual que limpia selecciones y recalcula prioridades
   *     tags: [Administración]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Reseteo anual ejecutado exitosamente
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
   *                         message:
   *                           type: string
   *                         timestamp:
   *                           type: string
   *                           format: date-time
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  static async executeResetAnno(req: Request, res: Response): Promise<void> {
    try {
      // Ejecutar reseteo anual usando el script directamente
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      // Ejecutar el script de reseteo
      await execAsync('npm run reset-anno');

      res.json(
        ApiResponseBuilder.success(
          {
            message: 'Reseteo anual ejecutado exitosamente',
            timestamp: new Date().toISOString(),
          },
          'Proceso de reseteo anual completado',
        ),
      );
    } catch (error) {
      console.error('Error ejecutando reseteo anual:', error);
      res
        .status(500)
        .json(ApiResponseBuilder.error('Error interno del servidor'));
    }
  }

  /**
   * @openapi
   * /api/admin/clean-audit-logs:
   *   post:
   *     summary: Limpiar logs de auditoría antiguos (solo admin)
   *     description: Elimina registros de auditoría más antiguos que el número de días especificado
   *     tags: [Administración]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               daysToKeep:
   *                 type: integer
   *                 default: 365
   *                 description: Número de días de registros a mantener
   *     responses:
   *       200:
   *         description: Logs de auditoría limpiados exitosamente
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
   *                         deletedCount:
   *                           type: integer
   *                         daysKept:
   *                           type: integer
   *       401:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  static async cleanAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const { daysToKeep = 365 } = req.body;

      const deletedCount = await AuditService.cleanOldLogs(daysToKeep);

      res.json(
        ApiResponseBuilder.success(
          {
            deletedCount,
            daysKept: daysToKeep,
          },
          'Logs de auditoría limpiados exitosamente',
        ),
      );
    } catch (error) {
      console.error('Error limpiando logs de auditoría:', error);
      res
        .status(500)
        .json(ApiResponseBuilder.error('Error interno del servidor'));
    }
  }
}
