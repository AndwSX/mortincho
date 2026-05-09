from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from decimal import Decimal
from datetime import datetime

from app.models.venta_model import Venta
from app.models.cuota_model import Cuota, EstadoCuota
from app.models.pago_model import Pago, PagoCuotaDetalle
from app.schemas.pago_schema import PagoCreate

def registrar_pago(db: Session, datos: PagoCreate, id_usuario: int):
    try:
        valor_pagado = Decimal(str(datos.valor_pagado)).quantize(Decimal('0.01'))
        # 1. Validar venta
        venta = db.query(Venta).filter(
            Venta.id_venta == datos.id_venta,
            Venta.id_usuario == id_usuario
        ).first()

        if not venta:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Venta no encontrada o no pertenece al usuario."
            )

        if venta.saldo_pendiente == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Esta venta ya está totalmente pagada."
            )

        if valor_pagado > venta.saldo_pendiente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El valor pagado ({valor_pagado}) excede el saldo pendiente ({venta.saldo_pendiente})."
            )

        # 2. Crear el registro principal del Pago
        nuevo_pago = Pago(
            id_usuario=id_usuario,
            id_venta=datos.id_venta,
            valor_pagado=valor_pagado
        )
        db.add(nuevo_pago)
        db.flush() # Para obtener id_pago

        # 3. Obtener cuotas pendientes
        cuotas_pendientes = db.query(Cuota).filter(
            Cuota.id_venta == datos.id_venta,
            Cuota.estado == EstadoCuota.pendiente
        ).order_by(Cuota.numero_cuota.asc()).all()

        monto_a_distribuir = valor_pagado
        detalles_pago = []

        for cuota in cuotas_pendientes:
            if monto_a_distribuir <= 0:
                break
            
            pago_para_esta_cuota = min(monto_a_distribuir, cuota.valor_restante)
            
            # Actualizar cuota
            cuota.valor_restante -= pago_para_esta_cuota
            cuota.fecha_ultimo_pago = func.now() if hasattr(func, 'now') else datetime.now()
            # El trigger en Postgres actualizará el estado a 'pagada' si valor_restante == 0
            
            # Registrar detalle
            detalle = PagoCuotaDetalle(
                id_pago=nuevo_pago.id_pago,
                id_cuota=cuota.id_cuota,
                valor_aplicado=pago_para_esta_cuota
            )
            db.add(detalle)
            detalles_pago.append(detalle)
            
            monto_a_distribuir -= pago_para_esta_cuota

        # 4. Actualizar saldo pendiente de la venta
        venta.saldo_pendiente -= valor_pagado
        # El trigger en Postgres actualizará el estado de la venta según el nuevo saldo_pendiente

        db.commit()
        db.refresh(nuevo_pago)
        
        # Preparar respuesta manual porque SQLAlchemy no refresca relaciones automáticamente de forma profunda a veces
        return {
            "id_pago": nuevo_pago.id_pago,
            "id_venta": nuevo_pago.id_pago,
            "valor_pagado": nuevo_pago.valor_pagado,
            "fecha_pago": nuevo_pago.fecha_pago,
            "detalles": [{"id_cuota": d.id_cuota, "valor_aplicado": d.valor_aplicado} for d in detalles_pago]
        }

    except HTTPException as e:
        db.rollback()
        raise e
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error en la transacción de pago: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al registrar pago: {str(e)}"
        )
