import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import { BASE_URL } from '../../utils/BASE_URL';

const initialState = {
    loading: false,
    error: null,
    orderId: null,
    paymentSessionId: null,
    paymentStatus: null
};

export const createPaymentOrder = createAsyncThunk(
    'payment/createOrder',
    async (orderData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/payment/create`, orderData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const createDbOrder = createAsyncThunk(
    'payment/createDbOrder',
    async (orderData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/orders`, orderData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const updateDbOrder = createAsyncThunk(
    'payment/updateDbOrder',
    async ({ orderId, status, paymentStatus, paymentGatewayDetails }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`${BASE_URL}/orders/${orderId}/status`, {
                status,
                paymentStatus,
                paymentGatewayDetails
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const verifyPayment = createAsyncThunk(
    'payment/verifyPayment',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/payment/verify`, { orderId });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const processPaymentOrder = createAsyncThunk(
    'payment/processPaymentOrder',
    async (paymentData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/payment/pay`, paymentData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const processCODPayment = createAsyncThunk(
    'payment/processCODPayment',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/payment/cod`, { orderId });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);



export const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        resetPaymentState: (state) => {
            state.orderId = null;
            state.paymentSessionId = null;
            state.paymentStatus = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createPaymentOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPaymentOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.orderId = action.payload.orderId;
                state.paymentSessionId = action.payload.paymentSessionId;
            })
            .addCase(createPaymentOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            .addCase(verifyPayment.pending, (state) => {
                state.loading = true;
            })
            .addCase(verifyPayment.fulfilled, (state, action) => {
                state.loading = false;
                state.paymentStatus = 'SUCCESS';
            })
            .addCase(verifyPayment.rejected, (state, action) => {
                state.loading = false;
                state.paymentStatus = 'FAILED';
                state.error = action.payload?.message;
            })
            .addCase(processPaymentOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(processPaymentOrder.fulfilled, (state, action) => {
                state.loading = false;
                // You might want to store the result here if needed elsewhere
                // state.processResult = action.payload; 
            })
            .addCase(processPaymentOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            });
    }
});

export const { resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
