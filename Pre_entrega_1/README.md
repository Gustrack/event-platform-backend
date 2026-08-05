# Event Platform Backend API

API RESTful diseñada para la gestión de eventos e inscripciones.

---

## Descripción

Proyecto **Programación Backend II: Diseño y Arquitectura Backend**. Implementa una arquitectura por capas con Express y Node.js, preparada para escalar en futuras entregas.

## Características Principales

- **Arquitectura por capas** (Routes → Controllers → Services → Repositories → DAO → Models)
- **API RESTful** con endpoints para eventos y sesiones
- **Variables de entorno** para configuración segura
- **Estructura escalable** preparada para futuras expansiones
- **ESLint** configurado para mantener código limpio y consistente
- **Módulos ESM** (import/export)

## Tecnologías

- **Node.js** + **Express.js** - Servidor web
- **MongoDB** + **Mongoose** (preparado para conexión futura)
- **JWT** para autenticación (estructura lista)
- **Bcrypt** para encriptación de contraseñas
- **Dotenv** para variables de entorno
- **ESLint** para linting y formato de código

## Estructura del Proyecto

```text
src/
├── config/         # Configuraciones de la aplicación
├── routes/         # Definición de endpoints
├── controllers/    # Manejo de peticiones/respuestas HTTP
├── services/       # Lógica de negocio
├── repositories/   # Interfaz entre servicios y DAOs
├── dao/            # Operaciones de datos (actualmente en memoria)
├── models/         # Definición de esquemas (Mongoose)
├── middlewares/    # Middlewares personalizados
└── utils/          # Utilidades y helpers
```

## Instalación y Uso

### Clonar el repositorio

bash

```
git clone https://github.com/Gustrack/event-platform-backend.git
cd event-platform-backend
```

### Instalar dependencias

bash

```
npm install
```

### Configurar variables de entorno

bash

```
cp .env.example .env
```

### Iniciar en modo desarrollo

bash

```
npm run dev
```

### Iniciar en producción

bash

```
npm start
```

## Endpoints Disponibles

| Método | Endpoint                 | Descripción               |
| ------ | ------------------------ | ------------------------- |
| GET    | `/api/health`            | Health check del servidor |
| GET    | `/api/events`            | Listar todos los eventos  |
| GET    | `/api/events/:id`        | Obtener evento por ID     |
| POST   | `/api/events`            | Crear nuevo evento        |
| PUT    | `/api/events/:id`        | Actualizar evento         |
| DELETE | `/api/events/:id`        | Eliminar evento           |
| POST   | `/api/sessions/register` | Registrar nuevo usuario   |
| POST   | `/api/sessions/login`    | Iniciar sesión            |
| POST   | `/api/sessions/logout`   | Cerrar sesión             |
| GET    | `/api/sessions/current`  | Obtener usuario actual    |

## Ejemplos de Uso

bash

```
# Health check
curl http://localhost:3000/api/health

# Obtener eventos (inicialmente vacío)
curl http://localhost:3000/api/events

# Registrar usuario
curl -X POST http://localhost:3000/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan Perez","email":"juan@email.com","password":"12345678"}'

# Login
curl -X POST http://localhost:3000/api/sessions/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@email.com","password":"12345678"}'
```

## Estado del Proyecto

### Pre-entrega 1

☑ Servidor Express configurado  
☑ Arquitectura por capas implementada  
☑ GET /api/health operativo  
☑ GET /api/events operativo (lista vacía)  
☑ Estructura para sessions preparada  
☑ Modelos User y Event definidos  
☑ Variables de entorno configuradas  
☑ ESLint integrado

### Autor

Gustavo Atala

GitHub: [event-platform-backend](https://github.com/Gustrack/event-platform-backend)

Email: gustavoatala1974@gmail.com

Nota: Esta API está en desarrollo. Los datos se almacenan actualmente en memoria (sin persistencia) para facilitar las pruebas iniciales.
