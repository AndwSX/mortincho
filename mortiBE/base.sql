-- =========================================
-- CREACIÓN DE BASE DE DATOS ERP PARA EL MORTI
-- PostgreSQL
-- =========================================


-- =========================================
-- ENUMS
-- =========================================

CREATE TYPE tipo_movimiento_inventario AS ENUM (
    'entrada',
    'salida',
    'ajuste_entrada',
    'ajuste_salida'
);

CREATE TYPE estado_venta AS ENUM (
    'pendiente',
    'pagando',
    'pagado'
);

CREATE TYPE estado_cuota AS ENUM (
    'pendiente',
    'pagada',
    'vencida'
);

CREATE TYPE tipo_movimiento_saldo AS ENUM (
    'ingreso',
    'gasto',
    'prestamo_entregado',
    'prestamo_recibido'
);

CREATE TYPE tipo_prestamo AS ENUM (
    'entregado',
    'recibido'
);


-- =========================================
-- TABLA USUARIOS
-- =========================================

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,

    usuario VARCHAR(100) UNIQUE NOT NULL,

    correo VARCHAR(150) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    activo BOOLEAN DEFAULT TRUE,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- TABLA PRODUCTOS
-- =========================================

CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,

    id_usuario INT NOT NULL,

    nombre VARCHAR(150) NOT NULL,

    descripcion TEXT,

    stock_actual INT NOT NULL DEFAULT 0
        CHECK (stock_actual >= 0),

    activo BOOLEAN DEFAULT TRUE,

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_producto_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);


-- =========================================
-- TABLA MOVIMIENTOS INVENTARIO
-- =========================================

CREATE TABLE inventario_movimientos (
    id_movimiento SERIAL PRIMARY KEY,

    id_usuario INT NOT NULL,

    id_producto INT NOT NULL,

    tipo_movimiento tipo_movimiento_inventario NOT NULL,

    cantidad INT NOT NULL
        CHECK (cantidad > 0),

    motivo VARCHAR(255),

    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_movimiento_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_movimiento_producto
        FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto)
        ON DELETE CASCADE
);


-- =========================================
-- TABLA VENTAS
-- =========================================

CREATE TABLE ventas (
    id_venta SERIAL PRIMARY KEY,

    id_usuario INT NOT NULL,

    id_producto INT NOT NULL,

    nombre_cliente VARCHAR(150) NOT NULL,

    total_venta NUMERIC(12,2) NOT NULL
        CHECK (total_venta > 0),

    anticipo NUMERIC(12,2) NOT NULL DEFAULT 0
        CHECK (
            anticipo >= 0
            AND anticipo <= total_venta
        ),

    saldo_pendiente NUMERIC(12,2) NOT NULL
        CHECK (saldo_pendiente >= 0),

    estado estado_venta DEFAULT 'pendiente',

    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_venta_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_venta_producto
        FOREIGN KEY (id_producto)
        REFERENCES productos(id_producto)
        ON DELETE CASCADE
);


-- =========================================
-- TABLA CUOTAS
-- =========================================

CREATE TABLE cuotas (
    id_cuota SERIAL PRIMARY KEY,

    id_usuario INT NOT NULL,

    id_venta INT NOT NULL,

    numero_cuota INT NOT NULL,

    valor_original NUMERIC(12,2) NOT NULL
        CHECK (valor_original > 0),

    valor_restante NUMERIC(12,2) NOT NULL
        CHECK (
            valor_restante >= 0
            AND valor_restante <= valor_original
        ),

    fecha_vencimiento DATE NOT NULL,

    fecha_ultimo_pago TIMESTAMP,

    estado estado_cuota DEFAULT 'pendiente',

    CONSTRAINT fk_cuota_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_cuota_venta
        FOREIGN KEY (id_venta)
        REFERENCES ventas(id_venta)
        ON DELETE CASCADE,

    CONSTRAINT uq_cuota_numero
        UNIQUE(id_venta, numero_cuota)
);


-- =========================================
-- TABLA PAGOS
-- =========================================

CREATE TABLE pagos (
    id_pago SERIAL PRIMARY KEY,

    id_usuario INT NOT NULL,

    id_venta INT NOT NULL,

    valor_pagado NUMERIC(12,2) NOT NULL
        CHECK (valor_pagado > 0),

    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pago_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_pago_venta
        FOREIGN KEY (id_venta)
        REFERENCES ventas(id_venta)
        ON DELETE CASCADE
);


