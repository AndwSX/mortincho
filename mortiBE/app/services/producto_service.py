from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.producto_model import Producto
from app.schemas.producto_schema import ProductoCreate, ProductoUpdate


def crear_producto(
    db: Session,
    datos: ProductoCreate,
    id_usuario: int
) -> Producto:
    nuevo = Producto(
        id_usuario=id_usuario,
        nombre=datos.nombre,
        descripcion=datos.descripcion,
        stock_actual=0
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


def obtener_productos(
    db: Session,
    id_usuario: int,
    solo_activos: bool = True
) -> List[Producto]:
    query = db.query(Producto).filter(
        Producto.id_usuario == id_usuario
    )
    if solo_activos:
        query = query.filter(Producto.activo == True)
    return query.order_by(Producto.fecha_creacion.desc()).all()


def obtener_producto(
    db: Session,
    id_producto: int,
    id_usuario: int
) -> Optional[Producto]:
    return db.query(Producto).filter(
        Producto.id_producto == id_producto,
        Producto.id_usuario == id_usuario
    ).first()


def actualizar_producto(
    db: Session,
    producto: Producto,
    datos: ProductoUpdate
) -> Producto:
    if datos.nombre is not None:
        producto.nombre = datos.nombre
    if datos.descripcion is not None:
        producto.descripcion = datos.descripcion
    db.commit()
    db.refresh(producto)
    return producto


def desactivar_producto(
    db: Session,
    producto: Producto
) -> Producto:
    producto.activo = False
    db.commit()
    db.refresh(producto)
    return producto
