const shiprocketAPI = require('./utils/shiprocketAPI');
require('dotenv').config();

async function testShiprocketPickupAPI() {
    try {
        console.log('🧪 Testing Shiprocket Pickup Locations API\n');
        
        // Debug environment variables
        console.log('Environment variables:');
        console.log('SHIPROCKET_EMAIL:', process.env.SHIPROCKET_EMAIL ? 'Set' : 'Not set');
        console.log('SHIPROCKET_PASSWORD:', process.env.SHIPROCKET_PASSWORD ? 'Set' : 'Not set');
        console.log('SHIPROCKET_BASE_URL:', process.env.SHIPROCKET_BASE_URL);
        
        // Test authentication first
        console.log('\n1. Testing authentication...');
        const token = await shiprocketAPI.authenticate();
        console.log('✅ Authentication successful');
        console.log('Token length:', token.length);
        
        // Test getting pickup locations
        console.log('\n2. Testing get pickup locations...');
        const pickupLocations = await shiprocketAPI.getPickupLocations();
        console.log('✅ Pickup locations fetched successfully');
        console.log('Response structure:', {
            type: typeof pickupLocations,
            hasData: !!pickupLocations.data,
            dataType: typeof pickupLocations.data,
            isDataArray: Array.isArray(pickupLocations.data),
            dataLength: pickupLocations.data ? pickupLocations.data.length : 'N/A'
        });
        
        console.log('\nFull response:');
        console.log(JSON.stringify(pickupLocations, null, 2));
        
        if (pickupLocations.data && Array.isArray(pickupLocations.data)) {
            console.log(`\n📍 Found ${pickupLocations.data.length} pickup locations:`);
            pickupLocations.data.forEach((location, index) => {
                console.log(`${index + 1}. ${location.pickup_location || location.name || 'Unnamed'}`);
                console.log(`   Address: ${location.address || 'No address'}`);
                console.log(`   City: ${location.city || 'No city'}`);
                console.log(`   ID: ${location.id || 'No ID'}`);
                console.log('');
            });
        } else {
            console.log('⚠️  No pickup locations found or unexpected response structure');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Error details:', error.response?.data || error);
        
        if (error.message.includes('authenticate')) {
            console.log('\n💡 Troubleshooting:');
            console.log('- Check SHIPROCKET_EMAIL in .env file');
            console.log('- Check SHIPROCKET_PASSWORD in .env file');
            console.log('- Verify Shiprocket account credentials');
        }
    }
}

testShiprocketPickupAPI();