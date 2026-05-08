from sqlalchemy.orm import Session
from app.models.usuario_model import Usuario
from app.core.security import verify_password


def autenticar_usuario(
    db: Session,
    correo: str,
    password: str
):

    usuario = db.query(Usuario).filter(
        Usuario.correo == correo
    ).first()

    if not usuario:
        return None

    if not verify_password(
        password,
        usuario.password_hash
    ):
        return None

    return usuario