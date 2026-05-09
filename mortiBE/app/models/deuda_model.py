from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.connection import Base

class Deuda(Base):
    __tablename__ = "deudas"

    id_deuda = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    concepto = Column(String(150), nullable=False)
    monto_total = Column(Numeric(12, 2), nullable=False)
    saldo_restante = Column(Numeric(12, 2), nullable=False)
    fecha = Column(DateTime(timezone=True), server_default=func.now())
    estado = Column(String(20), default="pendiente") # 'pendiente', 'pagada', 'cancelada'
    observaciones = Column(String, nullable=True)

    pagos = relationship("PagoDeuda", back_populates="deuda", cascade="all, delete-orphan")

class PagoDeuda(Base):
    __tablename__ = "pagos_deuda"

    id_pago = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_deuda = Column(Integer, ForeignKey("deudas.id_deuda"), nullable=False)
    monto = Column(Numeric(12, 2), nullable=False)
    fecha = Column(DateTime(timezone=True), server_default=func.now())
    observaciones = Column(String, nullable=True)

    deuda = relationship("Deuda", back_populates="pagos")
