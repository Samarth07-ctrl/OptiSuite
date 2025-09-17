// backend/routes/api.js
const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Import other route files
const customerRoutes = require('./customers');
const productRoutes = require('./products');
const salesRoutes = require('./sales');
const authRoutes = require('./auth');

// Public route for authentication (no token required)
router.use('/auth', authRoutes);

// Apply middleware to all routes below this line
// All routes after this middleware will require a valid JWT
router.use(verifyToken);

// Admin-only routes
router.use('/customers', isAdmin, customerRoutes);
router.use('/products', isAdmin, productRoutes);

// The sales route might be accessible to both admin and regular employee roles
router.use('/sales', salesRoutes);

module.exports = router;