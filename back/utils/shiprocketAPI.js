const axios = require('axios');

class ShiprocketAPI {
    constructor() {
        this.baseURL = process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in/v1/external';
        this.email = process.env.SHIPROCKET_EMAIL;
        this.password = process.env.SHIPROCKET_PASSWORD;
        this.token = null;
        this.tokenExpiry = null;
    }

    // Authenticate and get token
    async authenticate() {
        try {
            if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
                return this.token;
            }

            const response = await axios.post(`${this.baseURL}/auth/login`, {
                email: this.email,
                password: this.password
            });

            this.token = response.data.token;
            // Token expires in 10 days, refresh 1 day before
            this.tokenExpiry = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);
            
            return this.token;
        } catch (error) {
            console.error('Shiprocket authentication failed:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with Shiprocket');
        }
    }

    // Get authenticated headers
    async getHeaders() {
        const token = await this.authenticate();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    // Create order in Shiprocket
    async createOrder(orderData) {
        try {
            const headers = await this.getHeaders();
            console.log('Shiprocket API Request:', {
                url: `${this.baseURL}/orders/create/adhoc`,
                headers: { ...headers, 'Authorization': '[HIDDEN]' },
                data: orderData
            });
            
            const response = await axios.post(`${this.baseURL}/orders/create/adhoc`, orderData, { headers });
            console.log('Shiprocket API Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Shiprocket create order failed:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    }

    // Get tracking information
    async getTracking(shipmentId) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${this.baseURL}/courier/track/shipment/${shipmentId}`, { headers });
            return response.data;
        } catch (error) {
            console.error('Shiprocket tracking failed:', error.response?.data || error.message);
            throw error;
        }
    }

    // Get tracking by AWB number
    async getTrackingByAWB(awb) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${this.baseURL}/courier/track/awb/${awb}`, { headers });
            return response.data;
        } catch (error) {
            console.error('Shiprocket AWB tracking failed:', error.response?.data || error.message);
            throw error;
        }
    }

    // Generate shipping label
    async generateLabel(shipmentIds) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.post(`${this.baseURL}/courier/generate/label`, {
                shipment_id: shipmentIds
            }, { headers });
            return response.data;
        } catch (error) {
            console.error('Shiprocket label generation failed:', error.response?.data || error.message);
            throw error;
        }
    }

    // Request pickup
    async requestPickup(shipmentId) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.post(`${this.baseURL}/courier/assign/awb`, {
                shipment_id: shipmentId
            }, { headers });
            return response.data;
        } catch (error) {
            console.error('Shiprocket pickup request failed:', error.response?.data || error.message);
            throw error;
        }
    }

    // Cancel order
    async cancelOrder(orderIds) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.post(`${this.baseURL}/orders/cancel`, {
                ids: orderIds
            }, { headers });
            return response.data;
        } catch (error) {
            console.error('Shiprocket cancel order failed:', error.response?.data || error.message);
            throw error;
        }
    }

    // Get available couriers for pincode
    async getAvailableCouriers(pickupPincode, deliveryPincode, weight, codAmount = 0) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${this.baseURL}/courier/serviceability/`, {
                headers,
                params: {
                    pickup_postcode: pickupPincode,
                    delivery_postcode: deliveryPincode,
                    weight: weight,
                    cod: codAmount > 0 ? 1 : 0
                }
            });
            return response.data;
        } catch (error) {
            console.error('Shiprocket courier check failed:', error.response?.data || error.message);
            throw error;
        }
    }

    // Get pickup locations
    async getPickupLocations() {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${this.baseURL}/settings/company/pickup`, { headers });
            return response.data;
        } catch (error) {
            console.error('Shiprocket get pickup locations failed:', error.response?.data || error.message);
            throw error;
        }
    }

    // Create return order
    async createReturnOrder(returnData) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.post(`${this.baseURL}/orders/create/return`, returnData, { headers });
            return response.data;
        } catch (error) {
            console.error('Shiprocket return order failed:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new ShiprocketAPI();