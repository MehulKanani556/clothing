# Pincode Serviceability Check Feature

## Overview
This feature allows customers to check if delivery is available to their pincode directly from the product details page using Shiprocket's serviceability API.

## Implementation Details

### Backend Changes

#### 1. Enhanced Shiprocket API Utility (`back/utils/shiprocketAPI.js`)
- Added `checkPincodeServiceability()` method that:
  - Takes a delivery pincode as input
  - Uses the configured pickup pincode from environment variables
  - Calls Shiprocket's serviceability API
  - Returns structured data about delivery availability
  - **Fixed ETD parsing**: Checks multiple field names (`etd`, `estimated_delivery_days`, `delivery_days`) to ensure estimated days are captured correctly

#### 2. New Controller Method (`back/controllers/shiprocket.controller.js`)
- Added `checkPincodeServiceability()` controller that:
  - Validates pincode format (6 digits)
  - Calls the Shiprocket API utility
  - Returns formatted response with delivery information

#### 3. New API Route (`back/routes/shiprocket.routes.js`)
- Added public route: `GET /api/shiprocket/check-pincode/:pincode`
- No authentication required (public endpoint)

### Frontend Changes

#### 1. Enhanced Product Details Component (`front/src/pages/ProductDetails.js`)
- Added state management for pincode input and results
- Added `handlePincodeCheck()` function to call the API
- Enhanced UI with:
  - Input validation (digits only, max 6 characters)
  - Loading state during API call
  - Result display with delivery information
  - Keyboard support (Enter key to check)
  - Auto-clear results when typing new pincode

#### 2. UI Features
- Real-time input validation
- Visual feedback for serviceable/non-serviceable areas
- Display of estimated delivery days
- Courier information
- Shipping charges
- COD availability status

## API Response Format

### Successful Response (Serviceable)
```json
{
  "success": true,
  "data": {
    "serviceable": true,
    "estimatedDays": 3,
    "courierName": "Delhivery Air",
    "codAvailable": true,
    "shippingCharge": 97,
    "availableCouriers": 8
  }
}
```

### Successful Response (Not Serviceable)
```json
{
  "success": true,
  "data": {
    "serviceable": false,
    "message": "Delivery not available to this pincode"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid pincode. Please enter a valid 6-digit pincode."
}
```

## Configuration

### Environment Variables Required
- `PICKUP_PINCODE`: Your business pickup location pincode (set in `.env`)
- `SHIPROCKET_EMAIL`: Shiprocket account email
- `SHIPROCKET_PASSWORD`: Shiprocket account password

### Current Configuration
- Pickup pincode: `395010` (configured in `.env`)
- Default weight: `0.5 kg` (can be customized per product)

## Usage

1. **Customer Experience:**
   - Navigate to any product details page
   - Scroll to the "Check Delivery" section
   - Enter their 6-digit pincode
   - Click "Check" or press Enter
   - View delivery availability and details

2. **API Usage:**
   ```bash
   GET /api/shiprocket/check-pincode/110001
   ```

## Testing Results

The feature has been tested with multiple pincodes:
- **110001 (Delhi)**: 3 days delivery via Delhivery Air, ₹97 shipping
- **400001 (Mumbai)**: 3 days delivery via DTDC Surface, ₹83.5 shipping  
- **560001 (Bangalore)**: 4 days delivery via Delhivery Air, ₹97 shipping
- **Invalid format (12345)**: Returns proper validation error

## Technical Fix Applied

**Issue**: Estimated days were showing as `null`
**Root Cause**: Shiprocket API uses different field names for delivery time across different courier partners
**Solution**: Enhanced parsing to check multiple possible field names:
- `etd` (Estimated Time of Delivery)
- `estimated_delivery_days`
- `delivery_days`

This ensures compatibility with all courier partners in Shiprocket's network.

## Benefits

1. **Customer Experience:**
   - Instant delivery confirmation before purchase
   - Transparent shipping costs and timelines
   - Reduces cart abandonment due to delivery uncertainty

2. **Business Benefits:**
   - Reduces customer service inquiries about delivery
   - Improves conversion rates
   - Sets proper delivery expectations

## Future Enhancements

1. **Product-Specific Weight:** Calculate actual product weight for more accurate shipping costs
2. **Multiple Pickup Locations:** Support for different pickup locations based on product availability
3. **Delivery Date Estimation:** Show actual delivery dates instead of just days
4. **Caching:** Cache results for frequently checked pincodes to improve performance
5. **Bulk Check:** Allow checking multiple pincodes at once for business customers