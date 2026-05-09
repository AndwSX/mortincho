from sqlalchemy.orm import Session

from app.models.usuario_model import Usuario
from app.schemas.usuario_schema import UsuarioCreate
from app.core.security import hash_password


def crear_usuario(
    db: Session,
    usuario: UsuarioCreate
):

    existe = db.query(Usuario).filter(
        Usuario.usuario == usuario.usuario
    ).first()

    if existe:
        return None

    nuevo_usuario = Usuario(
        usuario=usuario.usuario,
        correo=usuario.correo,
        password_hash=hash_password(usuario.password)
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return nuevo_usuario