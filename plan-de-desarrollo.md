# 🗂️ Plan de Desarrollo por Fases – MVP del Sistema de Gestión de Servicios

Este documento organiza las tareas en 4 fases para alcanzar un MVP funcional, iniciando por el backend.

---

## 🔹 FASE 1: Fundamentos del Backend (Base de Datos + API Core)

**Objetivo:** Tener lista la base de datos, el modelo de datos y los endpoints mínimos para exponer servicios.

### ✅ Tareas

- [ ] Crear repositorio `servicios-backend` (GitHub)
- [ ] Inicializar Node.js + Express + TypeScript
- [ ] Añadir ESLint, Prettier y scripts de desarrollo
- [ ] Crear tablas: `empleados`, `servicios`, `servicio_dias`, `selecciones`
- [ ] Crear script seed con 20 empleados + 1 admin
- [ ] Desplegar instancia PostgreSQL en Render
- [ ] Conectar Express a PostgreSQL
- [ ] Implementar `GET /servicios` y `GET /servicios/:id`

---

## 🔹 FASE 2: Lógica de Selección + Seguridad

**Objetivo:** Implementar autenticación, control de prioridad, selección de servicios y rotación.

### ✅ Tareas

- [ ] Crear login `POST /auth/login` con JWT
- [ ] Endpoint `GET /auth/me`
- [ ] Middleware de autorización por rol
- [ ] Middleware `checkTurno()`
- [ ] Lógica de rotación de prioridad (`21 - prioridad`)
- [ ] Endpoint `POST /selecciones` con transacción segura
- [ ] Validación de reglas (una selección por año, prioridad válida)

---

## 🔹 FASE 3: Funciones Administrativas + Notificaciones

**Objetivo:** Habilitar funciones avanzadas para administradores y sistema de notificación por correo.

### ✅ Tareas

- [ ] Endpoints `POST` y `PUT` para `/admin/servicios`
- [ ] Script `resetAnno.js` (limpiar selecciones, recalcular prioridades)
- [ ] Cron Job en Render para ejecutar reseteo anual
- [ ] Integrar SendGrid para correos
- [ ] Enviar notificaciones al empleado, admin y correos adicionales
- [ ] Implementar tabla `audit_log` para trazabilidad

---

## 🔹 FASE 4: Frontend Simple + Despliegue

**Objetivo:** Permitir acceso web multiplataforma desde cualquier lugar.

### ✅ Tareas

- [ ] Crear SPA React (Vite) con login, lista y detalle de servicios
- [ ] Botón «Seleccionar» si está habilitado
- [ ] Conectar a backend Render con CORS configurado
- [ ] Desplegar frontend en Vercel
- [ ] Configurar variables de entorno
- [ ] Realizar pruebas E2E con Postman
- [ ] Documentar `README.md` y `openapi.yaml`

---

## ✅ Criterios de Completitud del MVP

- [ ] Backend desplegado en Render y protegido
- [ ] Base de datos inicializada con empleados y servicios
- [ ] Flujo de selección activo con rotación de prioridades
- [ ] Correos automáticos funcionales
- [ ] Admin puede crear y editar servicios
- [ ] SPA en Vercel funcionando en escritorio y móvil
