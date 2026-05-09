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
    'egreso'
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
    id_movimiento_saldo SERIAL PRIMARY KEY,

    id_usuario INT NOT NULL,

    tipo_movimiento tipo_movimiento_saldo NOT NULL,

    valor NUMERIC(12,2) NOT NULL
        CHECK (valor > 0),

    descripcion VARCHAR(255),

    referencia VARCHAR(255),

    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_saldo_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);


-- =========================================
-- ÍNDICES
-- =========================================

CREATE INDEX idx_productos_usuario
ON productos(id_usuario);

CREATE INDEX idx_movimientos_producto
ON inventario_movimientos(id_producto);

CREATE INDEX idx_movimientos_usuario
ON inventario_movimientos(id_usuario);

CREATE INDEX idx_ventas_usuario
ON ventas(id_usuario);

CREATE INDEX idx_ventas_producto
ON ventas(id_producto);

CREATE INDEX idx_cuotas_venta
ON cuotas(id_venta);

CREATE INDEX idx_cuotas_estado
ON cuotas(estado);

CREATE INDEX idx_pagos_venta
ON pagos(id_venta);

CREATE INDEX idx_movimientos_saldo_usuario
ON movimientos_saldo(id_usuario);


-- =========================================
-- FUNCIÓN ACTUALIZAR STOCK PRODUCTO
-- =========================================

CREATE OR REPLACE FUNCTION actualizar_stock_producto()
RETURNS TRIGGER AS
$$
DECLARE
    v_stock_actual INT;
BEGIN

    -- ENTRADAS
    IF NEW.tipo_movimiento IN (
        'entrada',
        'ajuste_entrada'
    ) THEN

        UPDATE productos
        SET stock_actual = stock_actual + NEW.cantidad
        WHERE id_producto = NEW.id_producto;

    END IF;


    -- SALIDAS
    IF NEW.tipo_movimiento IN (
        'salida',
        'ajuste_salida'
    ) THEN

        UPDATE productos
        SET stock_actual = stock_actual - NEW.cantidad
        WHERE id_producto = NEW.id_producto;

    END IF;


    -- VALIDAR STOCK
    SELECT stock_actual
    INTO v_stock_actual
    FROM productos
    WHERE id_producto = NEW.id_producto;

    IF v_stock_actual < 0 THEN

        RAISE EXCEPTION
        'Stock insuficiente para producto %',
        NEW.id_producto;

    END IF;


    RETURN NEW;

END;
$$ LANGUAGE plpgsql;


-- =========================================
-- TRIGGER ACTUALIZAR STOCK
-- =========================================

CREATE TRIGGER trigger_actualizar_stock
AFTER INSERT
ON inventario_movimientos
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock_producto();


-- =========================================
-- FUNCIÓN ACTUALIZAR ESTADO CUOTA
-- =========================================

CREATE OR REPLACE FUNCTION actualizar_estado_cuota()
RETURNS TRIGGER AS
$$
BEGIN

    -- CUOTA PAGADA
    IF NEW.valor_restante = 0 THEN

        NEW.estado := 'pagada';

    ELSE

        NEW.estado := 'pendiente';

    END IF;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;


-- =========================================
-- TRIGGER ESTADO CUOTA
-- =========================================

CREATE TRIGGER trigger_estado_cuota
BEFORE UPDATE
ON cuotas
FOR EACH ROW
EXECUTE FUNCTION actualizar_estado_cuota();


-- =========================================
-- FUNCIÓN ACTUALIZAR VENTA
-- =========================================

CREATE OR REPLACE FUNCTION actualizar_estado_venta()
RETURNS TRIGGER AS
$$
DECLARE
    v_saldo NUMERIC(12,2);
BEGIN

    SELECT saldo_pendiente
    INTO v_saldo
    FROM ventas
    WHERE id_venta = NEW.id_venta;

    IF v_saldo = 0 THEN

        UPDATE ventas
        SET estado = 'pagado'
        WHERE id_venta = NEW.id_venta;

    ELSE

        UPDATE ventas
        SET estado = 'pagando'
        WHERE id_venta = NEW.id_venta;

    END IF;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;


-- =========================================
-- TRIGGER ESTADO VENTA
-- =========================================

CREATE TRIGGER trigger_estado_venta
AFTER UPDATE
ON ventas
FOR EACH ROW
EXECUTE FUNCTION actualizar_estado_venta();