// backend/controllers/saleController.js
const Sale = require('../models/sale');
const Product = require('../models/product'); // We'll need this to update stock
const db = require('../config/db'); // For transactions

// @desc    Create a new sale
// @route   POST /api/sales
// @access  Private (Admin, Employee)
exports.createSale = async (req, res) => {
    const { customer_id, total_amount, items } = req.body;

    // Basic validation
    if (!customer_id || !total_amount || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Missing required sale data.' });
    }

    const connection = await db.getConnection(); // Get a connection from the pool for a transaction

    try {
        await connection.beginTransaction(); // Start transaction

        // 1. Create the main sale record
        const saleData = { customer_id, total_amount };
        const newSale = await Sale.create(saleData, connection);

        // 2. Process each sale item
        for (const item of items) {
            // Add the item to the sale_items table
            const saleItemData = {
                sale_id: newSale.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_sale: item.price_at_sale,
            };
            await Sale.addItem(saleItemData, connection);

            // Update the product stock
            await Product.updateStock(item.product_id, item.quantity, connection);
        }

        await connection.commit(); // Commit transaction if all steps succeed
        res.status(201).json(newSale);

    } catch (error) {
        await connection.rollback(); // Rollback transaction on error
        res.status(500).json({ message: 'Server error during sale creation', error: error.message });
    } finally {
        connection.release(); // ALWAYS release the connection back to the pool
    }
};


// @desc    Get all sales
// @route   GET /api/sales
// @access  Private (Admin)
exports.getAllSales = async (req, res) => {
    try {
        const sales = await Sale.findAll();
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get a single sale by ID with its items
// @route   GET /api/sales/:id
// @access  Private (Admin)
exports.getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);
        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }
        res.status(200).json(sale);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};