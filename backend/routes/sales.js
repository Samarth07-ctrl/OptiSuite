// backend/routes/sales.js
const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// All these routes are protected and require a valid token
router.use(verifyToken);

// GET /api/sales - Get all sales (Admin only)
router.get('/', isAdmin, saleController.getAllSales);

// POST /api/sales - Create a new sale (Admin and Employee)
router.post('/', saleController.createSale);

// GET /api/sales/:id - Get a single sale by ID (Admin only)
router.get('/:id', isAdmin, saleController.getSaleById);

module.exports = router;