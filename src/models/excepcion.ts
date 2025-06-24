export interface Excepcion {
  id: number;
  empleado_id: number;
  servicio_id: number;
  fecha: Date;
  tanda: 'mañana' | 'tarde' | 'noche';
  tipo: 'vacaciones' | 'ausencia' | 'ajuste' | 'reemplazo';
  motivo: string;
  turno_reemplazo_id?: number; // Si es un reemplazo, qué turno asignar
  activo: boolean;
  created_by: number; // ID del admin que creó la excepción
  created_at: Date;
  updated_at: Date;
}

export interface CreateExcepcionData {
  empleado_id: number;
  servicio_id: number;
  fecha: Date;
  tanda: 'mañana' | 'tarde' | 'noche';
  tipo: 'vacaciones' | 'ausencia' | 'ajuste' | 'reemplazo';
  motivo: string;
  turno_reemplazo_id?: number;
}
