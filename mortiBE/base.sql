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
    'pagado',
    'vencido'
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

CREATE TYPE estado_alerta AS ENUM (
    'pendiente',
    'vista'
);


-- =========================================
-- TABLA USUARIOS
-- =========================================

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,

    usuario VARCHAR(100) UNIQUE NOT NULL,

    correo VARCHAR(150) NOT NULL,

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

    cantidad INT NOT NULL CHECK (cantidad > 0),

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

    cantidad INT NOT NULL CHECK (cantidad > 0),

    precio_unitario NUMERIC(12,2) NOT NULL,

    total_venta NUMERIC(12,2) NOT NULL,

    anticipo NUMERIC(12,2) NOT NULL DEFAULT 0,

    saldo_pendiente NUMERIC(12,2) NOT NULL,

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

    id_venta INT NOT NULL,

    numero_cuota INT NOT NULL,

    valor_cuota NUMERIC(12,2) NOT NULL,

    fecha_vencimiento DATE NOT NULL,

    fecha_pago DATE,

    estado estado_cuota DEFAULT 'pendiente',

    CONSTRAINT fk_cuota_venta
        FOREIGN KEY (id_venta)
        REFERENCES ventas(id_venta)
        ON DELETE CASCADE
);


-- =========================================
-- TABLA MOVIMIENTOS SALDO
-- =========================================

CREATE TABLE movimientos_saldo (
    id_movimiento_saldo SERIAL PRIMARY KEY,

    id_usuario INT NOT NULL,

    tipo_movimiento tipo_movimiento_saldo NOT NULL,

    valor NUMERIC(12,2) NOT NULL CHECK (valor > 0),

    descripcion VARCHAR(255),

    referencia VARCHAR(255),

    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_saldo_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);


-- =========================================
-- TABLA ALERTAS VENCIMIENTO
-- =========================================

CREATE TABLE alertas_vencimiento (
    id_alerta SERIAL PRIMARY KEY,

    id_cuota INT NOT NULL,

    fecha_alerta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    estado estado_alerta DEFAULT 'pendiente',

    CONSTRAINT fk_alerta_cuota
        FOREIGN KEY (id_cuota)
        REFERENCES cuotas(id_cuota)
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

CREATE INDEX idx_movimientos_saldo_usuario
ON movimientos_saldo(id_usuario);

CREATE INDEX idx_alertas_cuota
ON alertas_vencimiento(id_cuota);



-- =========================================
-- FUNCIONES Y TRIGGERS PARA ACTUALIZAR STOCK
-- =========================================
-- =========================================
-- ELIMINAR FUNCIÓN Y TRIGGER SI EXISTEN
-- =========================================

DROP TRIGGER IF EXISTS trigger_actualizar_stock
ON inventario_movimientos;

DROP FUNCTION IF EXISTS actualizar_stock_producto();


-- =========================================
-- FUNCIÓN PARA ACTUALIZAR STOCK (REFACTOREADA)
-- =========================================
CREATE OR REPLACE FUNCTION actualizar_stock_producto()
RETURNS TRIGGER AS
$$
DECLARE
    v_stock_actual INT;
BEGIN
    -- DEBUG: Esto aparecerá en los logs de Postgres al insertar
    -- RAISE NOTICE 'Procesando movimiento tipo % para producto %', NEW.tipo_movimiento, NEW.id_producto;
    -- 1. Actualizar el stock en la tabla productos
    IF NEW.tipo_movimiento IN ('entrada', 'ajuste_entrada') THEN
        UPDATE productos
        SET stock_actual = stock_actual + NEW.cantidad
        WHERE id_producto = NEW.id_producto;
        
    ELSIF NEW.tipo_movimiento IN ('salida', 'ajuste_salida') THEN
        UPDATE productos
        SET stock_actual = stock_actual - NEW.cantidad
        WHERE id_producto = NEW.id_producto;
    END IF;

    -- 2. Validar que el producto exista y obtener el nuevo stock
    SELECT stock_actual INTO v_stock_actual
    FROM productos
    WHERE id_producto = NEW.id_producto;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'El producto con ID % no existe en la tabla productos.', NEW.id_producto;
    END IF;
    
    -- 3. Validar stock negativo (el CHECK de la tabla productos también saltaría aquí)
    IF v_stock_actual < 0 THEN
        RAISE EXCEPTION 'Stock insuficiente para el producto %. Stock resultante: %', NEW.id_producto, v_stock_actual;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Asegúrate de que el trigger esté correctamente vinculado
DROP TRIGGER IF EXISTS trigger_actualizar_stock ON inventario_movimientos;
CREATE TRIGGER trigger_actualizar_stock
AFTER INSERT
ON inventario_movimientos
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock_producto();