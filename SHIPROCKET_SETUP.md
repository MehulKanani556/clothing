# Shiprocket Integration Setup Guide

This guide will help you set up Shiprocket integration for order tracking in your e-commerce application.

## Prerequisites

1. **Shiprocket Account**: Sign up at [shiprocket.in](https://shiprocket.in)
2. **API Credentials**: Get your Shiprocket email and password for API access
3. **Pickup Location**: Configure your pickup location in Shiprocket dashboard

## Backend Setup

### 1. Environment Configuration

Add the following variables to your `back/.env` file:

```env
# Shiprocket Configuration
SHIPROCKET_EMAIL=your_shiprocket_email@example.com
SHIPROCKET_PASSWORD=your_shiprocket_password
SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1/external
PICKUP_PINCODE=110001
```

### 2. Database Migration

The order model has been updated with new tracking fields. If you have existing orders, they will automatically get the new fields when updated.

### 3. API Endpoints

New Shiprocket endpoints are available:

```
POST   /api/shiprocket/orders/:orderId/create    - Create Shiprocket order
GET    /api/shiprocket/orders/:orderId/tracking  - Get tracking info
POST   /api/shiprocket/orders/:orderId/label     - Generate shipping label
POST   /api/shiprocket/orders/:orderId/pickup    - Request pickup
GET    /api/shiprocket/orders/:orderId/couriers  - Get available couriers
POST   /api/shiprocket/sync                      - Sync all tracking data
POST   /api/shiprocket/webhook                   - Webhook for status updates
```

### 4. Automatic Order Creation

Orders are automatically created in Shiprocket when payment is verified. This happens in the payment verification process.

### 5. Webhook Setup

Configure webhook in your Shiprocket dashboard:
- URL: `https://yourdomain.com/api/shiprocket/webhook`
- Events: All shipment events

## Frontend Setup

### 1. Redux Store

The tracking slice has been added to the Redux store automatically.

### 2. New Components

- `TrackingWidget.js` - Displays tracking information
- `ShippingLabelModal.js` - Generate and download shipping labels
- `TrackOrder.js` - Public tracking page

### 3. Updated Components

- User `OrderDetails.js` - Now shows tracking widget for shipped orders
- Admin `OrderDetails.jsx` - Added Shiprocket controls and tracking

## Usage

### For Admins

1. **Create Shipment**: After payment confirmation, click "Create Shipment" in order details
2. **Request Pickup**: Once shipment is created, click "Request Pickup" to get AWB number
3. **Generate Label**: Download and print shipping labels
4. **Sync Tracking**: Manually sync tracking data or set up automated sync

### For Customers

1. **Order Tracking**: Customers can see tracking information in their order details
2. **Public Tracking**: Use `/track/:orderId` URL for public tracking
3. **Real-time Updates**: Status updates via webhooks

## Automated Sync

### Cron Job Setup

Set up a cron job to sync tracking data every 6 hours:

```bash
# Add to crontab (crontab -e)
0 */6 * * * cd /path/to/your/app/back && npm run sync-tracking
```

### Manual Sync

Run manual sync:

```bash
cd back
npm run sync-tracking
```

## Testing

### 1. Test Order Flow

1. Create a test order with payment
2. Verify Shiprocket order is created automatically
3. Request pickup from admin panel
4. Check tracking information updates

### 2. Test Webhook

Use ngrok for local testing:

```bash
ngrok http 8000
# Use the ngrok URL for webhook configuration
```

## Shiprocket Dashboard Configuration

### 1. Pickup Location

1. Go to Settings > Pickup Locations
2. Add your warehouse/store address
3. Set as "Primary" pickup location

### 2. Courier Partners

1. Go to Settings > Courier Partners
2. Enable desired courier partners
3. Configure pricing and preferences

### 3. Webhook Configuration

1. Go to Settings > API
2. Add webhook URL: `https://yourdomain.com/api/shiprocket/webhook`
3. Select all events for comprehensive tracking

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check email/password in .env file
   - Ensure Shiprocket account is active

2. **Order Creation Failed**
   - Verify pickup location is configured
   - Check product dimensions and weight
   - Ensure billing address is complete

3. **Tracking Not Working**
   - Verify shipment ID exists
   - Check if pickup has been requested
   - Ensure webhook is configured correctly

### Debug Mode

Enable debug logging by adding to your .env:

```env
DEBUG=shiprocket:*
```

### API Rate Limits

Shiprocket has rate limits:
- 100 requests per minute
- Use delays between bulk operations

## Production Deployment

### 1. Environment Variables

Ensure all Shiprocket environment variables are set in production.

### 2. Webhook Security

Consider adding webhook signature verification for production:

```javascript
// In shiprocket.controller.js webhook handler
const signature = req.headers['x-shiprocket-signature'];
// Verify signature with your webhook secret
```

### 3. Error Monitoring

Set up error monitoring for Shiprocket API calls:
- Log all API failures
- Set up alerts for high error rates
- Monitor webhook delivery failures

### 4. Backup Sync

Set up multiple sync methods:
- Webhook for real-time updates
- Cron job for backup sync
- Manual sync for troubleshooting

## Support

For Shiprocket-specific issues:
- Shiprocket Support: support@shiprocket.in
- API Documentation: [Shiprocket API Docs](https://apidocs.shiprocket.in/)

For integration issues:
- Check the console logs for detailed error messages
- Verify API credentials and configuration
- Test with Shiprocket's sandbox environment first

## Features Implemented

✅ Automatic order creation in Shiprocket after payment  
✅ Real-time tracking information display  
✅ Shipping label generation and download  
✅ Pickup request automation  
✅ Webhook integration for status updates  
✅ Admin controls for shipment management  
✅ Customer tracking interface  
✅ Automated tracking data sync  
✅ Error handling and retry logic  
✅ Public tracking page  

## Next Steps

Consider implementing:
- Return shipment integration
- Bulk order processing
- Advanced analytics and reporting
- SMS/Email notifications for tracking updates
- Multi-warehouse support