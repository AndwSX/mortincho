# 🌐 Proyecto Full Stack: Angular + Spring Boot

Este repositorio contiene un sistema full stack desarrollado con **Angular** para el frontend y **Spring Boot** para el backend.  
El objetivo es ofrecer una arquitectura moderna, escalable y mantenible, separando las responsabilidades del cliente y del servidor.

---

## 🧩 Estructura del proyecto

```
mi-proyecto/
├── mortiFE/     # Aplicación Angular
├── mortiBE/      # API REST en Spring Boot
└── .gitignore
```

---

## 🚀 Tecnologías utilizadas

### 🔹 Frontend
- [Angular](https://angular.io/)
- TypeScript
- HTML5 / CSS3
- Bootstrap

### 🔹 Backend
- [Spring Boot](https://spring.io/projects/spring-boot)
- Java 21
- Spring Data JPA
- PostgreSQL
- Maven

---

## ⚙️ Configuración del entorno

### 🔸 Requisitos previos

Asegúrate de tener instalados:
- [Node.js](https://nodejs.org/) (versión 18+)
- [Angular CLI](https://angular.io/cli)
- [Java JDK 17+](https://adoptium.net/)
- [Maven](https://maven.apache.org/)
- Base de datos (PostgreSQL)
- Git

---

## 🧠 Instalación y ejecución

### 🔹 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/mi-proyecto.git
cd mi-proyecto
```

### 🔹 2. Configurar el backend
```bash
cd mortiBE
# Si usas Maven:
mvn clean install
# Ejecutar la API
mvn spring-boot:run
```

El backend quedará disponible en:
```
http://localhost:8080
```

---

### 🔹 3. Configurar el frontend
```bash
cd ../mortiFE
npm install
ng serve
```

El frontend quedará disponible en:
```
http://localhost:4200
```

---

## 🔄 Comunicación Frontend ↔ Backend

El frontend Angular se comunica con la API de Spring Boot mediante peticiones HTTP (REST) a los endpoints definidos en el backend.  
Por defecto, las peticiones se realizan hacia:
```
http://localhost:8080/api/
```

Si deseas cambiar esta URL, modifícala en el archivo de entorno:
```
frontend/src/environments/environment.ts
```

---

## 🧰 Scripts útiles

### Frontend
```bash
npm run build     # Compila la app para producción
ng test           # Ejecuta pruebas unitarias
```

### Backend
```bash
mvn test          # Ejecuta pruebas del backend
mvn package       # Genera el archivo .jar
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

**Tu nombre o equipo**  
📧 *tu-correo@ejemplo.com*  
🌐 [Tu perfil de GitHub](https://github.com/tu-usuario)

---

## 🛡️ Licencia

Este proyecto se distribuye bajo la licencia **MIT**.  
Consulta el archivo [LICENSE](LICENSE) para más detalles.
