from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal
from app.models.movimiento_saldo_model import TipoMovimientoSaldo

class MovimientoSaldoCreate(BaseModel):
    tipo: TipoMovimientoSaldo
    concepto: str
    monto: Decimal = Field(..., gt=0)
    afecta_capital: bool = True
    referencia_tabla: Optional[str] = None
    referencia_id: Optional[int] = None
    observaciones: Optional[str] = None

class MovimientoSaldoResponse(BaseModel):
    id_movimiento: int
    tipo: TipoMovimientoSaldo
    concepto: str
    monto: Decimal
    fecha: datetime
    afecta_capital: bool
    referencia_tabla: Optional[str]
    referencia_id: Optional[int]
    observaciones: Optional[str]

    class Config:
        from_attributes = True

class CapitalActualResponse(BaseModel):
    capital_actual: Decimal
