# 🌐 Proyecto Full Stack: Angular + FastAPI

Este repositorio contiene un sistema full stack desarrollado con **Angular** para el frontend y **FastAPI** para el backend.  
El objetivo es ofrecer una arquitectura moderna, escalable y mantenible, separando las responsabilidades del cliente y del servidor.

---

## 🧩 Estructura del proyecto

```text
mi-proyecto/
├── mortiFE/      # Aplicación Angular
├── mortiBE/      # API REST en FastAPI
└── .gitignore
```

---

## 🚀 Tecnologías utilizadas

### 🔹 Frontend
- Angular
- TypeScript
- HTML5 / CSS3
- Bootstrap

### 🔹 Backend
- FastAPI
- Python 3.12+
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- Uvicorn

---

## ⚙️ Configuración del entorno

### 🔸 Requisitos previos

Asegúrate de tener instalados:

- Node.js 18+
- Angular CLI
- Python 3.12+
- PostgreSQL
- Git

---

# 🧠 Instalación y ejecución

## 🔹 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/mi-proyecto.git
cd mi-proyecto
```

---

# 🔹 2. Configurar el backend (FastAPI)

```bash
cd mortiBE
```

## Crear entorno virtual

### Linux / macOS

```bash
python -m venv venv
source venv/bin/activate
```

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

---

## Instalar dependencias

```bash
pip install -r requirements.txt
```

---

## Configurar variables de entorno

Crear un archivo `.env`

```env
DB_HOST=db.breulkdwhlcxxmrosbhy.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD

DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.breulkdwhlcxxmrosbhy.supabase.co:5432/postgres
```

---

## Ejecutar el backend

```bash
python run.py
```

El backend quedará disponible en:

```text
http://localhost:8000
```

---

## Documentación automática Swagger

```text
http://localhost:8000/docs
```

---

# 🔹 3. Configurar el frontend (Angular)

```bash
cd ../mortiFE
npm install
ng serve
```

El frontend quedará disponible en:

```text
http://localhost:4200
```

---

# 🔄 Comunicación Frontend ↔ Backend

El frontend Angular se comunica con la API FastAPI mediante peticiones HTTP REST.

Por defecto:

```text
http://localhost:8000
```

La configuración puede modificarse desde:

```text
mortiFE/src/environments/environment.ts
```

---

# 🔐 Autenticación

El sistema utiliza autenticación JWT.

## Flujo de autenticación

1. Usuario inicia sesión
2. FastAPI genera un JWT
3. Angular almacena el token
4. Angular envía el token en cada petición protegida
5. FastAPI valida el token y obtiene el usuario autenticado

---

# 📦 Estructura recomendada del backend

```text
mortiBE/
│
├── app/
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   └── main.py
│
├── requirements.txt
├── .env
└── run.py
```

---

# 🧰 Scripts útiles

## Frontend

```bash
npm run build
ng test
```

## Backend

```bash
python run.py
```

---

# 🧾 Estructura recomendada de ramas

| Rama | Descripción |
|------|--------------|
| `main` | Versión estable y lista para producción |
| `develop` | Integración de nuevas funcionalidades |
| `feature/*` | Desarrollo de nuevas características |
| `fix/*` | Corrección de errores |

---

# 👨‍💻 Autor

**Andres Ortiz**

---

# 🛡️ Licencia

Este proyecto se distribuye bajo la licencia MIT.
