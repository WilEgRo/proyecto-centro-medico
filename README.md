# Sistema de Turnos y Gestión de Pacientes - Centro Médico Universitario

Este proyecto es una aplicación web Fullstack (MERN) diseñada para gestionar la atención de pacientes, turnos médicos y administración de usuarios en un Centro Médico Universitario.

El sistema resuelve problemas de doble asignación, falta de control de acceso y gestión manual de historias clínicas.

## 🚀 Despliegue (Demo)

- **Frontend (Vercel):** [Pegar aquí tu URL de Vercel]
- **Backend (Render):** [Pegar aquí tu URL de Render]

---

## 🛠️ Tecnologías Utilizadas

El proyecto fue desarrollado utilizando TypeScript para garantizar la robustez del código.

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt.
- **Frontend:** React (Vite), React Router, Axios, CSS Modules.
- **Infraestructura:** Render (API), Vercel (Cliente), MongoDB Atlas.

---

## 👥 Roles y Funcionalidades

El sistema cuenta con autenticación y autorización basada en roles (RBAC):

### 1. Administrador
- **Gestión de Usuarios:** Puede crear nuevos usuarios asignando roles (Admin, Médico, Recepcionista).
- **Auditoría:** Visualización de listados de usuarios y control del sistema.

### 2. Recepcionista
- **Gestión de Pacientes:** Registro de nuevos pacientes con datos personales (CI, nombre, etc.).
- **Gestión de Turnos:** Agendamiento de citas validando disponibilidad de médicos.
- **Visualización:** Listado de turnos programados.

### 3. Médico
- **Panel Personal:** Visualización exclusiva de sus propios turnos asignados.
- **Gestión de Atención:**
  - Marcar turno como **ATENDIDO**.
  - Marcar turno como **AUSENTE** (con registro de motivo/nota).
- **Historial:** Acceso al historial de sus atenciones realizadas.

---

## ⚙️ Instalación y Configuración Local

Si deseas correr este proyecto en tu máquina local, sigue estos pasos:

### Prerrequisitos
- Node.js (v16 o superior)
- MongoDB (Local o Atlas)

### 1. Clonar el repositorio
```bash
git clone <TU_URL_DEL_REPOSITORIO>
cd proyecto-centro-medico
```
### 2. Configurar el Backend
```bash
cd server
npm install
```
- Crea un archivo .env basado en .env.example.
- Configura tu MONGO_URI y JWT_SECRET.

Poblar la Base de Datos (Seed): Para crear los usuarios iniciales (Admin, Médico, Recepción), ejecuta:
```bash
npm run seed
```

Iniciar Servidor:
```bash
npm run dev
```

### 3. Configurar el Frontend
Abrir una nueva terminal:
```bash
cd client
npm install
```
- Crea un archivo .env basado en .env.example.
- Asegúrate de que VITE_API_URL apunte a tu backend (ej. http://localhost:4000/api).

Iniciar Cliente:
```bash
npm run dev
```
🔒 Seguridad Implementada
- Autenticación: Tokens JWT (JSON Web Tokens) con expiración.
- Autorización: Middlewares checkAuth y checkRole para proteger rutas sensibles.
- Datos: Contraseñas hasheadas con bcrypt antes de guardar en base de datos.
- CORS: Configurado para permitir peticiones solo desde dominios autorizados en producción.

📂 Estructura del Proyecto
```bash
/
├── client/                        # Frontend (React + Vite + TypeScript)
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── components/            # Componentes reutilizables
│       ├── context/               # Contextos (ej. AuthContext)
│       ├── hooks/                 # Hooks personalizados
│       ├── pages/                 # Vistas principales por rol
│       ├── services/              # Configuración de Axios / API
│       ├── styles/                # Estilos globales / utilidades
│       └── main.tsx               # Entrada del app
├── server/                        # Backend (Node.js + Express + TypeScript)
│   ├── .env
│   ├── .env.example
│   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── controllers/           # Lógica de negocio (peticiones)
│       │   ├── appointment.Controller.ts
│       │   ├── auth.Controller.ts
│       │   ├── patient.Controller.ts
│       │   └── user.Controller.ts
│       ├── middlewares/           # Middlewares (auth, roles)
│       │   ├── checkAuth.ts
│       │   └── checkRole.ts
│       ├── models/                # Esquemas Mongoose
│       │   ├── appointment.Model.ts
│       │   ├── patient.Model.ts
│       │   └── user.Model.ts
│       ├── routes/                # Definición de rutas
│       │   ├── appointment.Routes.ts
│       │   ├── auth.Routes.ts
│       │   ├── patient.Routes.ts
│       │   └── user.Routes.ts
│       ├── index.ts               # Entrada principal (Express app)
│       └── seed.ts                # Script para poblar DB de prueba
├── .gitignore
└── README.md
```