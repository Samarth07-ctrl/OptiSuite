// backend/controllers/customerController.js
const Customer = require('../models/customer');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private (Admin)
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.findAll();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get a single customer by ID
// @route   GET /api/customers/:id
// @access  Private (Admin)
exports.getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Private (Admin)
exports.createCustomer = async (req, res) => {
    try {
        const newCustomer = await Customer.create(req.body);
        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private (Admin)
exports.updateCustomer = async (req, res) => {
    try {
        const updatedCustomer = await Customer.update(req.params.id, req.body);
        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json(updatedCustomer);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin)
exports.deleteCustomer = async (req, res) => {
    try {
        const result = await Customer.delete(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
        // Handle potential foreign key constraint errors
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'Cannot delete customer. They have existing sales records.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};