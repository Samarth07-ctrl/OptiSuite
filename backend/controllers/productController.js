const Product = require('../models/product');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll(); 
        res.status(200).json(products);
    } catch (error) {
        console.error('getAllProducts Error:', error); // <-- THIS IS THE FIX
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error('getProductById Error:', error); // <-- THIS IS THE FIX
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const newProduct = await Product.create(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Create Product Error (for terminal):", error); // <-- THIS IS THE FIX
        res.status(500).json({ 
            message: "Backend Crash Log - See the 'error' object below for details", 
            error: error,
            sqlMessage: error.sqlMessage // Send the specific SQL error back
        });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.update(req.params.id, req.body);
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('updateProduct Error:', error); // <-- THIS IS THE FIX
        res.status(500).json({ message: 'Server error', error: error.message, sqlMessage: error.sqlMessage });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const result = await Product.delete(req.params.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('deleteProduct Error:', error); // <-- THIS IS THE FIX
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'Cannot delete product. It is part of existing sales records.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};