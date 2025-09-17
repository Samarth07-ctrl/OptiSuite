// backend/routes/products.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// All these routes are protected and require a valid token
router.use(verifyToken);

// GET /api/products - Get all products (Admin and Employee)
router.get('/', productController.getAllProducts);

// POST /api/products - Create a new product (Admin only)
router.post('/', isAdmin, productController.createProduct);

// GET /api/products/:id - Get a single product by ID (Admin and Employee)
router.get('/:id', productController.getProductById);

// PUT /api/products/:id - Update a product (Admin only)
router.put('/:id', isAdmin, productController.updateProduct);

// DELETE /api/products/:id - Delete a product (Admin only)
router.delete('/:id', isAdmin, productController.deleteProduct);

module.exports = router;
