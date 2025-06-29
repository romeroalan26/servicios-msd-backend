export interface Turno {
  id: number;
  codigo: string; // Ej: "CA", "OF", "GU", etc.
  nombre: string; // Ej: "Cabina", "Oficina", "Guardia", etc.
  descripcion: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTurnoData {
  codigo: string;
  nombre: string;
  descripcion: string;
}

export interface UpdateTurnoData {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}
