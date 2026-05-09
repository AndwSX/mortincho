from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.db.connection import get_db
from app.core.auth import get_current_user
from app.models.usuario_model import Usuario
from app.schemas.deuda_schema import DeudaCreate, DeudaResponse, PagoDeudaCreate, PagoDeudaResponse
from app.services.deuda_service import crear_deuda, registrar_pago_deuda, obtener_deudas

router = APIRouter(
    prefix="/deudas",
    tags=["Deudas"]
)

@router.post("/", response_model=DeudaResponse, status_code=status.HTTP_201_CREATED)
def crear(
    datos: DeudaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return crear_deuda(db, datos, current_user.id_usuario)

@router.get("/", response_model=List[DeudaResponse])
def listar(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return obtener_deudas(db, current_user.id_usuario)

@router.post("/pagos", response_model=PagoDeudaResponse, status_code=status.HTTP_201_CREATED)
def pagar(
    datos: PagoDeudaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return registrar_pago_deuda(db, datos, current_user.id_usuario)
