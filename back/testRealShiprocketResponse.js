const mongoose = require('mongoose');
const Order = require('./models/order.model');
require('dotenv').config();

// Mock Shiprocket response based on the provided format
const mockShiprocketResponse = {
    "tracking_data": {
        "track_status": 1,
        "shipment_status": 7,
        "shipment_track": [{
            "id": 236612717,
            "awb_code": "141123221084922",
            "courier_company_id": 51,
            "shipment_id": 236612717,
            "order_id": 237157589,
            "pickup_date": "2022-07-18 20:28:00",
            "delivered_date": "2022-07-19 11:37:00",
            "weight": "0.30",
            "packages": 1,
            "current_status": "Delivered",
            "delivered_to": "Chittoor",
            "destination": "Chittoor",
            "consignee_name": "",
            "origin": "Banglore",
            "courier_agent_details": null,
            "courier_name": "Xpressbees Surface",
            "edd": null,
            "pod": "Available",
            "pod_status": "https://s3-ap-southeast-1.amazonaws.com/kr-shipmultichannel/courier/51/pod/141123221084922.png"
        }],
        "shipment_track_activities": [
            {
                "date": "2022-07-19 11:37:00",
                "status": "DLVD",
                "activity": "Delivered",
                "location": "MADANPALLI, Madanapalli, ANDHRA PRADESH",
                "sr-status": "7",
                "sr-status-label": "DELIVERED"
            },
            {
                "date": "2022-07-19 08:57:00",
                "status": "OFD",
                "activity": "Out for Delivery Out for delivery: 383439-Nandinayani Reddy Bhaskara Sitics Logistics  (356231) (383439)-PDS22200085719383439-FromMob , MobileNo:- 9963133564",
                "location": "MADANPALLI, Madanapalli, ANDHRA PRADESH",
                "sr-status": "17",
                "sr-status-label": "OUT FOR DELIVERY"
            },
            {
                "date": "2022-07-19 07:33:00",
                "status": "RAD",
                "activity": "Reached at Destination Shipment BagOut From Bag : nxbg03894488",
                "location": "MADANPALLI, Madanapalli, ANDHRA PRADESH",
                "sr-status": "38",
                "sr-status-label": "REACHED AT DESTINATION HUB"
            },
            {
                "date": "2022-07-18 21:02:00",
                "status": "IT",
                "activity": "InTransit Shipment added in Bag nxbg03894488",
                "location": "BLR/FC1, BANGALORE, KARNATAKA",
                "sr-status": "18",
                "sr-status-label": "IN TRANSIT"
            },
            {
                "date": "2022-07-18 20:28:00",
                "status": "PKD",
                "activity": "Picked Shipment InScan from Manifest",
                "location": "BLR/FC1, BANGALORE, KARNATAKA",
                "sr-status": "6",
                "sr-status-label": "SHIPPED"
            },
            {
                "date": "2022-07-18 13:50:00",
                "status": "PUD",
                "activity": "PickDone ",
                "location": "RTO/CHD, BANGALORE, KARNATAKA",
                "sr-status": "42",
                "sr-status-label": "PICKED UP"
            },
            {
                "date": "2022-07-18 10:04:00",
                "status": "OFP",
                "activity": "Out for Pickup ",
                "location": "RTO/CHD, BANGALORE, KARNATAKA",
                "sr-status": "19",
                "sr-status-label": "OUT FOR PICKUP"
            },
            {
                "date": "2022-07-18 09:51:00",
                "status": "DRC",
                "activity": "Pending Manifest Data Received",
                "location": "RTO/CHD, BANGALORE, KARNATAKA",
                "sr-status": "NA",
                "sr-status-label": "NA"
            }
        ],
        "track_url": "https://shiprocket.co//tracking/141123221084922",
        "etd": "2022-07-20 19:28:00",
        "qc_response": {
            "qc_image": "",
            "qc_failed_reason": ""
        }
    }
};

