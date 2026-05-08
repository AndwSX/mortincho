from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.models.inventario_movimiento_model import TipoMovimientoInventario

class MovimientoProductoSchema(BaseModel):
    id_producto: int
    cantidad: int = Field(..., gt=0)

class InventarioMovimientoCreate(BaseModel):
    tipo_movimiento: TipoMovimientoInventario
    motivo: Optional[str] = None
    productos: List[MovimientoProductoSchema]

class InventarioMovimientoResponse(BaseModel):
    id_movimiento: int
    id_producto: int
    tipo_movimiento: TipoMovimientoInventario
    cantidad: int
    motivo: Optional[str]
    fecha_movimiento: datetime

    class Config:
        from_attributes = True

class InventarioBatchResponse(BaseModel):
    mensaje: str
    movimientos_creados: int
