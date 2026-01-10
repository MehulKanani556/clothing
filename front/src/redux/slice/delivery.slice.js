import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import { BASE_URL } from '../../utils/BASE_URL';

const initialState = {
    deliveryFee: 0,
    deliveryInfo: null,
    loading: false,
    error: null,
    serviceable: null
};

// Handle errors
const handleErrors = (error, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

// Round up delivery fee to nearest 5
const roundUpToNearest5 = (value) => {
    if (value === 0) return 0;
    return Math.ceil(value / 5) * 5;
};

// Check Pincode Serviceability
export const checkPincodeServiceability = createAsyncThunk(
    'delivery/checkPincodeServiceability',
    async (pincode, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/shiprocket/check-pincode/${pincode}`);
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const deliverySlice = createSlice({
    name: 'delivery',
    initialState,
    reducers: {
        clearDeliveryInfo: (state) => {
            state.deliveryFee = 0;
            state.deliveryInfo = null;
            state.serviceable = null;
            state.error = null;
        },
        resetDeliveryState: (state) => {
            return initialState;
        }
    },
    extraReducers: (builder) => {
        builder
            // Check Pincode Serviceability
            .addCase(checkPincodeServiceability.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkPincodeServiceability.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.success && action.payload.data.serviceable) {
                    const originalFee = action.payload.data.shippingCharge || 0;
                    state.deliveryFee = roundUpToNearest5(originalFee);
                    state.deliveryInfo = {
                        ...action.payload.data,
                        originalShippingCharge: originalFee,
                        shippingCharge: roundUpToNearest5(originalFee)
                    };
                    state.serviceable = true;
                } else {
                    state.deliveryFee = 0;
                    state.deliveryInfo = null;
                    state.serviceable = false;
                    state.error = action.payload.data?.message || 'Delivery not available to this pincode';
                }
            })
            .addCase(checkPincodeServiceability.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to check delivery serviceability';
                state.deliveryFee = 0;
                state.deliveryInfo = null;
                state.serviceable = false;
            });
    }
});

export const { clearDeliveryInfo, resetDeliveryState } = deliverySlice.actions;
export default deliverySlice.reducer;