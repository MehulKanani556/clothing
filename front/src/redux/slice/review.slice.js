import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

// Add Review (User)
export const addReview = createAsyncThunk(
    'review/addReview',
    async (reviewData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/reviews', reviewData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Admin: Update Review Status
export const updateReviewStatus = createAsyncThunk(
    'review/updateReviewStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/reviews/${id}`, { status });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Admin: Delete Review
export const deleteReview = createAsyncThunk(
    'review/deleteReview',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/reviews/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Slice
const reviewSlice = createSlice({
    name: 'review',
    initialState: {
        reviews: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearReviewError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Add Review
            .addCase(addReview.pending, (state) => {
                state.loading = true;
            })
            .addCase(addReview.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.data) {
                    state.reviews.unshift(action.payload.data);
                }
            })
            .addCase(addReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Status
            .addCase(updateReviewStatus.fulfilled, (state, action) => {
                const index = state.reviews.findIndex(r => r._id === action.payload.data._id);
                if (index !== -1) {
                    state.reviews[index] = action.payload.data;
                }
            })

            // Delete Review
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.reviews = state.reviews.filter(r => r._id !== action.payload);
            });
    }
});

export const { clearReviewError } = reviewSlice.actions;
export default reviewSlice.reducer;
