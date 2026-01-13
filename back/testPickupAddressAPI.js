const axios = require('axios');

// Test pickup address management APIs
async function testPickupAddressAPI() {
    const baseURL = 'http://localhost:8000/api/shiprocket';
    
    // You'll need to get a valid JWT token for testing
    // For now, we'll test without authentication to see the structure
    
    console.log('🧪 Testing Pickup Address Management APIs\n');

    try {
        // Test 1: Get all pickup locations
        console.log('1. Testing GET /pickup-locations/manage');
        try {
            const response = await axios.get(`${baseURL}/pickup-locations/manage`);
            console.log('✅ Success:', response.data);
        } catch (error) {
            console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 2: Add new pickup location (sample data)
        console.log('2. Testing POST /pickup-locations');
        const samplePickupData = {
            pickup_location: 'Test Warehouse',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '9876543210',
            address: '123 Test Street',
            address_2: 'Near Test Mall',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            pin_code: '400001',
            vendor_name: 'Test Vendor',
            gstin: '27AAAAA0000A1Z5'
        };

        try {
            const response = await axios.post(`${baseURL}/pickup-locations`, samplePickupData);
            console.log('✅ Success:', response.data);
        } catch (error) {
            console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 3: Update pickup location (sample)
        console.log('3. Testing PUT /pickup-locations/:id');
        const updateData = {
            pickup_location: 'Updated Test Warehouse',
            name: 'Jane Doe',
            email: 'jane@example.com',
            phone: '9876543211',
            address: '456 Updated Street',
            city: 'Delhi',
            state: 'Delhi',
            country: 'India',
            pin_code: '110001'
        };

        try {
            const response = await axios.put(`${baseURL}/pickup-locations/123`, updateData);
            console.log('✅ Success:', response.data);
        } catch (error) {
            console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 4: Delete pickup location
        console.log('4. Testing DELETE /pickup-locations/:id');
        try {
            const response = await axios.delete(`${baseURL}/pickup-locations/123`);
            console.log('✅ Success:', response.data);
        } catch (error) {
            console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
        }

    } catch (error) {
        console.error('Test setup failed:', error.message);
    }

    console.log('\n📝 Notes:');
    console.log('- All endpoints require authentication (JWT token)');
    console.log('- Replace :id with actual pickup location ID from Shiprocket');
    console.log('- Test with valid Shiprocket credentials in .env file');
    console.log('- Frontend will handle authentication automatically');
}

// Test Shiprocket API structure
async function testShiprocketAPIStructure() {
    console.log('\n🔍 Expected Shiprocket API Endpoints:');
    console.log('GET    /settings/company/pickup           - Get all pickup locations');
    console.log('POST   /settings/company/addpickup        - Add new pickup location');
    console.log('POST   /settings/company/pickup/edit/:id  - Update pickup location');
    console.log('DELETE /settings/company/pickup/:id       - Delete pickup location');
    
    console.log('\n📋 Required Fields for Pickup Location:');
    const requiredFields = [
        'pickup_location',  // Location name/nickname
        'name',            // Contact person name
        'email',           // Contact email
        'phone',           // Contact phone
        'address',         // Street address
        'city',            // City
        'state',           // State
        'country',         // Country (usually India)
        'pin_code'         // PIN code
    ];
    
    requiredFields.forEach(field => {
        console.log(`- ${field} (required)`);
    });
    
    console.log('\n📋 Optional Fields:');
    const optionalFields = [
        'address_2',       // Address line 2
        'vendor_name',     // Vendor name
        'gstin',           // GST number
        'rto_address_id'   // RTO address ID
    ];
    
    optionalFields.forEach(field => {
        console.log(`- ${field} (optional)`);
    });
}

// Run tests
console.log('🚀 Starting Pickup Address API Tests...\n');
testPickupAddressAPI().then(() => {
    testShiprocketAPIStructure();
    console.log('\n✨ Test completed!');
});