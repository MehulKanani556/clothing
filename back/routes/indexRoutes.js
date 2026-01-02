
const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { createUser, verifyRegistration, login, logout, forgotPassword, verifyOtp, changePassword, generateNewToken } = require('../auth/auth');
const { auth } = require('../middleware/auth');
const { getAllUsers, getSingleUser, deleteUser, updateUser } = require('../controllers/user.controller');
const { getAllProducts, getProductById, getRelatedProducts, createProduct } = require('../controllers/product.controller');
const { getAllCategories, createCategory } = require('../controllers/category.controller');
const { getAllSubCategories, createSubCategory, getSubCategoriesByCategoryId } = require('../controllers/subCategory.controller');

// auth
router.post('/register', upload.single("photo"), createUser);
router.post('/verify-registration', verifyRegistration);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/verify', verifyOtp);
router.post('/change-password', changePassword);
router.post('/generatenewtoken', auth, generateNewToken);

// user
router.get('/users', getAllUsers);
router.get('/users/:id', getSingleUser);
router.delete('/users/:id', auth, deleteUser);
router.put('/users/:id', updateUser);

// products
router.get('/products', getAllProducts);
router.post('/products', createProduct); // Potentially protect this with admin middleware later
router.get('/products/:id', getProductById);
router.get('/products/:id/related', getRelatedProducts);


// categories
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);

// subcategories
router.get('/subcategories', getAllSubCategories);
router.get('/subcategories/:categoryId', getSubCategoriesByCategoryId);
router.post('/subcategories', createSubCategory);

module.exports = router;