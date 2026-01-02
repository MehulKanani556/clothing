import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchReturns = createAsyncThunk(
    'returns/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/returns/admin');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateReturnStatus = createAsyncThunk(
    'returns/updateStatus',
    async ({ id, status, adminComments }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/returns/${id}`, { status, adminComments });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const returnSlice = createSlice({
    name: 'returns',
    initialState: {
        returns: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchReturns.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchReturns.fulfilled, (state, action) => {
                state.loading = false;
                state.returns = action.payload.data;
            })
            .addCase(fetchReturns.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateReturnStatus.fulfilled, (state, action) => {
                const index = state.returns.findIndex(r => r._id === action.payload.data._id);
                if (index !== -1) {
                    state.returns[index] = action.payload.data;
                }
            });
    },
});

export default returnSlice.reducer;
