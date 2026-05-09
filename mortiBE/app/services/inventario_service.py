from sqlalchemy.orm import Session
from typing import Optional
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from app.models.inventario_movimiento_model import InventarioMovimiento
from app.models.producto_model import Producto
from app.schemas.inventario_schema import InventarioMovimientoCreate

def registrar_movimientos_batch(db: Session, datos: InventarioMovimientoCreate, id_usuario: int):
    """
    Registra múltiples movimientos de inventario en una sola transacción.
    Si algún producto no existe o no pertenece al usuario, la transacción falla (Rollback).
    El stock se actualiza vía Trigger en PostgreSQL.
    """
    try:
        # Iniciamos la transacción (implícito en el uso de Session si no se ha hecho commit)
        # Pero para ser explícitos y asegurar el "Todo o Nada":
        
        movimientos = []
        
        for item in datos.productos:
            # 1. Verificar existencia y pertenencia del producto
            producto = db.query(Producto).filter(
                Producto.id_producto == item.id_producto,
                Producto.id_usuario == id_usuario
            ).first()
            
            if not producto:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con ID {item.id_producto} no encontrado o no pertenece al usuario."
                )
            
            # 2. Crear instancia del movimiento
            nuevo_movimiento = InventarioMovimiento(
                id_usuario=id_usuario,
                id_producto=item.id_producto,
                tipo_movimiento=datos.tipo_movimiento,
                cantidad=item.cantidad,
                motivo=datos.motivo
            )
            
            db.add(nuevo_movimiento)
            movimientos.append(nuevo_movimiento)

        # 3. Commit de todos los inserts
        # El trigger de stock se ejecutará por cada fila insertada en PostgreSQL
        db.commit()
        
        return {
            "mensaje": "Movimientos registrados exitosamente",
            "movimientos_creados": len(movimientos)
        }

    except HTTPException as e:
        # Re-lanzamos excepciones de FastAPI
        raise e
    except SQLAlchemyError as e:
        # Error de base de datos (ej. stock negativo lanzado por el trigger)
        db.rollback()
        # El trigger lanza una excepción personalizada si el stock queda < 0
        error_msg = str(e.__dict__.get('orig', e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error en la transacción: {error_msg}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado: {str(e)}"
        )


def obtener_movimientos(
    db: Session,
    id_usuario: int,
    id_producto: Optional[int] = None,
    limit: int = 100
):
    query = db.query(InventarioMovimiento).filter(
        InventarioMovimiento.id_usuario == id_usuario
    )
    
    if id_producto:
        query = query.filter(InventarioMovimiento.id_producto == id_producto)
        
    return query.order_by(InventarioMovimiento.fecha_movimiento.desc()).limit(limit).all()
