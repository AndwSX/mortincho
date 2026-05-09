from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Numeric, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.connection import Base
import enum

class TipoPrestamo(str, enum.Enum):
    entregado = "entregado"
    recibido = "recibido"

class Prestamo(Base):
    __tablename__ = "prestamos"

    id_prestamo = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    tipo = Column(Enum(TipoPrestamo, name="tipo_prestamo"), nullable=False)
    concepto = Column(String(150), nullable=False)
    monto_total = Column(Numeric(12, 2), nullable=False)
    saldo_restante = Column(Numeric(12, 2), nullable=False)
    fecha = Column(DateTime(timezone=True), server_default=func.now())
    estado = Column(String(20), default="activo") # 'activo', 'pagado', 'cancelado'
    observaciones = Column(String, nullable=True)

    pagos = relationship("PagoPrestamo", back_populates="prestamo", cascade="all, delete-orphan")

class PagoPrestamo(Base):
    __tablename__ = "pagos_prestamo"

    id_pago = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_prestamo = Column(Integer, ForeignKey("prestamos.id_prestamo"), nullable=False)
    monto = Column(Numeric(12, 2), nullable=False)
    fecha = Column(DateTime(timezone=True), server_default=func.now())
    observaciones = Column(String, nullable=True)

    prestamo = relationship("Prestamo", back_populates="pagos")
