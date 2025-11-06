const express = require('express');
const router = express.Router();

// Import all the route handlers
const authRoutes = require('./auth');
const customerRoutes = require('./customers');
const productRoutes = require('./products');
const salesRoutes = require('./sales');

// Use the specific routers for each path
// The individual route files will handle their own middleware (verifyToken, isAdmin)
router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/sales', salesRoutes);

module.exports = router;