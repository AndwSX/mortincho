from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.connection import get_db
from app.core.auth import get_current_user
from app.models.usuario_model import Usuario
from app.schemas.producto_schema import (
    ProductoCreate,
    ProductoUpdate,
    ProductoEstado,
    ProductoResponse
)
from app.services.producto_service import (
    crear_producto,
    obtener_productos,
    obtener_producto,
    actualizar_producto,
    cambiar_estado_producto
)

router = APIRouter(
    prefix="/productos",
    tags=["Productos"]
)


# ─────────────────────────────────────────
# POST /productos  →  Crear producto
# ─────────────────────────────────────────
@router.post(
    "/",
    response_model=ProductoResponse,
    status_code=status.HTTP_201_CREATED
)
def crear(
    datos: ProductoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return crear_producto(db, datos, current_user.id_usuario)


# ─────────────────────────────────────────
# GET /productos  →  Listar productos del usuario
# ─────────────────────────────────────────
@router.get(
    "/",
    response_model=List[ProductoResponse]
)
def listar(
    solo_activos: bool = True,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    return obtener_productos(db, current_user.id_usuario, solo_activos)


# ─────────────────────────────────────────
# GET /productos/{id}  →  Obtener un producto
# ─────────────────────────────────────────
@router.get(
    "/{id_producto}",
    response_model=ProductoResponse
)
def obtener(
    id_producto: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    producto = obtener_producto(db, id_producto, current_user.id_usuario)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    return producto


# ─────────────────────────────────────────
# PUT /productos/{id}  →  Actualizar nombre/descripción
# ─────────────────────────────────────────
@router.put(
    "/{id_producto}",
    response_model=ProductoResponse
)
def actualizar(
    id_producto: int,
    datos: ProductoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    producto = obtener_producto(db, id_producto, current_user.id_usuario)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    if not producto.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede editar un producto desactivado"
        )
    return actualizar_producto(db, producto, datos)


# ─────────────────────────────────────────
# PATCH /productos/{id}/estado  →  Activar/Desactivar
# ─────────────────────────────────────────
@router.patch(
    "/{id_producto}/estado",
    response_model=ProductoResponse
)
def cambiar_estado(
    id_producto: int,
    datos: ProductoEstado,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    producto = obtener_producto(db, id_producto, current_user.id_usuario)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    
    if producto.activo == datos.activo:
        estado_str = "activo" if datos.activo else "desactivado"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El producto ya está {estado_str}"
        )
        
    return cambiar_estado_producto(db, producto, datos.activo)
