from sqlalchemy import Column, Integer, DateTime, ForeignKey, Numeric, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.connection import Base

class Pago(Base):
    __tablename__ = "pagos"

    id_pago = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_venta = Column(Integer, ForeignKey("ventas.id_venta"), nullable=False)
    valor_pagado = Column(Numeric(12, 2), nullable=False)
    fecha_pago = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    venta = relationship("Venta", back_populates="pagos")
    detalles = relationship("PagoCuotaDetalle", back_populates="pago", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint('valor_pagado > 0', name='check_valor_pagado_positive'),
    )

class PagoCuotaDetalle(Base):
    __tablename__ = "pagos_cuota_detalle"

    id_detalle = Column(Integer, primary_key=True, index=True)
    id_pago = Column(Integer, ForeignKey("pagos.id_pago"), nullable=False)
    id_cuota = Column(Integer, ForeignKey("cuotas.id_cuota"), nullable=False)
    valor_aplicado = Column(Numeric(12, 2), nullable=False)

    pago = relationship("Pago", back_populates="detalles")
    cuota = relationship("Cuota")

    __table_args__ = (
        CheckConstraint('valor_aplicado > 0', name='check_valor_aplicado_positive'),
    )
