from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.db.connection import engine, Base

from app.routes.usuario_route import router as usuario_router
from app.routes.auth_route import router as auth_router
from app.routes.producto_route import router as producto_router
from app.routes.inventario_route import router as inventario_router
from app.routes.venta_route import router as venta_router
from app.routes.pago_route import router as pago_router
from app.routes.movimiento_saldo_route import router as movimiento_saldo_router
from app.routes.prestamo_route import router as prestamo_router
from app.routes.deuda_route import router as deuda_router

# IMPORTANTE:
# Esto fuerza a SQLAlchemy a registrar el modelo
from app.models.usuario_model import Usuario


app = FastAPI(
    title="Sistema Inventario Mortincho"
)

# =========================
# CONFIGURACIÓN CORS
# =========================

frontend_url = os.getenv("FRONTEND_URL")

print("FRONTEND_URL:", frontend_url)

if frontend_url:
    origins = [url.strip().rstrip("/") for url in frontend_url.split(",")]
else:
    origins = [
        "http://localhost:4200",
        "https://mortincho.vercel.app"
    ]

print("ORIGINS:", origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# STARTUP
# =========================

@app.on_event("startup")
def startup():
    try:
        print("Creando tablas...")
        Base.metadata.create_all(bind=engine)
        print("Base de datos conectada correctamente")
    except Exception as e:
        print("ERROR DB:", str(e))

# =========================
# ROUTES
# =========================

app.include_router(usuario_router)
app.include_router(auth_router)
app.include_router(producto_router)
app.include_router(inventario_router)
app.include_router(venta_router)
app.include_router(pago_router)
app.include_router(movimiento_saldo_router)
app.include_router(prestamo_router)
app.include_router(deuda_router)

# =========================
# ROOT
# =========================

@app.get("/")
def home():
    return {
        "message": "API funcionando"
    }