import { Router } from 'express';
import { ServicioController } from '../controllers/servicioController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(AuthMiddleware.authenticate);

// GET /api/servicios - Obtener todos los servicios
router.get('/', ServicioController.getServicios);

// GET /api/servicios/:id - Obtener un servicio específico
router.get('/:id', ServicioController.getServicio);

// POST /api/servicios - Crear un nuevo servicio (solo admin)
router.post(
  '/',
  AuthMiddleware.requireAdmin,
  ServicioController.createServicio,
);

// POST /api/servicios/:id/dias - Agregar día a un servicio (solo admin)
router.post(
  '/:id/dias',
  AuthMiddleware.requireAdmin,
  ServicioController.addDiaServicio,
);

export default router;
