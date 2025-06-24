# 🏥 Servicios MSD Backend

Backend para el sistema de gestión de servicios y selección de turnos para 20 empleados y 1 administrador.

## 🚀 Características Implementadas

### ✅ Autenticación y Autorización

- **JWT Authentication**: Sistema de autenticación con tokens JWT
- **Control de Roles**: Middleware para verificar roles (admin/empleado)
- **Prioridad de Empleados**: Sistema de prioridades para rotación de servicios

### ✅ Gestión de Servicios

- **CRUD de Servicios**: Crear, leer, actualizar servicios
- **Días de Servicio**: Gestión de días específicos para cada servicio
- **Turnos**: Sistema de turnos (mañana, tarde, noche)
- **Excepciones**: Manejo de excepciones y reemplazos
- **Paginación**: Sistema de paginación escalable con ordenamiento

### ✅ Base de Datos

- **PostgreSQL**: Base de datos relacional
- **Migraciones**: Scripts de inicialización y datos semilla
- **Auditoría**: Log de cambios para trazabilidad

### ✅ Documentación

- **Swagger/OpenAPI**: Documentación automática de endpoints
- **TypeScript**: Tipado estático para mejor desarrollo

## 📋 Estructura de Respuesta API

### 🔄 Respuesta Estándar

Todas las respuestas siguen una estructura consistente:

```json
{
  "success": true,
  "data": { ... },
  "message": "Mensaje descriptivo",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 📄 Respuesta con Paginación

Para endpoints que retornan listas con paginación:

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalElements": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrevious": false
  },
  "message": "Datos obtenidos exitosamente",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### ❌ Respuesta de Error

```json
{
  "success": false,
  "error": "Descripción del error",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 📋 Endpoints Implementados

### 🔐 Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener información del usuario autenticado

### 🏥 Servicios

- `GET /api/servicios` - Obtener todos los servicios (con paginación)
- `GET /api/servicios/:id` - Obtener un servicio específico
- `POST /api/servicios` - Crear un nuevo servicio (solo admin)
- `POST /api/servicios/:id/dias` - Agregar día a un servicio (solo admin)

### 🏥 Health Check

- `GET /api/health` - Verificar estado de la API

## 🔧 Parámetros de Paginación

### GET /api/servicios

- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, max: 100)
- `sortBy` (opcional): Campo para ordenar (default: s.id)
- `sortOrder` (opcional): Orden ascendente/descendente (default: asc)

### Ejemplos de Uso

```bash
# Página 1, 5 elementos por página
GET /api/servicios?page=1&limit=5

# Ordenar por nombre descendente
GET /api/servicios?sortBy=s.nombre&sortOrder=desc

# Página 2, ordenar por fecha de creación
GET /api/servicios?page=2&limit=10&sortBy=s.created_at&sortOrder=desc
```

## 🛠️ Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **TypeScript** - Lenguaje tipado
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **Swagger** - Documentación API
- **ESLint + Prettier** - Linting y formateo

## 📦 Instalación

1. **Clonar el repositorio**

   ```bash
   git clone <repository-url>
   cd servicios-msd-backend
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   ```bash
   # Crear archivo .env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=servicios_msd
   DB_PASSWORD=password
   DB_PORT=5432
   JWT_SECRET=servicios_msd_jwt_secret_2024
   PORT=3000
   ```

4. **Inicializar base de datos**

   ```bash
   npm run init-db
   npm run seed-turnos
   npm run seed-empleados
   ```

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

## 🧪 Scripts Disponibles

### Desarrollo

- `npm run dev` - Servidor de desarrollo con nodemon
- `npm run build` - Compilar TypeScript
- `npm run start` - Servidor de producción

### Base de Datos

- `npm run init-db` - Inicializar base de datos
- `npm run seed-turnos` - Insertar códigos de turno
- `npm run seed-empleados` - Insertar empleados de prueba
- `npm run seed-servicios` - Insertar servicios de prueba

### Pruebas

- `npm run test-connection` - Probar conexión a BD
- `npm run test-auth` - Probar autenticación
- `npm run test-servicios` - Probar servicios
- `npm run test-servicios-http` - Probar endpoints HTTP
- `npm run test-pagination` - Probar paginación
- `npm run test-swagger` - Verificar documentación de Swagger

### Verificación

- `npm run verify-data` - Verificar datos en BD
- `npm run verify-empleados` - Verificar empleados

### Calidad de Código

- `npm run lint` - Ejecutar ESLint
- `npm run lint:fix` - Corregir errores de linting
- `npm run format` - Formatear código con Prettier

## 📚 Documentación API

La documentación completa de la API está disponible en:

- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs/swagger.json

### Características de la Documentación

✅ **Documentación Completa**: Todos los endpoints están documentados con ejemplos
✅ **Esquemas Reutilizables**: Definiciones de modelos centralizadas
✅ **Autenticación JWT**: Documentación de seguridad con Bearer token
✅ **Paginación**: Ejemplos de parámetros y respuestas paginadas
✅ **Códigos de Error**: Todos los códigos de respuesta documentados
✅ **Ejemplos Prácticos**: Request/response examples para cada endpoint
✅ **Validaciones**: Límites y restricciones de parámetros documentados

### Estructura de la Documentación

- **Autenticación**: Endpoints de login y verificación de usuario
- **Servicios**: CRUD completo de servicios y días de servicio
- **Sistema**: Health checks y endpoints del sistema

### Verificación de Documentación

Para verificar que toda la documentación esté correcta:

```bash
npm run test-swagger
```

Este script verifica:

- ✅ Generación correcta del JSON de OpenAPI
- ✅ Disponibilidad de Swagger UI
- ✅ Presencia de todos los endpoints
- ✅ Definición de todos los esquemas
- ✅ Configuración de tags y servidores

## 🔐 Credenciales de Prueba

### Administrador

- **Email**: admin@serviciosmsd.com
- **Password**: admin123

### Empleados

- **Email**: empleado1@serviciosmsd.com
- **Password**: empleado123
- **Prioridad**: 1-20 (rotación anual)

## 🏗️ Estructura del Proyecto

```
servicios-msd-backend/
├── src/
│   ├── config/          # Configuración de BD
│   ├── controllers/     # Controladores de endpoints
│   ├── middlewares/     # Middlewares de autenticación
│   ├── models/          # Interfaces de datos
│   ├── routes/          # Definición de rutas
│   ├── services/        # Lógica de negocio
│   ├── swagger/         # Configuración de documentación
│   └── index.ts         # Punto de entrada
├── scripts/             # Scripts de desarrollo y pruebas
├── dist/                # Código compilado
└── docs/                # Documentación adicional
```

## 🚧 Próximos Pasos

### Fase 2: Lógica de Selección

- [ ] Endpoint `POST /selecciones` con transacción segura
- [ ] Lógica de rotación de prioridad (`21 - prioridad`)
- [ ] Validación de reglas (una selección por año)
- [ ] Middleware `checkTurno()`

### Fase 3: Funciones Administrativas

- [ ] Endpoints `PUT` y `DELETE` para servicios
- [ ] Script de reseteo anual
- [ ] Integración de notificaciones por correo
- [ ] Implementación de `audit_log`

### Fase 4: Frontend

- [ ] SPA React con Vite
- [ ] Interfaz de login y gestión de servicios
- [ ] Despliegue en Vercel

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

- **Desarrollador**: Alan2
- **Proyecto**: Sistema de Gestión de Servicios MSD
- **Versión**: 1.0.0
