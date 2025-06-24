import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { AuthMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  await AuthController.login(req, res);
});

// GET /api/auth/me (requiere autenticación)
router.get('/me', AuthMiddleware.authenticate, async (req, res) => {
  await AuthController.me(req, res);
});

export default router;
