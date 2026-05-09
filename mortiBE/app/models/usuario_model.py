from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from app.db.connection import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)

    usuario = Column(String(100), unique=True, nullable=False)

    correo = Column(String(150), nullable=False)

    password_hash = Column(String, nullable=False)

    activo = Column(Boolean, default=True)

    fecha_creacion = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )