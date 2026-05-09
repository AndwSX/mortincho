from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.db.connection import get_db
from app.core.auth import get_current_user
from app.models.usuario_model import Usuario
from app.schemas.venta_schema import VentaCreate, VentaResponse
from app.services.venta_service import registrar_venta, obtener_ventas_usuario, obtener_venta_detalle

router = APIRouter(
    prefix="/ventas",
    tags=["Ventas"]
)

@router.post(
    "/",
    response_model=VentaResponse,
    status_code=status.HTTP_201_CREATED
)
def crear(
    datos: VentaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Registra una nueva venta (contado o financiada).
    Genera automáticamente el movimiento de inventario y las cuotas si aplica.
    Todo ocurre en una transacción.
    """
    return registrar_venta(db, datos, current_user.id_usuario)

@router.get(
    "/",
    response_model=List[VentaResponse]
)
def listar(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return obtener_ventas_usuario(db, current_user.id_usuario)

@router.get(
    "/{id_venta}",
    response_model=VentaResponse
)
def obtener(
    id_venta: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    venta = obtener_venta_detalle(db, id_venta, current_user.id_usuario)
    if not venta:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venta no encontrada"
        )
    return venta
