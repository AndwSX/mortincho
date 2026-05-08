from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.connection import get_db
from app.models.usuario_model import Usuario


# Le indica a FastAPI dónde está el endpoint de login para generar el token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Usuario:
    """
    Dependency que valida el JWT enviado por Angular en el header
    Authorization: Bearer <token>
    y retorna el usuario autenticado.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        id_usuario: int = payload.get("id_usuario")

        if id_usuario is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    usuario = db.query(Usuario).filter(
        Usuario.id_usuario == id_usuario
    ).first()

    if usuario is None:
        raise credentials_exception

    return usuario
