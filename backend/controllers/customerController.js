const Customer = require('../models/customer');

exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.findAll();
        res.status(200).json(customers);
    } catch (error) {
        console.error('getAllCustomers Error:', error); // <-- THIS IS THE FIX
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json(customer);
    } catch (error) {
        console.error('getCustomerById Error:', error); // <-- THIS IS THE FIX
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createCustomer = async (req, res) => {
    try {
        const newCustomer = await Customer.create(req.body);
        res.status(201).json(newCustomer);
    } catch (error) {
        console.error('createCustomer Error:', error); // <-- THIS IS THE FIX
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const updatedCustomer = await Customer.update(req.params.id, req.body);
        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json(updatedCustomer);
    } catch (error) {
        console.error('updateCustomer Error:', error); // <-- THIS IS THE FIX
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const result = await Customer.delete(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('deleteCustomer Error:', error); // <-- THIS IS THE FIX
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'Cannot delete customer. They have existing sales records.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getCustomerReport = async (req, res) => {
    try {
        const customerId = req.params.id;
        const [customerDetails, salesHistory] = await Promise.all([
            Customer.findById(customerId),
            Customer.findSalesByCustomerId(customerId)
        ]);
        if (!customerDetails) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        const report = { customer: customerDetails, sales: salesHistory };
        res.status(200).json(report);
    } catch (error) {
        console.error('getCustomerReport Error:', error); // <-- THIS IS THE FIX
        res.status(500).json({ message: 'Server error fetching customer report', error: error.message });
    }
};