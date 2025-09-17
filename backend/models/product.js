// backend/models/product.js
const db = require('../config/db');

const Product = {};

Product.findAll = async () => {
    const [rows] = await db.query('SELECT * FROM products ORDER BY name ASC');
    return rows;
};

Product.findById = async (id) => {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
};

Product.create = async (productData) => {
    const { name, brand, type, price, quantity } = productData;
    const sql = 'INSERT INTO products (name, brand, type, price, quantity) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [name, brand, type, price, quantity]);
    return { id: result.insertId, ...productData };
};

Product.update = async (id, productData) => {
    const { name, brand, type, price, quantity } = productData;
    const sql = 'UPDATE products SET name = ?, brand = ?, type = ?, price = ?, quantity = ? WHERE id = ?';
    await db.query(sql, [name, brand, type, price, quantity, id]);
    return { id, ...productData };
};

Product.delete = async (id) => {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    return result;
};

// This function will be used within a transaction in the saleController
Product.updateStock = async (productId, quantitySold, connection) => {
    const conn = connection || db; // Use the provided transaction connection or the general pool
    const sql = 'UPDATE products SET quantity = quantity - ? WHERE id = ?';
    const [result] = await conn.query(sql, [quantitySold, productId]);

    if (result.affectedRows === 0) {
        throw new Error('Product not found for stock update.');
    }
    // Check if stock went negative
    const [rows] = await conn.query('SELECT quantity FROM products WHERE id = ?', [productId]);
    if (rows[0].quantity < 0) {
        throw new Error(`Insufficient stock for product ID: ${productId}.`);
    }
    return result;
};


module.exports = Product;