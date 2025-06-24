export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ServicioDia {
  id: number;
  servicio_id: number;
  fecha: Date;
  tanda: 'mañana' | 'tarde' | 'noche';
  turno_id: number; // Referencia al código de turno
  created_at: Date;
  updated_at: Date;
}

export interface CreateServicioData {
  nombre: string;
  descripcion: string;
}

export interface CreateServicioDiaData {
  servicio_id: number;
  fecha: Date;
  tanda: 'mañana' | 'tarde' | 'noche';
  turno_id: number;
}
