from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

from app.models.prestamo_model import TipoPrestamo

class PagoPrestamoCreate(BaseModel):
    id_prestamo: int
    monto: Decimal = Field(..., gt=0)
    observaciones: Optional[str] = None

class PagoPrestamoResponse(BaseModel):
    id_pago: int
    id_prestamo: int
    monto: Decimal
    fecha: datetime
    observaciones: Optional[str]

    class Config:
        from_attributes = True

class PrestamoCreate(BaseModel):
    tipo: TipoPrestamo
    concepto: str
    monto_total: Decimal = Field(..., gt=0)
    observaciones: Optional[str] = None

class PrestamoResponse(BaseModel):
    id_prestamo: int
    tipo: TipoPrestamo
    concepto: str
    monto_total: Decimal
    saldo_restante: Decimal
    fecha: datetime
    estado: str
    observaciones: Optional[str]
    pagos: List[PagoPrestamoResponse] = []

    class Config:
        from_attributes = True
