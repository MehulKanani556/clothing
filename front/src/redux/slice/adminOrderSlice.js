import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchAdminOrders = createAsyncThunk(
    'adminOrders/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/orders/admin', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchOrderById = createAsyncThunk(
    'adminOrders/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/orders/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    'adminOrders/updateStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/orders/${id}/status`, { status });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }

);

export const approveReturn = createAsyncThunk(
    'adminOrders/approveReturn',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/orders/return/approve`, { orderId });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const rejectReturn = createAsyncThunk(
    'adminOrders/rejectReturn',
    async ({ orderId, reason }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/orders/return/reject`, { orderId, reason });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const adminProcessRefund = createAsyncThunk(
    'adminOrders/processRefund',
    async ({ orderId, amount, note }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/orders/refund/process`, { orderId, amount, note });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const adminOrderSlice = createSlice({
    name: 'adminOrders',
    initialState: {
        orders: [],
        currentOrder: null,
        loading: false,
        error: null,
        total: 0,
        page: 1,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAdminOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.data;
                state.total = action.payload.total;
            })
            .addCase(fetchAdminOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                const index = state.orders.findIndex(o => o._id === action.payload.data._id);
                if (index !== -1) {
                    state.orders[index] = action.payload.data;
                }
                if (state.currentOrder && state.currentOrder._id === action.payload.data._id) {
                    state.currentOrder = action.payload.data;
                }
            })
            .addCase(fetchOrderById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload.data;
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(approveReturn.fulfilled, (state, action) => {
                const index = state.orders.findIndex(o => o.orderId === action.payload.data.orderId);
                if (index !== -1) state.orders[index] = action.payload.data;
                if (state.currentOrder?.orderId === action.payload.data.orderId) state.currentOrder = action.payload.data;
            })
            .addCase(rejectReturn.fulfilled, (state, action) => {
                const index = state.orders.findIndex(o => o.orderId === action.payload.data.orderId);
                if (index !== -1) state.orders[index] = action.payload.data;
                if (state.currentOrder?.orderId === action.payload.data.orderId) state.currentOrder = action.payload.data;
            })
            .addCase(adminProcessRefund.fulfilled, (state, action) => {
                const index = state.orders.findIndex(o => o.orderId === action.payload.data.orderId);
                if (index !== -1) state.orders[index] = action.payload.data;
                if (state.currentOrder?.orderId === action.payload.data.orderId) state.currentOrder = action.payload.data;
            });
    },
});

export default adminOrderSlice.reducer;
