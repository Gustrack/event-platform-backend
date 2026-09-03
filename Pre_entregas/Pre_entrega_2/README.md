# Event Platform - Registro seguro de usuarios

## Instalacion
npm install
copy .env.example .env
npm run dev

## Endpoint
POST /api/sessions/register

## Body ejemplo
{
  first_name: Ana,
  last_name: Perez,
  email: ana@mail.com,
  password: Secreta123
}
