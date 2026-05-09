from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.db.connection import get_db
from app.core.auth import get_current_user
from app.models.usuario_model import Usuario
from app.schemas.movimiento_saldo_schema import MovimientoSaldoCreate, MovimientoSaldoResponse, CapitalActualResponse
from app.services.movimiento_saldo_service import registrar_movimiento, obtener_movimientos, obtener_capital_actual

router = APIRouter(
    prefix="/movimientos-saldo",
    tags=["Movimientos de Saldo"]
)

@router.post("/", response_model=MovimientoSaldoResponse, status_code=status.HTTP_201_CREATED)
def crear(
    datos: MovimientoSaldoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return registrar_movimiento(db, datos, current_user.id_usuario)

@router.get("/", response_model=List[MovimientoSaldoResponse])
def listar(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return obtener_movimientos(db, current_user.id_usuario)

@router.get("/capital", response_model=CapitalActualResponse)
def capital(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    capital = obtener_capital_actual(db, current_user.id_usuario)
    return {"capital_actual": capital}
