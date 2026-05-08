from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.connection import get_db
from app.core.auth import get_current_user
from app.models.usuario_model import Usuario
from app.schemas.inventario_schema import InventarioMovimientoCreate, InventarioBatchResponse
from app.services.inventario_service import registrar_movimientos_batch

router = APIRouter(
    prefix="/inventario",
    tags=["Inventario"]
)

@router.post(
    "/movimientos",
    response_model=InventarioBatchResponse,
    status_code=status.HTTP_201_CREATED
)
def registrar_movimientos(
    datos: InventarioMovimientoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Registra movimientos de inventario (entrada/salida/ajustes) para múltiples productos.
    Todo el proceso ocurre dentro de una transacción: si un producto falla, nada se guarda.
    """
    return registrar_movimientos_batch(db, datos, current_user.id_usuario)
