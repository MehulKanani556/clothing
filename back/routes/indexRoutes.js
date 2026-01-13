
const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { createUser, verifyRegistration, login, logout, forgotPassword, verifyOtp, changePassword, generateNewToken } = require('../auth/auth');
const { auth } = require('../middleware/auth');
const { getAllUsers, getSingleUser, deleteUser, updateUser, addAddress, deleteAddress, setDefaultAddress } = require('../controllers/user.controller');

const { getAllProducts, getProductById, getRelatedProducts, createProduct, uploadProductImage, updateProduct, deleteProduct, getAdminProducts, getNewArrivals, getMostPopular, getBestSellers } = require('../controllers/product.controller');
const { getAllMainCategories, createMainCategory, updateMainCategory, deleteMainCategory, getMainCategoryById, getAllAdminMainCategories } = require('../controllers/mainCategory.controller');
const { getAllCategories, createCategory, updateCategory, deleteCategory, getCategoryById, getAlladminCategories } = require('../controllers/category.controller');
const { getAllSubCategories, createSubCategory, getSubCategoriesByCategoryId, updateSubCategory, deleteSubCategory, getAllAdminSubCategories } = require('../controllers/subCategory.controller');
const { getProductsBySlug, getProductBySlug } = require('../controllers/listing.controller');

const { addToCart, getCart, removeFromCart, updateCartItem } = require('../controllers/cart.controller');
const { addToWishlist, getWishlist, removeFromWishlist } = require('../controllers/wishlist.controller');

// New Controllers
const { createOrder, getUserOrders, getAdminOrders, updateOrderStatus, getOrderById } = require('../controllers/order.controller');
const { requestReturn, processReturn, getAllReturns } = require('../controllers/return.controller');
const { getGstReport, getNetPayout } = require('../controllers/report.controller');
const { createOffer, validateCoupon, getOffers, getAllOffersAdmin, uploadBanner, updateOffer, deleteOffer } = require('../controllers/offer.controller');
const { createBlogPost, getAllBlogs, getBlogBySlug, deleteBlog } = require('../controllers/blog.controller');
const { addReview, getProductReviews, getAllReviews, updateReviewStatus, deleteReview } = require('../controllers/review.controller');
const { orderValidation, returnValidation, offerValidation } = require('../middleware/validators');
const { getSettings, updateSetting } = require('../controllers/settings.controller');
const { createTicket, getAllTickets, updateTicketStatus } = require('../controllers/support.controller');
const { createCashfreeOrder, verifyPayment, processPayment, processCODPayment, getPaymentMethods, handleWebhook } = require('../controllers/payment.controller');
const shiprocketRoutes = require('./shiprocket.routes');
const { createBanner, getBanners, getAdminBanners, updateBanner, deleteBanner, toggleBannerStatus, updateBannerOrder } = require('../controllers/banner.controller');
const { createheroBanner, getHeroBanners, getAdminHeroBanners, updateheroBanner, deleteheroBanner } = require('../controllers/herobanner.controller');

// ... (skipping unchanged lines)

// --- BANNER SERVICE ---
router.get('/banners', getBanners); // Public
router.get('/banners/admin', auth, getAdminBanners);
router.post('/banners', auth, upload.single('image'), createBanner);
router.put('/banners/order', auth, updateBannerOrder);
router.put('/banners/:id', auth, upload.single('image'), updateBanner);
router.delete('/banners/:id', auth, deleteBanner);
router.patch('/banners/:id/status', auth, toggleBannerStatus);

// herobanner
router.get('/herobanners', getHeroBanners); // Public
router.get('/herobanners/admin', auth, getAdminHeroBanners);
router.post('/herobanners', auth, upload.single('image'), createheroBanner);
router.put('/herobanners/:id', auth, upload.single('image'), updateheroBanner);
router.delete('/herobanners/:id', auth, deleteheroBanner);

// auth
router.post('/register', upload.single("photo"), createUser);
router.post('/verify-registration', verifyRegistration);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/verify', verifyOtp);
router.post('/change-password', changePassword);
router.post('/generateNewTokens', generateNewToken);

// user
router.get('/users', getAllUsers);
router.get('/users/:id', getSingleUser);
router.delete('/users/:id', auth, deleteUser);
router.put('/users/profile', auth, upload.single("photo"), updateUser);
router.post('/users/address', auth, addAddress);
router.delete('/users/address/:addressId', auth, deleteAddress);
router.put('/users/address/:addressId/default', auth, setDefaultAddress);

