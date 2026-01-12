const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    createShiprocketOrder,
    getDetailedTrackingInfo,
    generateShippingLabel,
    requestPickup,
    handleWebhook,
    syncAllTrackingData,
    getAvailableCouriers,
    debugOrderData,
    checkPickupLocations,
    testPickupLocations,
    checkPincodeServiceability
} = require('../controllers/shiprocket.controller');
const shiprocketAPI = require('../utils/shiprocketAPI');

// Admin routes (require authentication)
router.post('/orders/:orderId/create', auth, createShiprocketOrder);
router.get('/orders/:orderId/tracking/detailed', auth, getDetailedTrackingInfo);
router.post('/orders/:orderId/label', auth, generateShippingLabel);
router.post('/orders/:orderId/pickup', auth, requestPickup);
router.get('/orders/:orderId/couriers', auth, getAvailableCouriers);
router.get('/orders/:orderId/debug', auth, debugOrderData);
router.get('/pickup-locations', auth, checkPickupLocations);
router.post('/sync-all', auth, syncAllTrackingData);
router.get('/test-pickup', testPickupLocations);
router.get('/test-pickup1', async (req, res) => {
    try {
        const pickupLocations = await shiprocketAPI.getPickupLocations();
        res.json({
            success: true,
            locations: pickupLocations.data,
            count: pickupLocations.data?.length || 0
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.response?.data
        });
    }
});
// Public routes
router.post('/webhook', handleWebhook); // Webhook doesn't need auth
router.get('/track/:orderId', getDetailedTrackingInfo); // Public tracking for customers with detailed info
router.post('/check-pincode/:pincode', checkPincodeServiceability); // Public pincode check with cart items

module.exports = router;