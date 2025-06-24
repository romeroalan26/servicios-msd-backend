-- Crear tabla empleados
CREATE TABLE IF NOT EXISTS empleados (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'empleado' CHECK (rol IN ('empleado', 'admin')),
  prioridad INTEGER CHECK (prioridad >= 1 AND prioridad <= 20),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla turnos (códigos de posición)
CREATE TABLE IF NOT EXISTS turnos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(10) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla servicios
CREATE TABLE IF NOT EXISTS servicios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla servicio_dias
CREATE TABLE IF NOT EXISTS servicio_dias (
  id SERIAL PRIMARY KEY,
  servicio_id INTEGER REFERENCES servicios(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  tanda VARCHAR(20) NOT NULL CHECK (tanda IN ('mañana', 'tarde', 'noche')),
  turno_id INTEGER REFERENCES turnos(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(servicio_id, fecha, tanda)
);

-- Crear tabla selecciones
CREATE TABLE IF NOT EXISTS selecciones (
  id SERIAL PRIMARY KEY,
  empleado_id INTEGER REFERENCES empleados(id) ON DELETE CASCADE,
  servicio_id INTEGER REFERENCES servicios(id) ON DELETE CASCADE,
  anno INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(empleado_id, anno)
);

-- Crear tabla excepciones (vacaciones, ausencias, ajustes)
CREATE TABLE IF NOT EXISTS excepciones (
  id SERIAL PRIMARY KEY,
  empleado_id INTEGER REFERENCES empleados(id) ON DELETE CASCADE,
  servicio_id INTEGER REFERENCES servicios(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  tanda VARCHAR(20) NOT NULL CHECK (tanda IN ('mañana', 'tarde', 'noche')),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('vacaciones', 'ausencia', 'ajuste', 'reemplazo')),
  motivo TEXT NOT NULL,
  turno_reemplazo_id INTEGER REFERENCES turnos(id) ON DELETE SET NULL,
  activo BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES empleados(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(empleado_id, servicio_id, fecha, tanda)
);

-- Crear tabla audit_log para trazabilidad
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  tabla VARCHAR(50) NOT NULL,
  accion VARCHAR(20) NOT NULL,
  registro_id INTEGER,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  usuario_id INTEGER REFERENCES empleados(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_empleados_prioridad ON empleados(prioridad);
CREATE INDEX IF NOT EXISTS idx_empleados_rol ON empleados(rol);
CREATE INDEX IF NOT EXISTS idx_turnos_codigo ON turnos(codigo);
CREATE INDEX IF NOT EXISTS idx_servicio_dias_fecha ON servicio_dias(fecha);
CREATE INDEX IF NOT EXISTS idx_servicio_dias_servicio_id ON servicio_dias(servicio_id);
CREATE INDEX IF NOT EXISTS idx_servicio_dias_turno_id ON servicio_dias(turno_id);
CREATE INDEX IF NOT EXISTS idx_selecciones_anno ON selecciones(anno);
CREATE INDEX IF NOT EXISTS idx_selecciones_empleado_id ON selecciones(empleado_id);
CREATE INDEX IF NOT EXISTS idx_excepciones_empleado_id ON excepciones(empleado_id);
CREATE INDEX IF NOT EXISTS idx_excepciones_fecha ON excepciones(fecha);
CREATE INDEX IF NOT EXISTS idx_excepciones_tipo ON excepciones(tipo);
CREATE INDEX IF NOT EXISTS idx_audit_log_tabla ON audit_log(tabla);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at); 