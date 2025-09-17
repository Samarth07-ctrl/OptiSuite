// backend/models/user.js
const db = require('../config/db');
const bcrypt = require('bcryptjs'); // We don't need bcrypt here anymore, but leaving it is fine

const User = {};

User.create = async (userData) => {
    // This function receives the ALREADY HASHED password.
    // It should NOT hash it again.
    const { name, email, password, role } = userData;
    const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    
    // It simply takes the provided data and saves it.
    const [result] = await db.query(sql, [name, email, password, role]);
    
    // We remove the password from the returned object for security
    const { password: _, ...userWithoutPassword } = userData;
    return { id: result.insertId, ...userWithoutPassword };
};

User.findByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

module.exports = User;