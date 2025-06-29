import { Router } from 'express';
import { EmpleadoController } from '../controllers/empleadoController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(AuthMiddleware.authenticate);

// Listar empleados y ver uno (puede ser visible para usuarios autenticados)
router.get('/', EmpleadoController.getEmpleados);
router.get('/activos', EmpleadoController.getEmpleadosActivos);
router.get('/:id', EmpleadoController.getEmpleadoById);

// Endpoints sensibles: solo admin
router.post(
  '/',
  AuthMiddleware.requireAdmin,
  EmpleadoController.createEmpleado,
);
router.put(
  '/:id',
  AuthMiddleware.requireAdmin,
  EmpleadoController.updateEmpleado,
);
router.delete(
  '/:id',
  AuthMiddleware.requireAdmin,
  EmpleadoController.deleteEmpleado,
);
router.put(
  '/:id/rol',
  AuthMiddleware.requireAdmin,
  EmpleadoController.cambiarRol,
);
router.put(
  '/:id/prioridad',
  AuthMiddleware.requireAdmin,
  EmpleadoController.cambiarPrioridad,
);
router.post(
  '/reset-prioridades',
  AuthMiddleware.requireAdmin,
  EmpleadoController.resetearPrioridades,
);

// Endpoint para resetear contraseña (solo admin)
router.post(
  '/:id/reset-password',
  AuthMiddleware.requireAdmin,
  EmpleadoController.resetPassword,
);

export default router;