async function testRealShiprocketResponse() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_PATH);
        console.log('Connected to MongoDB');

        // Process the mock response using our new logic
        const trackingInfo = mockShiprocketResponse.tracking_data;
        const activities = trackingInfo.shipment_track_activities || [];
        const shipmentTrack = trackingInfo.shipment_track || [];
        
        console.log('\n=== Processing Real Shiprocket Response ===');
        
        // Process activities into our tracking history format
        const trackingHistory = activities.map(activity => ({
            status: activity['sr-status-label'] || activity.status,
            location: activity.location || 'Unknown',
            timestamp: new Date(activity.date),
            description: activity.activity || activity.status,
            courierStatus: activity.status,
            srStatus: activity['sr-status'],
            srStatusLabel: activity['sr-status-label']
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        console.log('Processed tracking history:');
        trackingHistory.forEach((item, index) => {
            console.log(`${index + 1}. ${item.srStatusLabel} - ${item.location} (${item.timestamp.toLocaleString()})`);
            console.log(`   Description: ${item.description}`);
        });

        // Get shipment details
        const shipmentDetails = shipmentTrack[0] || {};
        const latestActivity = trackingHistory[0];
        
        console.log('\n=== Shipment Details ===');
        console.log('AWB Code:', shipmentDetails.awb_code);
        console.log('Courier Name:', shipmentDetails.courier_name);
        console.log('Current Status:', shipmentDetails.current_status);
        console.log('Destination:', shipmentDetails.destination);
        console.log('Weight:', shipmentDetails.weight);
        console.log('Packages:', shipmentDetails.packages);
        console.log('Pickup Date:', shipmentDetails.pickup_date);
        console.log('Delivered Date:', shipmentDetails.delivered_date);
        
        console.log('\n=== Latest Activity ===');
        console.log('Status:', latestActivity?.srStatusLabel);
        console.log('Location:', latestActivity?.location);
        console.log('Description:', latestActivity?.description);
        
        console.log('\n=== Additional Info ===');
        console.log('Track URL:', trackingInfo.track_url);
        console.log('ETD:', trackingInfo.etd);

        // Update our test order with this data
        const testOrderId = '695cf6f752f925669a3065d5';
        const updateData = {
            trackingHistory: trackingHistory,
            currentLocation: latestActivity?.location || shipmentDetails.destination,
            shiprocketStatus: latestActivity?.srStatusLabel || shipmentDetails.current_status,
            lastTrackingSync: new Date(),
            lastStatusUpdate: new Date(),
            // Update additional tracking info
            trackingUrl: trackingInfo.track_url,
            estimatedDeliveryDate: trackingInfo.etd ? new Date(trackingInfo.etd) : null,
            courierName: shipmentDetails.courier_name,
            awbNumber: shipmentDetails.awb_code,
            trackingNumber: shipmentDetails.awb_code,
            packages: shipmentDetails.packages,
            weight: shipmentDetails.weight,
            status: 'Delivered',
            deliveredAt: new Date(shipmentDetails.delivered_date),
            returnWindowExpiresAt: new Date(new Date(shipmentDetails.delivered_date).getTime() + 7 * 24 * 60 * 60 * 1000)
        };

        await Order.findByIdAndUpdate(testOrderId, updateData);
        console.log('\n✅ Updated test order with real Shiprocket response data');
        
        // Verify the update
        const updatedOrder = await Order.findById(testOrderId);
        console.log('\n=== Updated Order Info ===');
        console.log('Order ID:', updatedOrder.orderId);
        console.log('Status:', updatedOrder.status);
        console.log('Tracking Number:', updatedOrder.trackingNumber);
        console.log('Current Location:', updatedOrder.currentLocation);
        console.log('Courier Name:', updatedOrder.courierName);
        console.log('Tracking History Count:', updatedOrder.trackingHistory?.length || 0);
        console.log('Track URL:', updatedOrder.trackingUrl);
        console.log('Delivered At:', updatedOrder.deliveredAt);

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

testRealShiprocketResponse();