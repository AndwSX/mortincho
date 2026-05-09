from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
from decimal import Decimal

class PagoCreate(BaseModel):
    id_venta: int
    valor_pagado: Decimal = Field(..., gt=0)

class PagoDetalleResponse(BaseModel):
    id_cuota: int
    valor_aplicado: Decimal

    class Config:
        from_attributes = True

class PagoResponse(BaseModel):
    id_pago: int
    id_venta: int
    valor_pagado: Decimal
    fecha_pago: datetime
    detalles: List[PagoDetalleResponse]

    class Config:
        from_attributes = True
