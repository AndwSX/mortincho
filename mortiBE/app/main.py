from fastapi import FastAPI

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

from fastapi.middleware.cors import CORSMiddleware

from app.models.usuario_model import Usuario


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sistema Inventario Mortincho"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, pon aquí la URL de tu Angular
    allow_credentials=True,
    allow_methods=["*"],  # Esto permitirá OPTIONS, POST, GET, etc.
    allow_headers=["*"],
)


app.include_router(usuario_router)
app.include_router(auth_router)
app.include_router(producto_router)
app.include_router(inventario_router)
app.include_router(venta_router)
app.include_router(pago_router)
app.include_router(movimiento_saldo_router)
app.include_router(prestamo_router)
app.include_router(deuda_router)


@app.get("/")
def home():
    return {
        "message": "API funcionando"
    }