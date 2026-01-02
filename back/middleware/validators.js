const { body } = require('express-validator');

exports.productValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('gender').isIn(['Men', 'Women', 'Unisex', 'Boys', 'Girls', 'Kids']).withMessage('Invalid gender'),
    body('gstPercentage').isFloat({ min: 0, max: 28 }).withMessage('GST must be between 0 and 28'),
    body('variants').isArray({ min: 1 }).withMessage('At least one variant is required')
];

exports.orderValidation = [
    body('items').isArray({ min: 1 }).withMessage('Cart is empty'),
    body('shippingAddress.pincode').isLength({ min: 6, max: 6 }).withMessage('Invalid Pincode'),
    body('paymentMethod').isIn(['COD', 'Online']).withMessage('Invalid Payment Method')
];

exports.returnValidation = [
    body('orderId').notEmpty(),
    body('items').isArray({ min: 1 }),
    body('reason').notEmpty()
];

exports.offerValidation = [
    body('code').notEmpty(),
    body('value').isNumeric(),
    body('type').isIn(['PERCENTAGE', 'FLAT'])
];
