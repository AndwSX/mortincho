from pydantic import BaseModel, EmailStr


class UsuarioCreate(BaseModel):
    usuario: str
    correo: EmailStr
    password: str


class UsuarioResponse(BaseModel):
    id_usuario: int
    usuario: str
    correo: str

    class Config:
        from_attributes = True