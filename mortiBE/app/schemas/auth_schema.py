from pydantic import BaseModel, EmailStr


class LoginSchema(BaseModel):
    correo: EmailStr
    password: str