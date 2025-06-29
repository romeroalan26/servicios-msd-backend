import { Router } from 'express';
import { EmpleadoController } from '../controllers/empleadoController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(AuthMiddleware.authenticate);

// Rutas para gestión de empleados (solo admin)
router.get('/', EmpleadoController.getEmpleados);
router.get('/activos', EmpleadoController.getEmpleadosActivos);
router.get('/:id', EmpleadoController.getEmpleadoById);
router.post('/', EmpleadoController.createEmpleado);
router.put('/:id', EmpleadoController.updateEmpleado);
router.delete('/:id', EmpleadoController.deleteEmpleado);

// Rutas específicas para gestión de roles y prioridades
router.put('/:id/rol', EmpleadoController.cambiarRol);
router.put('/:id/prioridad', EmpleadoController.cambiarPrioridad);
router.post('/reset-prioridades', EmpleadoController.resetearPrioridades);

export default router;
