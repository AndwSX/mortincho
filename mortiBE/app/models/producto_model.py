from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.db.connection import Base


class Producto(Base):
    __tablename__ = "productos"

    id_producto = Column(Integer, primary_key=True, index=True)

    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)

    nombre = Column(String(150), nullable=False)

    descripcion = Column(Text, nullable=True)

    stock_actual = Column(Integer, nullable=False, default=0)

    activo = Column(Boolean, default=True)

    fecha_creacion = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
