from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.deuda_model import Deuda, PagoDeuda
from app.schemas.deuda_schema import DeudaCreate, PagoDeudaCreate

def crear_deuda(db: Session, datos: DeudaCreate, id_usuario: int):
    nueva_deuda = Deuda(
        id_usuario=id_usuario,
        concepto=datos.concepto,
        monto_total=datos.monto_total,
        saldo_restante=datos.monto_total,
        observaciones=datos.observaciones
    )
    db.add(nueva_deuda)
    db.commit()
    db.refresh(nueva_deuda)
    return nueva_deuda

def registrar_pago_deuda(db: Session, datos: PagoDeudaCreate, id_usuario: int):
    deuda = db.query(Deuda).filter(
        Deuda.id_deuda == datos.id_deuda,
        Deuda.id_usuario == id_usuario
    ).first()

    if not deuda:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deuda no encontrada")

    if deuda.saldo_restante <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La deuda ya está pagada")

    if datos.monto > deuda.saldo_restante:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"El monto excede el saldo restante ({deuda.saldo_restante})")

    nuevo_pago = PagoDeuda(
        id_usuario=id_usuario,
        id_deuda=datos.id_deuda,
        monto=datos.monto,
        observaciones=datos.observaciones
    )
    db.add(nuevo_pago)
    # Triggers en Postgres actualizan saldo_restante, estado y movimientos_saldo
    db.commit()
    db.refresh(nuevo_pago)
    return nuevo_pago

def obtener_deudas(db: Session, id_usuario: int):
    return db.query(Deuda).filter(Deuda.id_usuario == id_usuario).order_by(Deuda.fecha.desc()).all()
