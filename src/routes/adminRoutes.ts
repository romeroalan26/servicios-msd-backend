import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.requireAdmin);

// PUT /api/admin/servicios/:id - Actualizar un servicio
router.put('/servicios/:id', AdminController.updateServicio);

// DELETE /api/admin/servicios/:id - Eliminar un servicio
router.delete('/servicios/:id', AdminController.deleteServicio);

// GET /api/admin/audit-log - Obtener log de auditoría
router.get('/audit-log', AdminController.getAuditLog);

// POST /api/admin/reset-anno - Ejecutar reseteo anual
router.post('/reset-anno', AdminController.executeResetAnno);

// POST /api/admin/clean-audit-logs - Limpiar logs de auditoría antiguos
router.post('/clean-audit-logs', AdminController.cleanAuditLogs);

export default router;
