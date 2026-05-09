from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProductoCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None


class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None


class ProductoEstado(BaseModel):
    activo: bool


class ProductoResponse(BaseModel):
    id_producto: int
    id_usuario: int
    nombre: str
    descripcion: Optional[str]
    stock_actual: int
    activo: bool
    fecha_creacion: datetime

    class Config:
        from_attributes = True
