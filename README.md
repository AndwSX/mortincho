# 🌐 Sistema de Gestión Interna - Proyecto Full Stack

## Descripción general

El proyecto consiste en desarrollar un sistema web para optimizar la gestión interna de la empresa, reemplazando el manejo actual realizado en archivos Excel. El objetivo principal es mejorar la organización de la información, el control de inventario, las ventas y los movimientos financieros, permitiendo un manejo más estructurado y seguro de los datos.

El sistema estará orientado a múltiples usuarios, donde cada usuario administrará de forma independiente:

- Sus productos
- Su inventario
- Sus ventas
- Sus cuotas
- Sus movimientos de saldo
- Su historial de operaciones

Cada usuario contará con autenticación mediante correo y contraseña.

---

## Objetivos del sistema

- Implementar autenticación de usuarios mediante login y registro.
- Permitir que cada usuario gestione su propia información de manera independiente.
- Gestionar productos y controlar el stock disponible.
- Registrar entradas y salidas de inventario con historial de movimientos.
- Registrar ventas de productos.
- Gestionar ventas con anticipo y cuotas.
- Generar alertas por vencimiento de cuotas.
- Llevar control de movimientos de saldo e historial financiero.
- Mantener auditoría de movimientos e historial del sistema.

---

## Funcionalidades principales

### Gestión de usuarios
- Registro de usuarios
- Inicio de sesión
- Gestión independiente de información por usuario

### Inventario
- Registro de productos
- Control de stock
- Entradas y salidas de inventario
- Auditoría de movimientos (cada movimiento incluye tipo, cantidad, fecha, motivo y usuario responsable)

### Ventas
Cada venta está asociada a:
- Un usuario, producto y comprador (solo nombre)
- Cantidad vendida, anticipo y saldo pendiente
- Estado de la venta
- *Afecta automáticamente el stock del producto.*

### Cuotas
Cada venta puede manejar múltiples cuotas con:
- Número de cuota, valor, fecha de vencimiento, estado y fecha de pago.

### Alertas de vencimiento
- El sistema permite generar alertas automáticas cuando una cuota se encuentre próxima a vencer o vencida.

### Movimientos de saldo
Se lleva un historial financiero de ingresos y egresos relacionados con:
- Pagos de cuotas, movimientos manuales y ajustes financieros.

---

## Módulos del sistema

- Autenticación de usuarios
- Gestión de productos
- Gestión de inventario
- Gestión de ventas
- Gestión de cuotas
- Alertas de vencimiento
- Movimientos de saldo

---

## Tecnologías utilizadas

### Backend
- **Python 3.12+**
- **FastAPI**
- **PostgreSQL**
- **SQLAlchemy**
- **JWT Authentication**
- **Uvicorn**

### Frontend
- **Angular**
- **TypeScript**
- **HTML5 / CSS3 / Bootstrap**

---

## Estructura principal de la base de datos

### Entidades principales
- Usuarios
- Productos
- InventarioMovimientos
- Ventas
- Cuotas
- MovimientosSaldo
- AlertasVencimiento

---

## Reglas principales del sistema

- Cada usuario solo podrá visualizar y gestionar su propia información.
- Todas las entradas y salidas de inventario deben quedar auditadas.
- Cada venta afecta automáticamente el stock del producto.
- Las cuotas deben mantener historial y control de pagos.
- Los movimientos financieros deben quedar registrados.
- El sistema debe permitir trazabilidad completa de operaciones.

---

## Estado actual del proyecto

Actualmente se encuentra finalizado:
- Levantamiento inicial de requerimientos
- Definición de módulos
- Diseño conceptual del sistema
- Diseño del MER
- Diseño inicial de la base de datos PostgreSQL

Pendiente:
- Diseño visual del DER
- Implementación backend con FastAPI
- Creación de modelos SQLAlchemy
- Desarrollo frontend en Angular
- Implementación de autenticación JWT
- Desarrollo de alertas automáticas
- Desarrollo de reportes y estadísticas

---

> “No hay gloria en la práctica, ¡pero sin práctica no puede haber gloria!”

---

## 🧩 Estructura del proyecto

```text
mi-proyecto/
├── mortiFE/      # Aplicación Angular
├── mortiBE/      # API REST en FastAPI
└── .gitignore
```

---

## ⚙️ Configuración del entorno

### Requisitos previos

Asegúrate de tener instalados:
- Node.js 18+
- Angular CLI
- Python 3.12+
- PostgreSQL
- Git

---

## 🚀 Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/mi-proyecto.git
cd mi-proyecto
```

### 2. Configurar el backend (FastAPI)

```bash
cd mortiBE
```

#### Crear entorno virtual

**Linux / macOS**
```bash
python -m venv venv
source venv/bin/activate
```

**Windows**
```bash
python -m venv venv
venv\Scripts\activate
```

#### Instalar dependencias

```bash
pip install -r requirements.txt
```

#### Configurar variables de entorno

Crear un archivo `.env`

```env
DB_HOST=db.breulkdwhlcxxmrosbhy.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD

DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.breulkdwhlcxxmrosbhy.supabase.co:5432/postgres
```

#### Ejecutar el backend

```bash
python run.py
```

El backend quedará disponible en: `http://localhost:8000`  
Documentación automática Swagger: `http://localhost:8000/docs`

---

### 3. Configurar el frontend (Angular)

```bash
cd ../mortiFE
npm install
ng serve
```

El frontend quedará disponible en: `http://localhost:4200`

---

## 🔄 Comunicación Frontend ↔ Backend

El frontend Angular se comunica con la API FastAPI mediante peticiones HTTP REST.
Por defecto a `http://localhost:8000`.
La configuración puede modificarse desde: `mortiFE/src/environments/environment.ts`

---

## 🔐 Autenticación

El sistema utiliza autenticación JWT.
1. Usuario inicia sesión
2. FastAPI genera un JWT
3. Angular almacena el token y lo envía en cada petición protegida
4. FastAPI valida el token y obtiene el usuario autenticado

---

## 📦 Estructura recomendada del backend

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

## 🧰 Scripts útiles

### Frontend
```bash
npm run build
ng test
```

### Backend
```bash
python run.py
```

---

## 🧾 Estructura recomendada de ramas

| Rama | Descripción |
|------|--------------|
| `main` | Versión estable y lista para producción |
| `develop` | Integración de nuevas funcionalidades |
| `feature/*` | Desarrollo de nuevas características |
| `fix/*` | Corrección de errores |

---

## 👨‍💻 Autor

**Andres Ortiz**

---

## 🛡️ Licencia

Este proyecto se distribuye bajo la licencia MIT.
