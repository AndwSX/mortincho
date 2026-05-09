from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from datetime import datetime, date, timedelta
import calendar
from decimal import Decimal

from app.models.venta_model import Venta, EstadoVenta
from app.models.cuota_model import Cuota, EstadoCuota
from app.models.producto_model import Producto
from app.models.inventario_movimiento_model import InventarioMovimiento, TipoMovimientoInventario
from app.schemas.venta_schema import VentaCreate

def add_months(sourcedate, months):
    month = sourcedate.month - 1 + months
    year = sourcedate.year + month // 12
    month = month % 12 + 1
    day = min(sourcedate.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)

def registrar_venta(db: Session, datos: VentaCreate, id_usuario: int):
    try:
        # 1. Validar producto y stock
        producto = db.query(Producto).filter(
            Producto.id_producto == datos.id_producto,
            Producto.id_usuario == id_usuario
        ).first()

        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado o no pertenece al usuario."
            )

        if producto.stock_actual < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente para el producto {producto.nombre}. Stock actual: {producto.stock_actual}"
            )

        # 2. Calcular valores de la venta
        saldo_pendiente = datos.total_venta - datos.anticipo
        
        # Determinar estado inicial
        if saldo_pendiente == 0:
            estado_inicial = EstadoVenta.pagado
        elif datos.anticipo > 0:
            estado_inicial = EstadoVenta.pagando
        else:
            estado_inicial = EstadoVenta.pendiente

        # 3. Crear registro de Venta
        nueva_venta = Venta(
            id_usuario=id_usuario,
            id_producto=datos.id_producto,
            nombre_cliente=datos.nombre_cliente,
            total_venta=datos.total_venta,
            anticipo=datos.anticipo,
            saldo_pendiente=saldo_pendiente,
            estado=estado_inicial
        )
        db.add(nueva_venta)
        db.flush() # Para obtener el id_venta

        # 4. Crear movimiento de inventario (Salida)
        # Esto disparará el trigger en Postgres para actualizar el stock automáticamente
        movimiento_salida = InventarioMovimiento(
            id_usuario=id_usuario,
            id_producto=datos.id_producto,
            tipo_movimiento=TipoMovimientoInventario.salida,
            cantidad=1,
            motivo=f"Venta a {datos.nombre_cliente}"
        )
        db.add(movimiento_salida)

        # 5. Generar cuotas si es financiada
        if saldo_pendiente > 0 and datos.numero_cuotas > 0:
            valor_cuota = (saldo_pendiente / datos.numero_cuotas).quantize(Decimal('0.01'))
            fecha_actual = date.today()
            
            # Ajuste para que la suma de cuotas coincida exactamente con el saldo_pendiente
            suma_cuotas = Decimal('0')
            
            for i in range(1, datos.numero_cuotas + 1):
                # La última cuota ajusta el redondeo
                if i == datos.numero_cuotas:
                    valor_cuota_final = saldo_pendiente - suma_cuotas
                else:
                    valor_cuota_final = valor_cuota
                
                suma_cuotas += valor_cuota_final
                
                fecha_vencimiento = add_months(fecha_actual, i)
                
                nueva_cuota = Cuota(
                    id_usuario=id_usuario,
                    id_venta=nueva_venta.id_venta,
                    numero_cuota=i,
                    valor_original=valor_cuota_final,
                    valor_restante=valor_cuota_final,
                    fecha_vencimiento=fecha_vencimiento,
                    estado=EstadoCuota.pendiente
                )
                db.add(nueva_cuota)

        db.commit()
        db.refresh(nueva_venta)
        return nueva_venta

    except HTTPException as e:
        db.rollback()
        raise e
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error en la transacción de venta: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al registrar venta: {str(e)}"
        )

def obtener_ventas_usuario(db: Session, id_usuario: int):
    return db.query(Venta).filter(Venta.id_usuario == id_usuario).all()

def obtener_venta_detalle(db: Session, id_venta: int, id_usuario: int):
    venta = db.query(Venta).filter(Venta.id_venta == id_venta, Venta.id_usuario == id_usuario).first()
    if venta:
        # Cargar cuotas explícitamente si es necesario, aunque el ORM suele manejarlo
        venta.cuotas = db.query(Cuota).filter(Cuota.id_venta == id_venta).order_by(Cuota.numero_cuota).all()
    return venta