// products
router.get('/products/admin', auth, getAdminProducts);
router.get('/products/new-arrivals', getNewArrivals);
router.get('/products/most-popular', getMostPopular);
router.get('/products/best-sellers', getBestSellers);
router.get('/products', getAllProducts);
router.post('/products', upload.any(), createProduct); // Updated to handle FormData
router.put('/products/:id', upload.any(), updateProduct); // Updated to handle FormData
router.delete('/products/:id', auth, deleteProduct);
router.post('/products/upload-image', auth, upload.single("image"), uploadProductImage);
router.get('/products/:id', getProductById);
router.get('/products/:id/related', getRelatedProducts);
router.get('/products/listing/:slug', getProductsBySlug);
router.get('/products/details/:slug', getProductBySlug);

// main categories
router.get('/maincategories', getAllMainCategories);
router.get('/adminmaincategories', getAllAdminMainCategories);
router.get('/maincategories/:id', getMainCategoryById);
router.post('/maincategories', upload.single('image'), createMainCategory);
router.put('/maincategories/:id', upload.single('image'), updateMainCategory);
router.delete('/maincategories/:id', deleteMainCategory);

// categories
router.get('/categories', getAllCategories);
router.get('/admincategories', getAlladminCategories);
router.get('/categories/:id', getCategoryById);
router.post('/categories', upload.single('image'), createCategory);
router.put('/categories/:id', upload.single('image'), updateCategory);
router.delete('/categories/:id', deleteCategory);

// subcategories
router.get('/subcategories', getAllSubCategories);
router.get('/adminsubcategories', getAllAdminSubCategories);
router.get('/subcategories/:categoryId', getSubCategoriesByCategoryId);
router.post('/subcategories', upload.single('image'), createSubCategory);
router.put('/subcategories/:id', upload.single('image'), updateSubCategory);
router.delete('/subcategories/:id', deleteSubCategory);

// Cart
router.post('/cart', auth, addToCart);
router.get('/cart', auth, getCart);
router.delete('/cart/:itemId', auth, removeFromCart);
router.put('/cart/:itemId', auth, updateCartItem);
// --- ORDER SERVICE ---
router.post('/orders', auth, orderValidation, createOrder);
router.get('/orders/my-orders', auth, getUserOrders);
router.get('/orders/admin', auth, getAdminOrders);
router.get('/orders/:id', auth, getOrderById);
router.put('/orders/:id/status', auth, updateOrderStatus);

// --- RETURN SERVICE ---
router.post('/returns', auth, returnValidation, requestReturn);
router.get('/returns/admin', auth, getAllReturns);
router.put('/returns/:id', auth, processReturn);

// --- OFFER SERVICE ---
router.post('/offers', auth, offerValidation, createOffer);
router.post('/offers/validate', auth, validateCoupon); // Require auth for validation
router.get('/offers', auth, getOffers); // Require auth to get user-specific offers
router.get('/offers/admin', auth, getAllOffersAdmin); // Admin endpoint for all offers
router.put('/offers/:id', auth, updateOffer);
router.delete('/offers/:id', auth, deleteOffer);
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
router.post('/support', createTicket); // Public or Auth? Let's say public allowed for guest support
router.get('/support', auth, getAllTickets);
router.put('/support/:id', auth, updateTicketStatus);

// --- SETTINGS SERVICE ---
router.get('/settings', getSettings);
router.post('/settings', auth, updateSetting);

// Payment
router.post('/payment/create', auth, createCashfreeOrder);
router.post('/payment/pay', auth, processPayment);
router.post('/payment/cod', auth, processCODPayment);
router.post('/payment/verify', auth, verifyPayment);
router.get('/payment/methods', auth, getPaymentMethods);
router.post('/payment/webhook', handleWebhook);

// Wishlist
router.post('/wishlist', auth, addToWishlist);
router.get('/wishlist', auth, getWishlist);
router.delete('/wishlist/:productId', auth, removeFromWishlist);

router.post('/reviews', auth, upload.array('images', 5), addReview);
router.get('/reviews/product/:productId', getProductReviews);
router.get('/reviews/admin', auth, getAllReviews);
router.put('/reviews/:id', auth, updateReviewStatus);
router.delete('/reviews/:id', auth, deleteReview);

// Shiprocket Integration
router.use('/shiprocket', shiprocketRoutes);

// --- BANNER SERVICE ---
router.get('/banners', getBanners); // Public
router.get('/banners/admin', auth, getAdminBanners);
router.post('/banners', auth, upload.single('image'), createBanner);
router.put('/banners/:id', auth, upload.single('image'), updateBanner);
router.delete('/banners/:id', auth, deleteBanner);
router.patch('/banners/:id/status', auth, toggleBannerStatus);

module.exports = router;
