from fastapi import FastAPI

from app.db.connection import engine, Base

from app.routes.usuario_route import router as usuario_router
from app.routes.auth_route import router as auth_router

from app.models.usuario_model import Usuario


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sistema Inventario Mortincho"
)


app.include_router(usuario_router)
app.include_router(auth_router)


@app.get("/")
def home():
    return {
        "message": "API funcionando"
    }