// backend/models/customer.js
const db = require('../config/db');

const Customer = {};

Customer.findAll = async () => {
    // Select all fields including new prescription ones
    const [rows] = await db.query('SELECT * FROM customers ORDER BY name ASC');
    return rows;
};

Customer.findById = async (id) => {
    // Select all fields
    const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
    return rows[0];
};

Customer.create = async (customerData) => {
    // Include all new prescription fields, defaulting to NULL if not provided
    const { 
        name, phone = null, email = null, address = null, 
        od_sph = null, od_cyl = null, od_axis = null, od_add = null, 
        os_sph = null, os_cyl = null, os_axis = null, os_add = null, 
        pd = null, notes = null 
    } = customerData;
    
    const sql = `INSERT INTO customers (name, phone, email, address, date_added,
                 od_sph, od_cyl, od_axis, od_add, os_sph, os_cyl, os_axis, os_add, pd, notes) 
                 VALUES (?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                 
    const [result] = await db.query(sql, [
        name, phone, email, address, 
        od_sph, od_cyl, od_axis, od_add, os_sph, os_cyl, os_axis, os_add, pd, notes
    ]);
    return Customer.findById(result.insertId); 
};

Customer.update = async (id, customerData) => {
     const { 
        name, phone = null, email = null, address = null, 
        od_sph = null, od_cyl = null, od_axis = null, od_add = null, 
        os_sph = null, os_cyl = null, os_axis = null, os_add = null, 
        pd = null, notes = null 
    } = customerData;

    const sql = `UPDATE customers SET name = ?, phone = ?, email = ?, address = ?, 
                 od_sph = ?, od_cyl = ?, od_axis = ?, od_add = ?, 
                 os_sph = ?, os_cyl = ?, os_axis = ?, os_add = ?, 
                 pd = ?, notes = ? 
                 WHERE id = ?`;
                 
    const [result] = await db.query(sql, [
        name, phone, email, address, 
        od_sph, od_cyl, od_axis, od_add, os_sph, os_cyl, os_axis, os_add, pd, notes,
        id 
    ]);

    if (result.affectedRows === 0) return null; 
    return Customer.findById(id); 
};

Customer.delete = async (id) => {
    const [result] = await db.query('DELETE FROM customers WHERE id = ?', [id]);
    return result; 
};

// *** THIS IS THE NEW FUNCTION YOU WERE MISSING ***
// Find all sales associated with a specific customer
Customer.findSalesByCustomerId = async (customerId) => {
    const sql = `
        SELECT 
            s.id, 
            s.sale_date, 
            s.total_amount,
            GROUP_CONCAT(p.name SEPARATOR ', ') AS products_sold 
        FROM sales s
        LEFT JOIN sale_items si ON s.id = si.sale_id
        LEFT JOIN products p ON si.product_id = p.id
        WHERE s.customer_id = ?
        GROUP BY s.id, s.sale_date, s.total_amount
        ORDER BY s.sale_date DESC, s.id DESC;
    `;
    const [rows] = await db.query(sql, [customerId]);
    return rows;
};

module.exports = Customer;