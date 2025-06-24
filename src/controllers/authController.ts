import { Request, Response } from 'express';
import { AuthService, LoginCredentials } from '../services/authService';
import { ApiResponseBuilder } from '../models/apiResponse';

export class AuthController {
  /**
   * @openapi
   * /api/auth/login:
   *   post:
   *     summary: Iniciar sesión
   *     description: Autenticar empleado con email y contraseña. Retorna un token JWT válido para las siguientes operaciones.
   *     tags: [Autenticación]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email del empleado
   *                 example: "admin@serviciosmsd.com"
   *               password:
   *                 type: string
   *                 minLength: 6
   *                 description: Contraseña del empleado
   *                 example: "admin123"
   *           example:
   *             email: "admin@serviciosmsd.com"
   *             password: "admin123"
   *     responses:
   *       200:
   *         description: Login exitoso
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
   *                         token:
   *                           type: string
   *                           description: Token JWT para autenticación
   *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *                         empleado:
   *                           $ref: '#/components/schemas/Empleado'
   *             example:
   *               success: true
   *               data:
   *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *                 empleado:
   *                   id: 1
   *                   nombre: "Administrador Sistema"
   *                   email: "admin@serviciosmsd.com"
   *                   rol: "admin"
   *                   prioridad: null
   *                   activo: true
   *               message: "Login exitoso"
   *               timestamp: "2024-01-15T10:30:00.000Z"
   *       400:
   *         description: Credenciales inválidas
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Credenciales inválidas"
   *             example:
   *               success: false
   *               error: "Credenciales inválidas"
   *               timestamp: "2024-01-15T10:30:00.000Z"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Error interno del servidor"
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: LoginCredentials = req.body;

      // Validar campos requeridos
      if (!credentials.email || !credentials.password) {
        res
          .status(400)
          .json(ApiResponseBuilder.error('Email y contraseña son requeridos'));
        return;
      }

      const authResponse = await AuthService.login(credentials);

      res.json(ApiResponseBuilder.success(authResponse, 'Login exitoso'));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      res.status(400).json(ApiResponseBuilder.error(errorMessage));
    }
  }

  /**
   * @openapi
   * /api/auth/me:
   *   get:
   *     summary: Obtener información del empleado autenticado
   *     description: Retorna la información del empleado basada en el token JWT proporcionado en el header Authorization.
   *     tags: [Autenticación]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Información del empleado obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/Empleado'
   *             example:
   *               success: true
   *               data:
   *                 id: 1
   *                 nombre: "Administrador Sistema"
   *                 email: "admin@serviciosmsd.com"
   *                 rol: "admin"
   *                 prioridad: null
   *                 activo: true
   *               message: "Información obtenida exitosamente"
   *               timestamp: "2024-01-15T10:30:00.000Z"
   *       401:
   *         description: Token inválido o no proporcionado
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Token inválido"
   *             example:
   *               success: false
   *               error: "Token inválido"
   *               timestamp: "2024-01-15T10:30:00.000Z"
   *       500:
   *         description: Error interno del servidor
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     error:
   *                       type: string
   *                       example: "Error interno del servidor"
   */
  static async me(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        res
          .status(401)
          .json(ApiResponseBuilder.error('Token no proporcionado'));
        return;
      }

      const empleado = await AuthService.getCurrentUser(token);

      res.json(
        ApiResponseBuilder.success(
          empleado,
          'Información obtenida exitosamente',
        ),
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      res.status(401).json(ApiResponseBuilder.error(errorMessage));
    }
  }
}
