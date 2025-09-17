// backend/models/customer.js
const db = require('../config/db');

const Customer = {};

Customer.findAll = async () => {
    const [rows] = await db.query('SELECT * FROM customers ORDER BY name ASC');
    return rows;
};

Customer.findById = async (id) => {
    const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    return rows[0];
};

Customer.create = async (customerData) => {
    const { name, phone, email, address, prescription } = customerData;
    // Get today's date in YYYY-MM-DD format
    const date_added = new Date().toISOString().slice(0, 10);
    // Convert prescription object to a JSON string for storing
    const prescriptionJson = JSON.stringify(prescription);

    const sql = 'INSERT INTO customers (name, phone, email, address, date_added, prescription) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [name, phone, email, address, date_added, prescriptionJson]);
    return { id: result.insertId, ...customerData };
};

Customer.update = async (id, customerData) => {
    const { name, phone, email, address, prescription } = customerData;
    const prescriptionJson = JSON.stringify(prescription);
    const sql = 'UPDATE customers SET name = ?, phone = ?, email = ?, address = ?, prescription = ? WHERE id = ?';
    await db.query(sql, [name, phone, email, address, prescriptionJson, id]);
    return { id, ...customerData };
};

Customer.delete = async (id) => {
    const [result] = await db.query('DELETE FROM customers WHERE id = ?', [id]);
    return result;
};

module.exports = Customer;