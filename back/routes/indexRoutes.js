
const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { createUser, verifyRegistration, login, logout, forgotPassword, verifyOtp, changePassword, generateNewToken } = require('../auth/auth');
const { auth } = require('../middleware/auth');
const { getAllUsers, getSingleUser, deleteUser, updateUser } = require('../controllers/user.controller');
const { getAllProducts, getProductById, getRelatedProducts, createProduct, uploadProductImage, updateProduct, deleteProduct } = require('../controllers/product.controller');
const { getAllCategories, createCategory } = require('../controllers/category.controller');
const { getAllSubCategories, createSubCategory, getSubCategoriesByCategoryId } = require('../controllers/subCategory.controller');
const { addToCart, getCart, removeFromCart, updateCartItem } = require('../controllers/cart.controller');
const { addToWishlist, getWishlist, removeFromWishlist } = require('../controllers/wishlist.controller');

// New Controllers
const { createOrder, getUserOrders, getAdminOrders, updateOrderStatus } = require('../controllers/order.controller');
const { requestReturn, processReturn, getAllReturns } = require('../controllers/return.controller');
const { createOffer, validateCoupon, getOffers, uploadBanner } = require('../controllers/offer.controller');
const { getGstReport, getNetPayout } = require('../controllers/report.controller');

const { createBlogPost, getAllBlogs, getBlogBySlug, deleteBlog } = require('../controllers/blog.controller');
const { orderValidation, returnValidation, offerValidation } = require('../middleware/validators');

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
router.post('/products', upload.any(), createProduct); // Updated to handle FormData
router.put('/products/:id', upload.any(), updateProduct); // Updated to handle FormData
router.delete('/products/:id', auth, deleteProduct);
router.post('/products/upload-image', auth, upload.single("image"), uploadProductImage);
router.get('/products/:id', getProductById);
router.get('/products/:id/related', getRelatedProducts);

// categories
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);

// subcategories
router.get('/subcategories', getAllSubCategories);
router.get('/subcategories/:categoryId', getSubCategoriesByCategoryId);
router.post('/subcategories', createSubCategory);

// Cart
router.post('/cart', auth, addToCart);
router.get('/cart', auth, getCart);
router.delete('/cart/:itemId', auth, removeFromCart);
router.put('/cart/:itemId', auth, updateCartItem);
// --- ORDER SERVICE ---
router.post('/orders', auth, orderValidation, createOrder);
router.get('/orders/my-orders', auth, getUserOrders);
router.get('/orders/admin', auth, getAdminOrders);
router.put('/orders/:id/status', auth, updateOrderStatus);

// --- RETURN SERVICE ---
router.post('/returns', auth, returnValidation, requestReturn);
router.get('/returns/admin', auth, getAllReturns);
router.put('/returns/:id', auth, processReturn);

// --- OFFER SERVICE ---
router.post('/offers', auth, offerValidation, createOffer);
router.post('/offers/validate', validateCoupon);
router.get('/offers', getOffers);
router.post('/offers/upload-banner', auth, upload.single("banner"), uploadBanner);

// --- CMS / BLOG SERVICE ---
router.get('/blogs', getAllBlogs);
router.get('/blogs/:slug', getBlogBySlug);
router.post('/blogs', auth, upload.single("banner"), createBlogPost);
router.delete('/blogs/:id', auth, deleteBlog);

// --- REPORTS / GST ---
router.get('/reports/gst', auth, getGstReport);
router.get('/reports/payout', auth, getNetPayout);

// --- SUPPORT SERVICE ---
const { createTicket, getAllTickets, updateTicketStatus } = require('../controllers/support.controller');
router.post('/support', createTicket); // Public or Auth? Let's say public allowed for guest support
router.get('/support', auth, getAllTickets);
router.put('/support/:id', auth, updateTicketStatus);

// --- SETTINGS SERVICE ---
const { getSettings, updateSetting } = require('../controllers/settings.controller');
router.get('/settings', auth, getSettings);
router.post('/settings', auth, updateSetting);

// Wishlist
router.post('/wishlist', auth, addToWishlist);
router.get('/wishlist', auth, getWishlist);
router.delete('/wishlist/:productId', auth, removeFromWishlist);

module.exports = router;