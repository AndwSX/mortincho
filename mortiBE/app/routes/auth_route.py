from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.connection import get_db

from app.schemas.auth_schema import LoginSchema
from app.services.auth_service import autenticar_usuario
from app.core.security import crear_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


@router.post("/login")
def login(
    datos: LoginSchema,
    db: Session = Depends(get_db)
):
    usuario = autenticar_usuario(
        db,
        datos.usuario,
        datos.password
    )

    if not usuario:
        raise HTTPException(
            status_code=401,
            detail="Credenciales inválidas"
        )

    token = crear_access_token({
        "id_usuario": usuario.id_usuario,
        "usuario": usuario.usuario
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }