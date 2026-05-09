from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from decimal import Decimal
from app.models.prestamo_model import Prestamo, PagoPrestamo
from app.schemas.prestamo_schema import PrestamoCreate, PagoPrestamoCreate

def crear_prestamo(db: Session, datos: PrestamoCreate, id_usuario: int):
    nuevo_prestamo = Prestamo(
        id_usuario=id_usuario,
        tipo=datos.tipo,
        concepto=datos.concepto,
        monto_total=datos.monto_total,
        saldo_restante=datos.monto_total, # Inicialmente igual al total
        observaciones=datos.observaciones
    )
    db.add(nuevo_prestamo)
    db.commit()
    db.refresh(nuevo_prestamo)
    return nuevo_prestamo

def registrar_pago_prestamo(db: Session, datos: PagoPrestamoCreate, id_usuario: int):
    prestamo = db.query(Prestamo).filter(
        Prestamo.id_prestamo == datos.id_prestamo,
        Prestamo.id_usuario == id_usuario
    ).first()

    if not prestamo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Préstamo no encontrado")

    if prestamo.saldo_restante <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El préstamo ya está pagado")

    if datos.monto > prestamo.saldo_restante:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"El monto excede el saldo restante ({prestamo.saldo_restante})")

    nuevo_pago = PagoPrestamo(
        id_usuario=id_usuario,
        id_prestamo=datos.id_prestamo,
        monto=datos.monto,
        observaciones=datos.observaciones
    )
    db.add(nuevo_pago)
    # Los triggers en Postgres se encargan de actualizar saldo_restante, estado y movimientos_saldo
    db.commit()
    db.refresh(nuevo_pago)
    return nuevo_pago

def obtener_prestamos(db: Session, id_usuario: int):
    return db.query(Prestamo).filter(Prestamo.id_usuario == id_usuario).order_by(Prestamo.fecha.desc()).all()
