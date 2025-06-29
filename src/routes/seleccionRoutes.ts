import { Router } from 'express';
import { SeleccionController } from '../controllers/seleccionController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(AuthMiddleware.authenticate);

// GET /api/selecciones/disponibles - Obtener servicios disponibles
router.get('/disponibles', SeleccionController.getServiciosDisponibles);

// POST /api/selecciones - Seleccionar un servicio
router.post('/', SeleccionController.crearSeleccion);

// GET /api/selecciones/mi-seleccion - Obtener mi selección actual
router.get('/mi-seleccion', SeleccionController.getMiSeleccion);

// GET /api/selecciones/estado - Obtener estado de selecciones
router.get('/estado', SeleccionController.getEstadoSelecciones);

// PATCH /api/selecciones/intercambiar-dia - Intercambiar días dentro del servicio seleccionado
router.patch('/intercambiar-dia', SeleccionController.intercambiarDia);

// POST /api/selecciones/liberar - Liberar selección (Solo Admin)
router.post(
  '/liberar',
  AuthMiddleware.requireAdmin,
  SeleccionController.liberarSeleccion,
);

// GET /api/selecciones/progreso - Obtener progreso de selecciones
router.get('/progreso', SeleccionController.getProgresoSelecciones);

// GET /api/selecciones/calendario/:year/:month - Obtener calendario de un mes específico
router.get('/calendario/:year/:month', SeleccionController.getCalendario);
// GET /api/selecciones/calendario/:year - Obtener calendario de un año completo
router.get('/calendario/:year', SeleccionController.getCalendario);

// GET /api/selecciones/prioridad-actual - Obtener la prioridad actual de selección
router.get('/prioridad-actual', SeleccionController.getPrioridadActual);

// GET /api/selecciones/kpis - KPIs del dashboard
router.get('/kpis', SeleccionController.getKpisDashboard);

// Endpoints solo para admin
router.get(
  '/',
  AuthMiddleware.requireAdmin,
  SeleccionController.getAllSelecciones,
);
router.get(
  '/:empleadoId',
  AuthMiddleware.requireAdmin,
  SeleccionController.getSeleccionesByEmpleado,
);
router.delete(
  '/:id',
  AuthMiddleware.requireAdmin,
  SeleccionController.deleteSeleccion,
);

export default router;
