markdown

# 🏭 Innser Management System API

Sistema de gestión de mantenimiento industrial. Permite a clientes solicitar servicios de mantenimiento y a técnicos especializados gestionar sus asignaciones.

---

## 📌 Temática

**Innser Management System** es una API backend diseñada para la gestión integral de solicitudes de mantenimiento industrial. El sistema permite:

- **Clientes** → Crear y dar seguimiento a solicitudes de mantenimiento
- **Técnicos** → Gestionar sus asignaciones y actualizar estados
- **Administradores** → Control total del sistema, asignación de técnicos y gestión de solicitudes

---

## 🎯 Tecnologías

| Tecnología           | Versión | Uso                             |
| -------------------- | ------- | ------------------------------- |
| **Node.js**          | v20+    | Entorno de ejecución            |
| **Express**          | 4.x     | Framework web                   |
| **MongoDB**          | 8.x     | Base de datos NoSQL             |
| **Mongoose**         | 8.x     | ODM para MongoDB                |
| **JWT**              | 9.x     | Autenticación basada en tokens  |
| **Passport.js**      | 0.6.x   | Estrategias de autenticación    |
| **Bcrypt**           | 5.1.x   | Hash de contraseñas             |
| **Nodemailer**       | 6.9.x   | Envío de emails                 |
| **Joi**              | 17.x    | Validación de datos             |
| **Cookies httpOnly** | -       | Almacenamiento seguro de tokens |

---

## 🏗️ Arquitectura

src/
├── config/ # Configuraciones (DB, Passport, Email)
├── models/ # Modelos de Mongoose
├── dao/ # Data Access Objects
├── repositories/ # Patrón de repositorio
├── services/ # Lógica de negocio
├── dto/ # Data Transfer Objects
├── controllers/ # Controladores
├── routes/ # Rutas de la API
├── middlewares/ # Middlewares (auth, roles, validación)
└── validations/ # Esquemas de validación con Joi

text

### Flujo de datos:

Request → Routes → Middlewares → Controller → Service → Repository → DAO → Model → MongoDB
Response ← DTO ← Controller ← Service ← Repository ← DAO ← Model ← MongoDB

text

---

## 👥 Roles y Permisos

| **Rol**        | **Responsabilidades**                                           |
| -------------- | --------------------------------------------------------------- |
| **Admin**      | Control total del sistema, asignación de técnicos, estadísticas |
| **Client**     | Crear y gestionar sus solicitudes, ver estado                   |
| **Technician** | Ver sus asignaciones, actualizar estado de trabajos             |

---

## 🚀 Instalación

### 1. Clonar el repositorio

````bash
git clone https://github.com/Gustrack/event-platform-backend.git
cd event-platform-backend
2. Instalar dependencias
bash
npm install
3. Configurar variables de entorno
bash
cp .env.example .env
# Editar .env con tus credenciales reales
4. Poblar base de datos con datos de prueba
bash
npm run seed
5. Iniciar el servidor
bash
# Desarrollo (con hot reload)
npm run dev

# Producción
npm start
🔐 Variables de Entorno
env
# Servidor
PORT=3000
NODE_ENV=development

# MongoDB
MONGO_URL=mongodb+srv://<usuario>:<contraseña>@cluster0.xxxxx.mongodb.net/innser-management

# JWT
JWT_SECRET=innser_super_secret_key_2026
JWT_EXPIRES_IN=7d

# Email (Nodemailer)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=innser.system@gmail.com
MAIL_PASS=xxxx xxxx xxxx xxxx
MAIL_FROM=innser.system@gmail.com
📡 Endpoints de la API
🔐 Autenticación
Método	Ruta	Descripción	Roles
POST	/api/auth/register	Registrar usuario	Público
POST	/api/auth/login	Iniciar sesión	Público
GET	/api/auth/current	Usuario autenticado	Autenticado
POST	/api/auth/logout	Cerrar sesión	Autenticado
POST	/api/auth/change-password	Cambiar contraseña	Autenticado
📋 Solicitudes de Mantenimiento
Método	Ruta	Descripción	Roles
POST	/api/requests	Crear solicitud	Client
GET	/api/requests	Listar solicitudes	Autenticado
GET	/api/requests/:id	Obtener solicitud	Autenticado
GET	/api/requests/my	Mis solicitudes	Client
PUT	/api/requests/:id	Actualizar solicitud	Client/Admin
PATCH	/api/requests/:id/status	Cambiar estado	Admin/Client/Tech
POST	/api/requests/:id/assign	Asignar técnico	Admin
PATCH	/api/requests/:id/cancel	Cancelar solicitud	Client/Admin
GET	/api/requests/statistics	Estadísticas	Admin
👷 Asignaciones de Técnicos
Método	Ruta	Descripción	Roles
GET	/api/assignments/my	Mis asignaciones	Technician
GET	/api/assignments/request/:id	Asignaciones por solicitud	Admin
PATCH	/api/assignments/:id/status	Actualizar estado	Technician/Admin
GET	/api/assignments/technician-availability	Ver disponibilidad	Admin
📋 Ejemplos de Uso
1. Registrar usuario (Client)
http
POST /api/auth/register
Content-Type: application/json

{
  "first_name": "Diego",
  "last_name": "Ropolo",
  "email": "diego.ropolo@sitmobili.com",
  "password": "Diego123!",
  "role": "client",
  "company": "Sit Mobili"
}
Response:

