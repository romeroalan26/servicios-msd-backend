# 📜 Scripts de Desarrollo

Este documento describe los scripts disponibles para el desarrollo y mantenimiento del proyecto.

## 🚀 Scripts de Inicialización

### `init-db-complete` (Recomendado)

**Comando:** `npm run init-db-complete` o `npx ts-node scripts/initDatabase.ts`

Script completo que inicializa toda la base de datos en un solo paso:

- ✅ Crea todas las tablas
- ✅ Inserta códigos de turno básicos
- ✅ Inserta empleados de prueba (20 empleados + 1 admin)
- ✅ Inserta servicios de prueba con días asignados

**Uso recomendado para nuevos desarrolladores.**

### Scripts Individuales

- `init-db` - Solo crear tablas
- `seed-turnos` - Solo insertar códigos de turno
- `seed-empleados` - Solo insertar empleados
- `seed-servicios` - Solo insertar servicios

## 🧪 Scripts de Pruebas

### Pruebas de Conexión

- `test-connection` - Verificar conexión a PostgreSQL
- `test-auth` - Probar autenticación JWT
- `test-swagger` - Verificar documentación de API

### Pruebas de Endpoints

- `test-endpoints` - Probar endpoints básicos
- `test-servicios` - Probar lógica de servicios
- `test-servicios-http` - Probar endpoints HTTP de servicios
- `test-pagination` - Probar sistema de paginación
- `test-selecciones` - Probar lógica de selecciones
- `test-rotacion-prioridades` - Probar rotación de prioridades

### Verificación de Datos

- `verify-data` - Verificar integridad de datos
- `verify-empleados` - Verificar empleados en BD

## 🔧 Scripts de Mantenimiento

### Gestión de Datos

- `generate-yearly` - Generar servicios anuales
- `reset-anno` - Resetear datos anuales
- `create-db` - Crear base de datos

## 📋 Credenciales de Prueba

Después de ejecutar `init-db-complete`, tendrás disponibles:

### 👨‍💼 Administrador

- **Email:** `admin@serviciosmsd.com`
- **Password:** `admin123`
- **Rol:** `admin`

### 👤 Empleado de Prueba

- **Email:** `juan.perez@serviciosmsd.com`
- **Password:** `empleado123`
- **Rol:** `empleado`
- **Prioridad:** `1`

## 🔗 Endpoints de Prueba

Una vez inicializado, puedes probar:

- **API Base:** `http://localhost:3000/api`
- **Documentación:** `http://localhost:3000/api-docs`
- **Health Check:** `http://localhost:3000/api/health`

## ⚠️ Notas Importantes

1. **Scripts Excluidos del Repo:** La mayoría de scripts de pruebas están excluidos del repositorio público por seguridad y limpieza.

2. **Variables de Entorno:** Asegúrate de tener configurado el archivo `.env` antes de ejecutar cualquier script.

3. **Base de Datos:** Los scripts asumen que PostgreSQL está corriendo y la base de datos `servicios_msd` existe.

4. **Datos de Prueba:** Los datos insertados son solo para desarrollo. No usar en producción.

## 🛠️ Flujo de Desarrollo Típico

```bash
# 1. Configurar entorno
cp env.example .env
# Editar .env con tus credenciales

# 2. Instalar dependencias
npm install

# 3. Inicializar base de datos
npm run init-db-complete

# 4. Ejecutar servidor
npm run dev

# 5. Probar endpoints
npm run test-auth
npm run test-servicios-http
```

## 🔍 Troubleshooting

### Error de Conexión

```bash
npm run test-connection
```

### Error de Autenticación

```bash
npm run test-auth
```

### Verificar Datos

```bash
npm run verify-data
npm run verify-empleados
```
