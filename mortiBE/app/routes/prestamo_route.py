from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.db.connection import get_db
from app.core.auth import get_current_user
from app.models.usuario_model import Usuario
from app.schemas.prestamo_schema import PrestamoCreate, PrestamoResponse, PagoPrestamoCreate, PagoPrestamoResponse
from app.services.prestamo_service import crear_prestamo, registrar_pago_prestamo, obtener_prestamos

router = APIRouter(
    prefix="/prestamos",
    tags=["Préstamos"]
)

@router.post("/", response_model=PrestamoResponse, status_code=status.HTTP_201_CREATED)
def crear(
    datos: PrestamoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return crear_prestamo(db, datos, current_user.id_usuario)

@router.get("/", response_model=List[PrestamoResponse])
def listar(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return obtener_prestamos(db, current_user.id_usuario)

@router.post("/pagos", response_model=PagoPrestamoResponse, status_code=status.HTTP_201_CREATED)
def pagar(
    datos: PagoPrestamoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return registrar_pago_prestamo(db, datos, current_user.id_usuario)
