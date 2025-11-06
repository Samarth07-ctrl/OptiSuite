// backend/routes/customers.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// All customer routes require a valid token
router.use(verifyToken);

// --- NEW REPORT ROUTE ---
// This MUST be placed BEFORE the '/:id' route
// This is admin-only, which is correct
router.get('/:id/report', isAdmin, customerController.getCustomerReport);


// --- EXISTING ROUTES ---

// Admin and Employees can get all customers and create a new one
router.get('/', customerController.getAllCustomers);
router.post('/', customerController.createCustomer);

// Admin and Employees can get a single customer by ID
// This must be AFTER the '/:id/report' route
router.get('/:id', customerController.getCustomerById);

// ONLY Admin can update or delete
router.put('/:id', isAdmin, customerController.updateCustomer);
router.delete('/:id', isAdmin, customerController.deleteCustomer);

module.exports = router;