-- =========================================
-- TABLA DETALLE PAGO-CUOTA
-- =========================================

CREATE TABLE pagos_cuota_detalle (
    id_detalle SERIAL PRIMARY KEY,

    id_pago INT NOT NULL,

    id_cuota INT NOT NULL,

    valor_aplicado NUMERIC(12,2) NOT NULL
        CHECK (valor_aplicado > 0),

    CONSTRAINT fk_detalle_pago
        FOREIGN KEY (id_pago)
        REFERENCES pagos(id_pago)
        ON DELETE CASCADE,

    CONSTRAINT fk_detalle_cuota
        FOREIGN KEY (id_cuota)
        REFERENCES cuotas(id_cuota)
        ON DELETE CASCADE
);


-- =========================================
-- TABLA MOVIMIENTOS SALDO
-- =========================================

CREATE TABLE movimientos_saldo (
    id_movimiento SERIAL PRIMARY KEY,

    id_usuario INT NOT NULL,

    tipo tipo_movimiento_saldo NOT NULL,

    concepto VARCHAR(255) NOT NULL,

    monto NUMERIC(12,2) NOT NULL
        CHECK (monto > 0),

    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    afecta_capital BOOLEAN DEFAULT TRUE,

    referencia_tabla VARCHAR(50),

    referencia_id INTEGER,

    observaciones TEXT,

    CONSTRAINT fk_movimiento_saldo_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);


-- =========================================
-- TABLA PRESTAMOS
-- =========================================

CREATE TABLE prestamos (
    id_prestamo SERIAL PRIMARY KEY,

    id_usuario INT NOT NULL,

    tipo tipo_prestamo NOT NULL,

    concepto VARCHAR(150) NOT NULL,

    monto_total NUMERIC(12,2) NOT NULL
        CHECK (monto_total > 0),

    saldo_restante NUMERIC(12,2) NOT NULL
        CHECK (saldo_restante >= 0),

    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    estado VARCHAR(20) DEFAULT 'activo'
        CHECK (estado IN ('activo', 'pagado', 'cancelado')),

    observaciones TEXT,

    CONSTRAINT fk_prestamo_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);


-- =========================================
-- TABLA PAGOS PRESTAMO
-- =========================================

CREATE TABLE pagos_prestamo (
    id_pago SERIAL PRIMARY KEY,

    id_usuario INT NOT NULL,

    id_prestamo INTEGER NOT NULL,

    monto NUMERIC(12,2) NOT NULL
        CHECK (monto > 0),

    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    observaciones TEXT,

    CONSTRAINT fk_pago_prestamo_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_pago_prestamo_prestamo
        FOREIGN KEY (id_prestamo)
        REFERENCES prestamos(id_prestamo)
        ON DELETE CASCADE
);


-- =========================================
-- TABLA DEUDAS
-- =========================================

CREATE TABLE deudas (
    id_deuda SERIAL PRIMARY KEY,

    id_usuario INT NOT NULL,

    concepto VARCHAR(150) NOT NULL,

    monto_total NUMERIC(12,2) NOT NULL
        CHECK (monto_total > 0),

    saldo_restante NUMERIC(12,2) NOT NULL
        CHECK (saldo_restante >= 0),

    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    estado VARCHAR(20) DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'pagada', 'cancelada')),

    observaciones TEXT,

    CONSTRAINT fk_deuda_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);


-- =========================================
-- TABLA PAGOS DEUDA
-- =========================================

CREATE TABLE pagos_deuda (
    id_pago SERIAL PRIMARY KEY,

    id_usuario INT NOT NULL,

    id_deuda INTEGER NOT NULL,

    monto NUMERIC(12,2) NOT NULL
        CHECK (monto > 0),

    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    observaciones TEXT,

    CONSTRAINT fk_pago_deuda_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_pago_deuda_deuda
        FOREIGN KEY (id_deuda)
        REFERENCES deudas(id_deuda)
        ON DELETE CASCADE
);


-- =========================================
-- ÍNDICES
-- =========================================

