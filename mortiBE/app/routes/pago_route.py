from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.connection import get_db
from app.core.auth import get_current_user
from app.models.usuario_model import Usuario
from app.schemas.pago_schema import PagoCreate, PagoResponse
from app.services.pago_service import registrar_pago

router = APIRouter(
    prefix="/pagos",
    tags=["Pagos"]
)

@router.post(
    "/",
    response_model=PagoResponse,
    status_code=status.HTTP_201_CREATED
)
def crear(
    datos: PagoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Registra un pago y lo distribuye automáticamente entre las cuotas pendientes de la venta.
    Actualiza el saldo de la venta y los estados correspondientes.
    Todo ocurre en una transacción.
    """
    return registrar_pago(db, datos, current_user.id_usuario)
