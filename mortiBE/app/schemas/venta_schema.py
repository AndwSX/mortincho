from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal
from app.models.venta_model import EstadoVenta
from app.models.cuota_model import EstadoCuota

class VentaCreate(BaseModel):
    id_producto: int
    nombre_cliente: str
    total_venta: Decimal = Field(..., gt=0)
    anticipo: Decimal = Field(default=0, ge=0)
    numero_cuotas: int = Field(default=0, ge=0)

class CuotaResponse(BaseModel):
    id_cuota: int
    numero_cuota: int
    valor_original: Decimal
    valor_restante: Decimal
    fecha_vencimiento: date
    estado: EstadoCuota

    class Config:
        from_attributes = True

class VentaResponse(BaseModel):
    id_venta: int
    id_producto: int
    nombre_producto: str
    nombre_cliente: str
    total_venta: Decimal
    anticipo: Decimal
    saldo_pendiente: Decimal
    estado: EstadoVenta
    fecha_venta: datetime
    cuotas: List[CuotaResponse] = []

    class Config:
        from_attributes = True
