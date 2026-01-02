const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, getRelatedProducts, createProduct } = require('../controllers/product.controller');

// /api/products
router.get('/', getAllProducts);
router.post('/', createProduct); // Potentially protect this with admin middleware later
router.get('/:id', getProductById);
router.get('/:id/related', getRelatedProducts);

module.exports = router;
