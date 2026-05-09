from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Numeric, Boolean
from sqlalchemy.sql import func
import enum
from app.db.connection import Base

class TipoMovimientoSaldo(str, enum.Enum):
    ingreso = "ingreso"
    gasto = "gasto"
    prestamo_entregado = "prestamo_entregado"
    prestamo_recibido = "prestamo_recibido"

class MovimientoSaldo(Base):
    __tablename__ = "movimientos_saldo"

    id_movimiento = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    tipo = Column(Enum(TipoMovimientoSaldo, name="tipo_movimiento_saldo"), nullable=False)
    concepto = Column(String(255), nullable=False)
    monto = Column(Numeric(12, 2), nullable=False)
    fecha = Column(DateTime(timezone=True), server_default=func.now())
    afecta_capital = Column(Boolean, default=True)
    referencia_tabla = Column(String(50), nullable=True)
    referencia_id = Column(Integer, nullable=True)
    observaciones = Column(String, nullable=True)
