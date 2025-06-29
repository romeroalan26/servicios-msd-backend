import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { Empleado } from '../models/empleado';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  empleado: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    prioridad: number | null;
  };
}

export interface DecodedToken {
  id: number;
  email: string;
  rol: string;
  prioridad: number | null;
  iat: number;
  exp: number;
}

export interface EmpleadoInfo {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  prioridad: number | null;
  activo: boolean;
}

export class AuthService {
  /**
   * Autenticar empleado con email y contraseña
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Buscar empleado por email
    const result = await pool.query(
      'SELECT * FROM empleados WHERE email = $1 AND activo = true',
      [email],
    );

    if (result.rows.length === 0) {
      throw new Error('Credenciales inválidas');
    }

    const empleado: Empleado = result.rows[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(
      password,
      empleado.password_hash,
    );
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar que JWT_SECRET esté configurado
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET no está configurado');
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: empleado.id,
        email: empleado.email,
        rol: empleado.rol,
        prioridad: empleado.prioridad,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
    );

    return {
      token,
      empleado: {
        id: empleado.id,
        nombre: empleado.nombre,
        email: empleado.email,
        rol: empleado.rol,
        prioridad: empleado.prioridad,
      },
    };
  }

  /**
   * Verificar token JWT y obtener información del empleado
   */
  static async verifyToken(token: string): Promise<{ empleado: EmpleadoInfo }> {
    try {
      // Verificar que JWT_SECRET esté configurado
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET no está configurado');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;

      // Verificar que el empleado aún existe y está activo
      const result = await pool.query(
        'SELECT id, nombre, email, rol, prioridad, activo FROM empleados WHERE id = $1 AND activo = true',
        [decoded.id],
      );

      if (result.rows.length === 0) {
        throw new Error('Empleado no encontrado o inactivo');
      }

      return {
        empleado: result.rows[0] as EmpleadoInfo,
      };
    } catch {
      throw new Error('Token inválido');
    }
  }

  /**
   * Obtener información del empleado autenticado
   */
  static async getCurrentUser(token: string): Promise<EmpleadoInfo> {
    const decoded = await this.verifyToken(token);
    return decoded.empleado;
  }
}
