import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchGstReport = createAsyncThunk(
    'reports/fetchGst',
    async (filters, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/reports/gst', { params: filters });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchNetPayout = createAsyncThunk(
    'reports/fetchPayout',
    async (filters, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/reports/payout', { params: filters });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const reportSlice = createSlice({
    name: 'reports',
    initialState: {
        gstReport: null,
        payoutReport: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchGstReport.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchGstReport.fulfilled, (state, action) => {
                state.loading = false;
                state.gstReport = action.payload;
            })
            .addCase(fetchGstReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchNetPayout.fulfilled, (state, action) => {
                state.payoutReport = action.payload;
            });
    },
});

export default reportSlice.reducer;
