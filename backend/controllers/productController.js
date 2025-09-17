// backend/controllers/productController.js
const Product = require('../models/product');

// @desc    Get all products
// @route   GET /api/products
// @access  Private (Admin, Employee)
// RENAMED from getProducts to getAllProducts
exports.getAllProducts = async (req, res) => {
    try {
        // CORRECTED from Product.getAll() to Product.findAll()
        const products = await Product.findAll(); 
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Private (Admin, Employee)
exports.getProductById = async (req, res) => {
    try {
        // CORRECTED from Product.getById() to Product.findById()
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Admin)
exports.createProduct = async (req, res) => {
    try {
        const newProduct = await Product.create(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
       console.error("Create Product Error (for terminal):", error); // Still log it just in case
        res.status(500).json({ 
            message: "Backend Crash Log - See the 'error' object below for details", 
            error: error,      // The full error object
            stack: error.stack // The stack trace to see where it happened
        });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin)
exports.updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.update(req.params.id, req.body);
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res) => {
    try {
        const result = await Product.delete(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'Cannot delete product. It is part of existing sales records.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};