CREATE INDEX idx_productos_usuario ON productos(id_usuario);
CREATE INDEX idx_movimientos_producto ON inventario_movimientos(id_producto);
CREATE INDEX idx_movimientos_usuario ON inventario_movimientos(id_usuario);
CREATE INDEX idx_ventas_usuario ON ventas(id_usuario);
CREATE INDEX idx_ventas_producto ON ventas(id_producto);
CREATE INDEX idx_cuotas_venta ON cuotas(id_venta);
CREATE INDEX idx_cuotas_estado ON cuotas(estado);
CREATE INDEX idx_pagos_venta ON pagos(id_venta);
CREATE INDEX idx_movimientos_saldo_usuario ON movimientos_saldo(id_usuario);
CREATE INDEX idx_prestamos_usuario ON prestamos(id_usuario);
CREATE INDEX idx_deudas_usuario ON deudas(id_usuario);


-- =========================================
-- VISTA CAPITAL ACTUAL
-- =========================================

CREATE OR REPLACE VIEW vw_capital_actual AS
SELECT
    id_usuario,
    COALESCE(
        SUM(
            CASE
                WHEN tipo IN ('ingreso', 'prestamo_recibido') THEN monto
                WHEN tipo IN ('gasto', 'prestamo_entregado') THEN -monto
                ELSE 0
            END
        ),
        0
    ) AS capital_actual
FROM movimientos_saldo
WHERE afecta_capital = TRUE
GROUP BY id_usuario;


-- =========================================
-- FUNCIÓN ACTUALIZAR STOCK PRODUCTO
-- =========================================

CREATE OR REPLACE FUNCTION actualizar_stock_producto()
RETURNS TRIGGER AS
$$
DECLARE
    v_stock_actual INT;
BEGIN
    IF NEW.tipo_movimiento IN ('entrada', 'ajuste_entrada') THEN
        UPDATE productos
        SET stock_actual = stock_actual + NEW.cantidad
        WHERE id_producto = NEW.id_producto;
    ELSIF NEW.tipo_movimiento IN ('salida', 'ajuste_salida') THEN
        UPDATE productos
        SET stock_actual = stock_actual - NEW.cantidad
        WHERE id_producto = NEW.id_producto;
    END IF;

    SELECT stock_actual INTO v_stock_actual FROM productos WHERE id_producto = NEW.id_producto;
    IF v_stock_actual < 0 THEN
        RAISE EXCEPTION 'Stock insuficiente para producto %', NEW.id_producto;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_stock
AFTER INSERT ON inventario_movimientos
FOR EACH ROW EXECUTE FUNCTION actualizar_stock_producto();


-- =========================================
-- FUNCIÓN ACTUALIZAR ESTADO CUOTA
-- =========================================

CREATE OR REPLACE FUNCTION actualizar_estado_cuota()
RETURNS TRIGGER AS
$$
BEGIN
    IF NEW.valor_restante = 0 THEN
        NEW.estado := 'pagada';
    ELSE
        NEW.estado := 'pendiente';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_estado_cuota
BEFORE UPDATE ON cuotas
FOR EACH ROW EXECUTE FUNCTION actualizar_estado_cuota();


-- =========================================
-- FUNCIÓN ACTUALIZAR VENTA
-- =========================================

CREATE OR REPLACE FUNCTION actualizar_estado_venta()
RETURNS TRIGGER AS
$$
BEGIN
    IF NEW.saldo_pendiente = 0 THEN
        NEW.estado := 'pagado';
    ELSE
        NEW.estado := 'pagando';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_estado_venta
BEFORE UPDATE ON ventas
FOR EACH ROW EXECUTE FUNCTION actualizar_estado_venta();


-- =========================================
-- FUNCIONES PARA MOVIMIENTOS DE SALDO (PRÉSTAMOS Y DEUDAS)
-- =========================================

-- ACTUALIZAR SALDO PRÉSTAMO
CREATE OR REPLACE FUNCTION actualizar_saldo_prestamo()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE prestamos
    SET saldo_restante = saldo_restante - NEW.monto
    WHERE id_prestamo = NEW.id_prestamo;

    UPDATE prestamos
    SET estado = 'pagado'
    WHERE id_prestamo = NEW.id_prestamo AND saldo_restante <= 0;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_saldo_prestamo
AFTER INSERT ON pagos_prestamo
FOR EACH ROW EXECUTE FUNCTION actualizar_saldo_prestamo();


-- ACTUALIZAR SALDO DEUDA
CREATE OR REPLACE FUNCTION actualizar_saldo_deuda()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE deudas
    SET saldo_restante = saldo_restante - NEW.monto
    WHERE id_deuda = NEW.id_deuda;

    UPDATE deudas
    SET estado = 'pagada'
    WHERE id_deuda = NEW.id_deuda AND saldo_restante <= 0;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_saldo_deuda
