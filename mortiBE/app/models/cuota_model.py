from sqlalchemy import Column, Integer, DateTime, ForeignKey, Enum, Numeric, Date, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
import enum
from app.db.connection import Base

class EstadoCuota(str, enum.Enum):
    pendiente = "pendiente"
    pagada = "pagada"

class Cuota(Base):
    __tablename__ = "cuotas"

    id_cuota = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_venta = Column(Integer, ForeignKey("ventas.id_venta"), nullable=False)
    numero_cuota = Column(Integer, nullable=False)
    valor_original = Column(Numeric(12, 2), nullable=False)
    valor_restante = Column(Numeric(12, 2), nullable=False)
    fecha_vencimiento = Column(Date, nullable=False)
    fecha_ultimo_pago = Column(DateTime(timezone=True), nullable=True)
    estado = Column(Enum(EstadoCuota), default=EstadoCuota.pendiente)

    venta = relationship("Venta", back_populates="cuotas")

    __table_args__ = (
        UniqueConstraint('id_venta', 'numero_cuota', name='uq_cuota_numero'),
        CheckConstraint('valor_original > 0', name='check_valor_original_positive'),
        CheckConstraint('valor_restante >= 0 AND valor_restante <= valor_original', name='check_valor_restante_range'),
    )
