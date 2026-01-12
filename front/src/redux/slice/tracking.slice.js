import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

// Fetch tracking information
export const fetchTrackingInfo = createAsyncThunk(
    'tracking/fetchInfo',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/shiprocket/orders/${orderId}/tracking/detailed`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Create Shiprocket order (Admin)
export const createShiprocketOrder = createAsyncThunk(
    'tracking/createOrder',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/shiprocket/orders/${orderId}/create`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Generate shipping label (Admin)
export const generateShippingLabel = createAsyncThunk(
    'tracking/generateLabel',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/shiprocket/orders/${orderId}/label`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Request pickup (Admin)
export const requestPickup = createAsyncThunk(
    'tracking/requestPickup',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/shiprocket/orders/${orderId}/pickup`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Get available couriers
export const getAvailableCouriers = createAsyncThunk(
    'tracking/getCouriers',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/shiprocket/orders/${orderId}/couriers`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Sync tracking data (Admin)
export const syncTrackingData = createAsyncThunk(
    'tracking/syncData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/shiprocket/sync-all');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const trackingSlice = createSlice({
    name: 'tracking',
    initialState: {
        trackingData: null,
        couriers: [],
        loading: false,
        error: null,
        syncStatus: null
    },
    reducers: {
        clearTrackingData: (state) => {
            state.trackingData = null;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch tracking info
            .addCase(fetchTrackingInfo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTrackingInfo.fulfilled, (state, action) => {
                state.loading = false;
                state.trackingData = action.payload.data;
            })
            .addCase(fetchTrackingInfo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch tracking info';
            })
            
            // Create Shiprocket order
            .addCase(createShiprocketOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createShiprocketOrder.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(createShiprocketOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to create Shiprocket order';
            })
            
            // Generate shipping label
            .addCase(generateShippingLabel.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(generateShippingLabel.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(generateShippingLabel.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to generate shipping label';
            })
            
            // Request pickup
            .addCase(requestPickup.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(requestPickup.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(requestPickup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to request pickup';
            })
            
            // Get available couriers
            .addCase(getAvailableCouriers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAvailableCouriers.fulfilled, (state, action) => {
                state.loading = false;
                state.couriers = action.payload.data?.available_courier_companies || [];
            })
            .addCase(getAvailableCouriers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to get couriers';
            })
            
            // Sync tracking data
            .addCase(syncTrackingData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(syncTrackingData.fulfilled, (state, action) => {
                state.loading = false;
                state.syncStatus = action.payload.data;
            })
            .addCase(syncTrackingData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to sync tracking data';
            });
    }
});

export const { clearTrackingData, clearError } = trackingSlice.actions;
export default trackingSlice.reducer;