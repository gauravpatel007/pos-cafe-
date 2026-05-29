-- Odoo POS Cafe — Complete Schema
-- PostgreSQL (offline, no Prisma)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ══════════════════════════════════════════════
-- AUTH
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'cashier',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ══════════════════════════════════════════════
-- PRODUCTS
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    description TEXT DEFAULT '',
    stock_status VARCHAR(50) DEFAULT 'available',
    sold INTEGER DEFAULT 0,
    rating DECIMAL(3, 1) DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    variants JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ══════════════════════════════════════════════
-- FLOOR & TABLES
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS floors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tables (
    id SERIAL PRIMARY KEY,
    floor_id INTEGER REFERENCES floors(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 4,
    status VARCHAR(50) DEFAULT 'available',
    current_order_id INTEGER
);

-- ══════════════════════════════════════════════
-- POS SESSIONS
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP,
    opening_balance DECIMAL(10, 2) DEFAULT 0,
    closing_balance DECIMAL(10, 2),
    total_sales DECIMAL(10, 2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'open'
);

-- ══════════════════════════════════════════════
-- PAYMENT METHODS
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'cash',
    is_active BOOLEAN DEFAULT TRUE,
    upi_id VARCHAR(255),
    merchant_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ══════════════════════════════════════════════
-- ORDERS
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    table_id INTEGER REFERENCES tables(id) ON DELETE SET NULL,
    session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
    order_number VARCHAR(50) NOT NULL,
    subtotal DECIMAL(10, 2) DEFAULT 0,
    tax_total DECIMAL(10, 2) DEFAULT 0,
    grand_total DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    source VARCHAR(50) DEFAULT 'cashier',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    variant VARCHAR(100)
);

-- ══════════════════════════════════════════════
-- PAYMENT TRANSACTIONS
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payment_transactions (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
    method VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'success',
    cashier_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ══════════════════════════════════════════════
-- KITCHEN TICKETS
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS kitchen_tickets (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    table_name VARCHAR(50) NOT NULL,
    priority VARCHAR(50) DEFAULT 'normal',
    status VARCHAR(50) DEFAULT 'to_cook',
    elapsed_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_items (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES kitchen_tickets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    is_done BOOLEAN DEFAULT FALSE
);
