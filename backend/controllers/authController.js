const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'User with this email already exists.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUser = await User.create({ name, email, password: hashedPassword, role });
        res.status(201).json({ message: 'User registered successfully!', user: createdUser });
    } catch (error) {
        console.error('Register Error:', error); // <-- THIS IS THE FIX
        res.status(500).json({ error: 'Failed to register user.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            JWT_SECRET,
            { expiresIn: '8h' }
        );
        res.json({ message: 'Login successful', token, role: user.role, name: user.name });
    } catch (error) {
        console.error('Login Error:', error); // <-- THIS IS THE FIX
        res.status(500).json({ error: 'Server error during login.' });
    }
};