from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

class PagoDeudaCreate(BaseModel):
    id_deuda: int
    monto: Decimal = Field(..., gt=0)
    observaciones: Optional[str] = None

class PagoDeudaResponse(BaseModel):
    id_pago: int
    id_deuda: int
    monto: Decimal
    fecha: datetime
    observaciones: Optional[str]

    class Config:
        from_attributes = True

class DeudaCreate(BaseModel):
    concepto: str
    monto_total: Decimal = Field(..., gt=0)
    observaciones: Optional[str] = None

class DeudaResponse(BaseModel):
    id_deuda: int
    concepto: str
    monto_total: Decimal
    saldo_restante: Decimal
    fecha: datetime
    estado: str
    observaciones: Optional[str]
    pagos: List[PagoDeudaResponse] = []

    class Config:
        from_attributes = True
