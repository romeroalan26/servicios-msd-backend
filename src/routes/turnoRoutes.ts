import { Router } from 'express';
import { TurnoController } from '../controllers/turnoController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// GET /api/turnos - Obtener todos los turnos (con paginación)
router.get('/', TurnoController.getTurnos);

// GET /api/turnos/activos - Obtener turnos activos (sin paginación)
router.get('/activos', TurnoController.getTurnosActivos);

// GET /api/turnos/:id - Obtener un turno específico
router.get('/:id', TurnoController.getTurno);

// POST /api/turnos - Crear un nuevo turno (solo admin)
router.post('/', AuthMiddleware.requireAdmin, TurnoController.createTurno);

// PUT /api/turnos/:id - Actualizar un turno (solo admin)
router.put('/:id', AuthMiddleware.requireAdmin, TurnoController.updateTurno);

// DELETE /api/turnos/:id - Eliminar un turno (solo admin)
router.delete('/:id', AuthMiddleware.requireAdmin, TurnoController.deleteTurno);

export default router;
