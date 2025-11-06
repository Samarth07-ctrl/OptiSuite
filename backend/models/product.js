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

/**
 * Cleans and sanitizes product data before database insertion.
 * Converts empty strings ('') for optional fields to NULL.
 * @param {object} productData - The raw product data from the request.
 * @returns {object} - The cleaned product data.
 */
const sanitizeProductData = (productData) => {
    const {
        name, brand, frame_size, material, color,
        type, price, purchase_rate, 
        quantity, barcode
    } = productData;

    // This logic fixes both errors:
    // 1. Converts empty string '' to null for a DECIMAL (purchase_rate)
    // 2. Converts empty string '' to null for a UNIQUE (barcode)
    return {
        name,
        brand: (brand === '' || brand === undefined) ? null : brand,
        frame_size: (frame_size === '' || frame_size === undefined) ? null : frame_size,
        material: (material === '' || material === undefined) ? null : material,
        color: (color === '' || color === undefined) ? null : color,
        type,
        price: parseFloat(price),
        purchase_rate: (purchase_rate === '' || purchase_rate === undefined || isNaN(parseFloat(purchase_rate))) ? null : parseFloat(purchase_rate),
        quantity: parseInt(quantity),
        barcode: (barcode === '' || barcode === undefined) ? null : barcode,
    };
};

Product.create = async (productData) => {
    // Sanitize the data first
    const p = sanitizeProductData(productData);

    const sql = `INSERT INTO products
                 (name, brand, frame_size, material, color, type, price, purchase_rate, quantity, barcode)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await db.query(sql, [
        p.name, p.brand, p.frame_size, p.material, p.color, 
        p.type, p.price, p.purchase_rate, p.quantity, p.barcode
    ]);
    return Product.findById(result.insertId);
};

Product.update = async (id, productData) => {
    // Sanitize the data first
    const p = sanitizeProductData(productData);

    const sql = `UPDATE products SET
                 name = ?, brand = ?, frame_size = ?, material = ?, color = ?,
                 type = ?, price = ?, purchase_rate = ?, quantity = ?, barcode = ?
                 WHERE id = ?`;

    const [result] = await db.query(sql, [
        p.name, p.brand, p.frame_size, p.material, p.color, 
        p.type, p.price, p.purchase_rate, p.quantity, p.barcode,
        id
    ]);

    if (result.affectedRows === 0) return null;
    return Product.findById(id);
};

Product.delete = async (id) => {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    return result;
};

Product.updateStock = async (productId, quantitySold, connection) => {
    const conn = connection || db;
    const sql = 'UPDATE products SET quantity = quantity - ? WHERE id = ?';
    const [result] = await conn.query(sql, [quantitySold, productId]);

    if (result.affectedRows === 0) {
        throw new Error('Product not found for stock update.');
    }
    const [rows] = await conn.query('SELECT quantity FROM products WHERE id = ?', [productId]);
    if (rows[0].quantity < 0) {
        throw new Error(`Insufficient stock for product ID: ${productId}.`);
    }
    return result;
};

module.exports = Product;