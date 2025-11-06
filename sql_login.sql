-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS optimanager;

-- Use the newly created database
USE optimanager;

-- Table to store user authentication details
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,  -- <-- THIS COLUMN WAS MISSING
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store customer information
-- This is for the people who make purchases at the optical store.
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    address TEXT,
    date_added DATE NOT NULL DEFAULT (CURDATE()), -- Added default
    -- Prescription Fields (Example structure)
    od_sph VARCHAR(10) DEFAULT NULL, -- Right Eye Sphere
    od_cyl VARCHAR(10) DEFAULT NULL, -- Right Eye Cylinder
    od_axis VARCHAR(10) DEFAULT NULL, -- Right Eye Axis
    od_add VARCHAR(10) DEFAULT NULL,  -- Right Eye Addition (for bifocals/progressives)
    os_sph VARCHAR(10) DEFAULT NULL, -- Left Eye Sphere
    os_cyl VARCHAR(10) DEFAULT NULL,
    os_axis VARCHAR(10) DEFAULT NULL,
    os_add VARCHAR(10) DEFAULT NULL,
    pd VARCHAR(20) DEFAULT NULL,      -- Pupillary Distance
    notes TEXT DEFAULT NULL,          -- Any extra notes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- Removed the old 'prescription JSON' column
);
-- Table to store product information
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    frame_size VARCHAR(20) DEFAULT NULL,
    material VARCHAR(50) DEFAULT NULL,
    color VARCHAR(50) DEFAULT NULL,
    type ENUM('Frames', 'Lenses', 'Contact Lenses', 'Sunglasses', 'Accessories') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    purchase_rate DECIMAL(10, 2) DEFAULT NULL,
    quantity INT NOT NULL,
    barcode VARCHAR(100) DEFAULT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store sales transactions
CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    sale_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
        ON DELETE RESTRICT -- Prevent a customer from being deleted if they have sales records
);

-- Table to link products to sales transactions
-- This is a many-to-many relationship table. Each sale can have multiple items.
CREATE TABLE sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_sale DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- Optional: Add indexes for performance on frequently queried columns
CREATE INDEX idx_customers_date_added ON customers(date_added);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_sales_date ON sales(sale_date);
ALTER TABLE sales
ADD COLUMN status ENUM('Processing', 'Lens Ordered', 'Ready for Pickup', 'Completed') 
DEFAULT 'Processing' NOT NULL AFTER total_amount;