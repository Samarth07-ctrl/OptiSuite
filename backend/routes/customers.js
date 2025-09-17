// backend/routes/customers.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// All these routes are protected and require a valid token
router.use(verifyToken);

// GET /api/customers - Get all customers (Admin only)
router.get('/', isAdmin, customerController.getAllCustomers);

// POST /api/customers - Create a new customer (Admin only)
router.post('/', isAdmin, customerController.createCustomer);

// GET /api/customers/:id - Get a single customer by ID (Admin only)
router.get('/:id', isAdmin, customerController.getCustomerById);

// PUT /api/customers/:id - Update a customer (Admin only)
router.put('/:id', isAdmin, customerController.updateCustomer);

// DELETE /api/customers/:id - Delete a customer (Admin only)
router.delete('/:id', isAdmin, customerController.deleteCustomer);

module.exports = router;