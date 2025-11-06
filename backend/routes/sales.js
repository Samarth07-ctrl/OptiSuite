// backend/routes/sales.js
const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken);

// --- REPORTING ROUTE ---
// Must be before /:id
router.get('/reports/full', isAdmin, saleController.getFullReport);

// --- STATUS UPDATE ROUTE ---
// This was missing. Must be before /:id
router.put('/:id/status', isAdmin, saleController.updateSaleStatus);

// --- EXISTING ROUTES ---

// POST /api/sales - Create a new sale
router.post('/', saleController.createSale);

// GET /api/sales - Get all sales
router.get('/', isAdmin, saleController.getAllSales);

// GET /api/sales/:id - Get a single sale
router.get('/:id', isAdmin, saleController.getSaleById);

module.exports = router;