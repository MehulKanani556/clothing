import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchDashboardStats = createAsyncThunk(
    'adminDashboard/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/reports/gst'); // Using GST report as a proxy for stats for now or distinct endpoint
            // Also fetch payout
            const payoutRes = await axiosInstance.get('/reports/payout');

            return {
                gstStats: response.data,
                payoutStats: payoutRes.data
            };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const adminDashboardSlice = createSlice({
    name: 'adminDashboard',
    initialState: {
        loading: false,
        stats: null,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default adminDashboardSlice.reducer;
