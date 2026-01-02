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

const adminOrderSlice = createSlice({
    name: 'adminOrders',
    initialState: {
        orders: [],
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
            });
    },
});

export default adminOrderSlice.reducer;
