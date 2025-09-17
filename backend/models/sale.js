// backend/models/sale.js
const db = require('../config/db');

const Sale = {};

// When creating a sale, we expect a transaction connection to be passed
Sale.create = async (saleData, connection) => {
    const conn = connection || db; // Use transaction connection or default pool
    const { customer_id, total_amount } = saleData;
    const sale_date = new Date().toISOString().slice(0, 10);

    const sql = 'INSERT INTO sales (customer_id, sale_date, total_amount) VALUES (?, ?, ?)';
    const [result] = await conn.query(sql, [customer_id, sale_date, total_amount]);
    return { id: result.insertId, ...saleData };
};

// For adding items, we also expect a transaction connection
Sale.addItem = async (itemData, connection) => {
    const conn = connection || db;
    const { sale_id, product_id, quantity, price_at_sale } = itemData;
    const sql = 'INSERT INTO sale_items (sale_id, product_id, quantity, price_at_sale) VALUES (?, ?, ?, ?)';
    const [result] = await conn.query(sql, [sale_id, product_id, quantity, price_at_sale]);
    return result;
};

Sale.findAll = async () => {
    // Join with customers to get customer name
    const sql = `
        SELECT s.id, s.customer_id, c.name as customer_name, s.sale_date, s.total_amount
        FROM sales s
        JOIN customers c ON s.customer_id = c.id
        ORDER BY s.sale_date DESC, s.id DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
};

Sale.findById = async (id) => {
    // First, get the main sale details
    const saleSql = `
        SELECT s.id, s.customer_id, c.name as customer_name, s.sale_date, s.total_amount
        FROM sales s
        JOIN customers c ON s.customer_id = c.id
        WHERE s.id = ?
    `;
    const [saleRows] = await db.query(saleSql, [id]);
    if (saleRows.length === 0) return null;

    // Second, get the items for that sale
    const itemsSql = `
        SELECT si.product_id, p.name as product_name, si.quantity, si.price_at_sale
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = ?
    `;
    const [itemRows] = await db.query(itemsSql, [id]);

    const sale = saleRows[0];
    sale.items = itemRows; // Attach items to the sale object

    return sale;
};

module.exports = Sale;