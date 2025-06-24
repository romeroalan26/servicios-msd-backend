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

export default router;
