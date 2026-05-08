from sqlalchemy.orm import Session
from app.models.usuario_model import Usuario
from app.core.security import verify_password


def autenticar_usuario(
    db: Session,
    usuario: str,
    password: str
):

    db_usuario = db.query(Usuario).filter(
        Usuario.usuario == usuario
    ).first()

    if not db_usuario:
        return None

    if not verify_password(
        password,
        db_usuario.password_hash
    ):
        return None

    return db_usuario