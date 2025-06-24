import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

// Extender la interfaz Request para incluir el usuario
declare module 'express' {
  interface Request {
    user?: {
      id: number;
      nombre: string;
      email: string;
      rol: string;
      prioridad: number | null;
      activo: boolean;
    };
  }
}

export class AuthMiddleware {
  /**
   * Middleware para verificar token JWT (no async, usa then/catch)
   */
  static authenticate(req: Request, res: Response, next: NextFunction): void {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token no proporcionado',
      });
      return;
    }
    AuthService.verifyToken(token)
      .then((decoded) => {
        req.user = decoded.empleado;
        next();
      })
      .catch(() => {
        res.status(401).json({
          success: false,
          error: 'Token inválido',
        });
      });
  }

  /**
   * Middleware para verificar rol de administrador
   */
  static requireAdmin(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }
    if (req.user.rol !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Acceso denegado. Se requiere rol de administrador',
      });
      return;
    }
    next();
  }

  /**
   * Middleware para verificar rol de empleado
   */
  static requireEmployee(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }
    if (req.user.rol !== 'empleado') {
      res.status(403).json({
        success: false,
        error: 'Acceso denegado. Se requiere rol de empleado',
      });
      return;
    }
    next();
  }

  /**
   * Middleware para verificar que el empleado tiene prioridad asignada
   */
  static requirePriority(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'No autenticado',
      });
      return;
    }
    if (req.user.rol !== 'empleado') {
      res.status(403).json({
        success: false,
        error: 'Acceso denegado. Se requiere rol de empleado',
      });
      return;
    }
    if (!req.user.prioridad) {
      res.status(403).json({
        success: false,
        error: 'Acceso denegado. No tienes prioridad asignada',
      });
      return;
    }
    next();
  }
}
