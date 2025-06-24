export interface Empleado {
  id: number;
  nombre: string;
  email: string;
  password_hash: string;
  rol: 'empleado' | 'admin';
  prioridad: number | null;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEmpleadoData {
  nombre: string;
  email: string;
  password: string;
  rol: 'empleado' | 'admin';
  prioridad?: number;
}
