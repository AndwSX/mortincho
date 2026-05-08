from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
import enum

from app.db.connection import Base

class TipoMovimientoInventario(str, enum.Enum):
    entrada = "entrada"
    salida = "salida"
    ajuste_entrada = "ajuste_entrada"
    ajuste_salida = "ajuste_salida"

class InventarioMovimiento(Base):
    __tablename__ = "inventario_movimientos"

    id_movimiento = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_producto = Column(Integer, ForeignKey("productos.id_producto"), nullable=False)
    tipo_movimiento = Column(Enum(TipoMovimientoInventario), nullable=False)
    cantidad = Column(Integer, nullable=False)
    motivo = Column(String(255), nullable=True)
    fecha_movimiento = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
