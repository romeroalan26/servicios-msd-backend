export interface Seleccion {
  id: number;
  empleado_id: number;
  servicio_id: number;
  anno: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSeleccionData {
  empleado_id: number;
  servicio_id: number;
  anno: number;
}
