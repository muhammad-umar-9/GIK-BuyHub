
-- Database schema for GIKIHub Tuck Area Management System

-- Create database (if not exists)
-- You might need to run this separately
-- CREATE DATABASE gikihub;

-- Connect to database
-- \c gikihub

-- Drop tables if they exist to avoid conflicts
DROP TABLE IF EXISTS delivery CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS shops CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Create categories table
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create shops table
CREATE TABLE shops (
    shop_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    shop_type VARCHAR(50) NOT NULL,
    location VARCHAR(100),
    contact_number VARCHAR(20),
    opening_time TIME,
    closing_time TIME,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create employees table
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    shop_id INTEGER REFERENCES shops(shop_id) ON DELETE CASCADE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role VARCHAR(50),
    contact_number VARCHAR(20),
    email VARCHAR(100),
    joining_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    shop_id INTEGER REFERENCES shops(shop_id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    hostel VARCHAR(50),
    room_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id) ON DELETE SET NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Pending',
    payment_method VARCHAR(50) DEFAULT 'Cash',
    special_instructions TEXT
);

-- Create order items table
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(product_id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Create delivery table
CREATE TABLE delivery (
    delivery_id SERIAL PRIMARY KEY,
    order_id INTEGER UNIQUE REFERENCES orders(order_id) ON DELETE CASCADE,
    employee_id INTEGER REFERENCES employees(employee_id) ON DELETE SET NULL,
    delivery_status VARCHAR(20) DEFAULT 'Pending',
    assigned_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_time TIMESTAMP,
    delivery_location TEXT,
    delivery_notes TEXT
);