json
{
  "status": "success",
  "payload": {
    "id": "6a98af1a8cd41a7a2a020241",
    "first_name": "Diego",
    "last_name": "Ropolo",
    "email": "diego.ropolo@sitmobili.com",
    "role": "client",
    "company": "Sit Mobili"
  }
}
2. Iniciar sesión
http
POST /api/auth/login
Content-Type: application/json

{
  "email": "diego.ropolo@sitmobili.com",
  "password": "Diego123!"
}
Response:

json
{
  "status": "success",
  "message": "Login exitoso",
  "user": {
    "id": "6a98af1a8cd41a7a2a020241",
    "first_name": "Diego",
    "last_name": "Ropolo",
    "email": "diego.ropolo@sitmobili.com",
    "role": "client",
    "company": "Sit Mobili"
  }
}
Cookie generada: token (httpOnly, 7 días)

3. Crear solicitud de mantenimiento
http
POST /api/requests
Cookie: token=<token>
Content-Type: application/json

{
  "title": "Falla en sistema de refrigeración",
  "description": "El compresor no enciende y la temperatura sube",
  "serviceType": "eléctrico",
  "priority": "alta",
  "equipment": "Compresor Refrigeración",
  "company": "Sit Mobili",
  "location": "Planta Principal - Sala de Máquinas",
  "dateRequired": "2026-09-10T08:00:00Z",
  "estimatedHours": 4
}
Response:

json
{
  "status": "success",
  "payload": {
    "id": "6a99c123fdee75d3c938c4e1",
    "title": "Falla en sistema de refrigeración",
    "status": "pending",
    "requestCode": "REQ-XXXXXXXX"
  }
}
4. Asignar técnico (Admin)
http
POST /api/requests/6a99c123fdee75d3c938c4e1/assign
Cookie: token=<token_admin>
Content-Type: application/json

{
  "technicianId": "6a98af1a8cd41a7a2a020243",
  "startDate": "2026-09-05T08:00:00Z"
}
Response:

json
{
  "status": "success",
  "payload": {
    "id": "6a99d456fdee75d3c938c5f2",
    "request": {
      "id": "6a99c123fdee75d3c938c4e1",
      "title": "Falla en sistema de refrigeración"
    },
    "technician": {
      "id": "6a98af1a8cd41a7a2a020243",
      "name": "Pablo Boano",
      "email": "pablo.boano@tecnico.com",
      "specialty": "Mecánico"
    },
    "status": "assigned",
    "assignmentCode": "ASG-XXXXXXXX"
  }
}
📧 Emails enviados automáticamente:

✅ Al técnico: "Nueva Asignación de Servicio"

✅ Al cliente: "Actualización de Estado"

5. Listar solicitudes con filtros
http
GET /api/requests?status=in_progress&priority=alta&page=1&limit=5
Cookie: token=<token>
Response:

json
{
  "status": "success",
  "data": [
    {
      "id": "6a99c123fdee75d3c938c4e1",
      "title": "Falla en sistema de refrigeración",
      "status": "in_progress",
      "priority": "alta"
    }
  ],
  "page": 1,
  "limit": 5,
  "total": 1,
  "totalPages": 1
}
6. Técnico actualiza estado de asignación
http
PATCH /api/assignments/6a99d456fdee75d3c938c5f2/status
Cookie: token=<token_tecnico>
Content-Type: application/json

{
  "status": "in_progress",
  "notes": "Comenzando reparación"
}
👥 Usuarios de Prueba
Clientes
Empresa	Email	Contraseña
Sit Mobili	diego.ropolo@sitmobili.com	Diego123!
Constructora del Valle	jose.almiron@constructora.com	Jose123!
TBH	gabriel.boeris@tbh.com	Gabriel123!
Técnicos
Especialidad	Email	Contraseña
Mecánico	pablo.boano@tecnico.com	Pablo123!
Domótica	martin.sosa@tecnico.com	Martin123!
Administrador
Email	Contraseña
admin@innser.com	Admin123!
📧 Flujo de Emails
Evento	Destinatario	Asunto
Asignación de técnico	Técnico	🛠️ Nueva Asignación de Servicio
Asignación de técnico	Cliente	📊 Actualización de Estado
Cambio de estado	Cliente	📊 Actualización de Estado
🧪 Comandos Útiles
bash
# Poblar base de datos con datos de prueba
npm run seed

# Probar configuración de email
npm run test:email

# Iniciar en desarrollo (hot reload)
npm run dev

# Iniciar en producción
npm start
🚀 Deploy en Railway
https://railway.app/button.svg

Variables requeridas en Railway:
Variable	Valor
PORT	3000
MONGO_URL	URL de MongoDB Atlas
JWT_SECRET	innser_super_secret_key_2026
JWT_EXPIRES_IN	7d
NODE_ENV	production
MAIL_HOST	smtp.gmail.com
MAIL_PORT	587
MAIL_USER	innser.system@gmail.com
MAIL_PASS	Contraseña de aplicación
MAIL_FROM	innser.system@gmail.com
📝 Autor
Gustavo Atala
GitHub

📄 Licencia
ISC

📌 Tags
pre-entrega-1 - Estructura inicial

pre-entrega-2 - Registro con bcrypt

pre-entrega-3 - Autenticación JWT

entrega-final - Innser Management System (versión final)

text

---

## 📋 PASO 2: Guardar y subir

```powershell
git add README.md
git commit -m "Docs: Actualizar README para Innser Management System"
git push origin main
````
