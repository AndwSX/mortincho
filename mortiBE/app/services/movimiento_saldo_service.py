from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.movimiento_saldo_model import MovimientoSaldo
from app.schemas.movimiento_saldo_schema import MovimientoSaldoCreate

def registrar_movimiento(db: Session, datos: MovimientoSaldoCreate, id_usuario: int):
    nuevo_movimiento = MovimientoSaldo(
        id_usuario=id_usuario,
        **datos.model_dump()
    )
    db.add(nuevo_movimiento)
    db.commit()
    db.refresh(nuevo_movimiento)
    return nuevo_movimiento

def obtener_movimientos(db: Session, id_usuario: int):
    return db.query(MovimientoSaldo).filter(MovimientoSaldo.id_usuario == id_usuario).order_by(MovimientoSaldo.fecha.desc()).all()

def obtener_capital_actual(db: Session, id_usuario: int):
    # Consultar la vista vw_capital_actual
    result = db.execute(
        text("SELECT capital_actual FROM vw_capital_actual WHERE id_usuario = :id_usuario"),
        {"id_usuario": id_usuario}
    ).fetchone()
    
    if result:
        return result[0]
    return 0
