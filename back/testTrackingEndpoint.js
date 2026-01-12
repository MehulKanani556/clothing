const axios = require('axios');

async function testTrackingEndpoint() {
    try {
        const orderId = '695cf6f752f925669a3065d5';
        const url = `http://localhost:8000/api/shiprocket/orders/${orderId}/tracking/detailed`;
        
        console.log('Testing tracking endpoint:', url);
        
        const response = await axios.get(url);
        
        console.log('✅ API Response Status:', response.status);
        console.log('✅ API Response Data:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ API Test Failed:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
    }
}

testTrackingEndpoint();