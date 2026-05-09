from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Numeric, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.connection import Base

class EstadoVenta(str, enum.Enum):
    pendiente = "pendiente"
    pagando = "pagando"
    pagado = "pagado"

class Venta(Base):
    __tablename__ = "ventas"

    id_venta = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_producto = Column(Integer, ForeignKey("productos.id_producto"), nullable=False)
    nombre_cliente = Column(String(150), nullable=False)
    total_venta = Column(Numeric(12, 2), nullable=False)
    anticipo = Column(Numeric(12, 2), nullable=False, default=0)
    saldo_pendiente = Column(Numeric(12, 2), nullable=False)
    estado = Column(Enum(EstadoVenta, name="estado_venta"), default=EstadoVenta.pendiente)
    fecha_venta = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    cuotas = relationship("Cuota", back_populates="venta", cascade="all, delete-orphan", order_by="Cuota.numero_cuota")
    pagos = relationship("Pago", back_populates="venta")

    __table_args__ = (
        CheckConstraint('total_venta > 0', name='check_total_venta_positive'),
        CheckConstraint('anticipo >= 0 AND anticipo <= total_venta', name='check_anticipo_range'),
        CheckConstraint('saldo_pendiente >= 0', name='check_saldo_pendiente_positive'),
    )
