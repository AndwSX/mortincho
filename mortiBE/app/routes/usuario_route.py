from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.connection import get_db

from app.schemas.usuario_schema import (
    UsuarioCreate,
    UsuarioResponse
)

from app.services.usuario_service import crear_usuario
from app.core.auth import get_current_user
from app.models.usuario_model import Usuario

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)


@router.post(
    "/registro",
    response_model=UsuarioResponse
)
def registro_usuario(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db)
):
    nuevo_usuario = crear_usuario(db, usuario)

    if not nuevo_usuario:
        raise HTTPException(
            status_code=400,
            detail="El correo ya está registrado"
        )

    return nuevo_usuario


@router.get(
    "/me",
    response_model=UsuarioResponse
)
def obtener_mi_perfil(
    current_user: Usuario = Depends(get_current_user)
):
    """
    Ruta protegida. Angular debe enviar:
    Authorization: Bearer <token>
    """
    return current_user