AFTER INSERT ON pagos_deuda
FOR EACH ROW EXECUTE FUNCTION actualizar_saldo_deuda();


-- REGISTRAR MOVIMIENTO INICIAL PRÉSTAMO
CREATE OR REPLACE FUNCTION registrar_movimiento_prestamo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tipo = 'entregado' THEN
        INSERT INTO movimientos_saldo (id_usuario, tipo, concepto, monto, referencia_tabla, referencia_id)
        VALUES (NEW.id_usuario, 'prestamo_entregado', 'Préstamo entregado: ' || NEW.concepto, NEW.monto_total, 'prestamos', NEW.id_prestamo);
    ELSE
        INSERT INTO movimientos_saldo (id_usuario, tipo, concepto, monto, referencia_tabla, referencia_id)
        VALUES (NEW.id_usuario, 'prestamo_recibido', 'Préstamo recibido: ' || NEW.concepto, NEW.monto_total, 'prestamos', NEW.id_prestamo);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_registrar_movimiento_prestamo
AFTER INSERT ON prestamos
FOR EACH ROW EXECUTE FUNCTION registrar_movimiento_prestamo();


-- REGISTRAR PAGO PRÉSTAMO EN MOVIMIENTOS
CREATE OR REPLACE FUNCTION registrar_pago_prestamo()
RETURNS TRIGGER AS $$
DECLARE
    tipo_prestamo VARCHAR(20);
BEGIN
    SELECT tipo INTO tipo_prestamo FROM prestamos WHERE id_prestamo = NEW.id_prestamo;

    IF tipo_prestamo = 'entregado' THEN
        INSERT INTO movimientos_saldo (id_usuario, tipo, concepto, monto, referencia_tabla, referencia_id)
        VALUES (NEW.id_usuario, 'ingreso', 'Pago recibido de préstamo', NEW.monto, 'pagos_prestamo', NEW.id_pago);
    ELSE
        INSERT INTO movimientos_saldo (id_usuario, tipo, concepto, monto, referencia_tabla, referencia_id)
        VALUES (NEW.id_usuario, 'gasto', 'Pago realizado de préstamo recibido', NEW.monto, 'pagos_prestamo', NEW.id_pago);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_registrar_pago_prestamo
AFTER INSERT ON pagos_prestamo
FOR EACH ROW EXECUTE FUNCTION registrar_pago_prestamo();


-- REGISTRAR PAGO DEUDA EN MOVIMIENTOS
CREATE OR REPLACE FUNCTION registrar_pago_deuda()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO movimientos_saldo (id_usuario, tipo, concepto, monto, referencia_tabla, referencia_id)
    VALUES (NEW.id_usuario, 'gasto', 'Pago de deuda', NEW.monto, 'pagos_deuda', NEW.id_pago);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_registrar_pago_deuda
AFTER INSERT ON pagos_deuda
FOR EACH ROW EXECUTE FUNCTION registrar_pago_deuda();


-- =========================================
-- TRIGGERS PARA VENTAS Y PAGOS (AUTOMATIZAR MOVIMIENTOS DE SALDO)
-- =========================================

-- REGISTRAR MOVIMIENTO POR VENTA (ANTICIPO O CONTADO)
CREATE OR REPLACE FUNCTION registrar_movimiento_venta()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.anticipo > 0 THEN
        INSERT INTO movimientos_saldo (id_usuario, tipo, concepto, monto, referencia_tabla, referencia_id)
        VALUES (NEW.id_usuario, 'ingreso', 'Anticipo/Pago venta: ' || NEW.nombre_cliente, NEW.anticipo, 'ventas', NEW.id_venta);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_registrar_movimiento_venta
AFTER INSERT ON ventas
FOR EACH ROW EXECUTE FUNCTION registrar_movimiento_venta();


-- REGISTRAR MOVIMIENTO POR PAGO DE CUOTA
CREATE OR REPLACE FUNCTION registrar_movimiento_pago_cuota()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO movimientos_saldo (id_usuario, tipo, concepto, monto, referencia_tabla, referencia_id)
    VALUES (NEW.id_usuario, 'ingreso', 'Pago de cuota - Venta ID: ' || NEW.id_venta, NEW.valor_pagado, 'pagos', NEW.id_pago);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_registrar_movimiento_pago_cuota
AFTER INSERT ON pagos
FOR EACH ROW EXECUTE FUNCTION registrar_movimiento_pago_cuota();