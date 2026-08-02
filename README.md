# Event Platform Backend API

## Descripcion

API RESTful diseñada para gestion de eventos e inscripciones.

## Características Principales

- **Arquitectura por capas** (Routes → Controllers → Services → Repositories → DAO → Models)
- **API RESTful** con endpoints para eventos y sesiones
- **Variables de entorno** para configuración segura
- **Estructura escalable** preparada para futuras expansiones
- **ESLint** configurado para mantener código limpio y consistente
- **Módulos ESM** (import/export)

## Tecnologias

- Node.js + Express.js
- MongoDB + Mongoose (preparado para conexión futura)
- JWT para autenticación (estructura lista)
- Bcrypt para encriptación
- Dotenv para variables de entorno
- ESLint para linting

## Instalación y Uso

bash

# Clonar el repositorio

git clone https://github.com/Gustrack/event-platform-backend.git

# Instalar dependencias

npm install

# Configurar variables de entorno

cp .env.example .env

# Iniciar en modo desarrollo

npm run dev

# Iniciar en producción

npm start

## Endpoints

Método Endpoint Descripción

- GET /api/health Health check del servidor
- GET /api/events Listar todos los eventos
- GET /api/events/:id Obtener evento por ID
- POST /api/events Crear nuevo evento
- PUT /api/events/:id Actualizar evento
- DELETE /api/events/:id Eliminar evento
- POST /api/sessions/register Registrar nuevo usuario
- POST /api/sessions/login Iniciar sesión
- POST /api/sessions/logout Cerrar sesión
- GET /api/sessions/current Obtener usuario actual
