import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Helper to get token
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
};

// Async Thunks

// Add Review (User) - Kept it for completeness
export const addReview = createAsyncThunk(
    'review/addReview',
    async (reviewData, { rejectWithValue }) => {
        try {
            const response = await axios.post('http://localhost:5000/api/reviews', reviewData, getAuthHeaders());
            toast.success('Review submitted successfully!');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to submit review';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Admin: Update Review Status
export const updateReviewStatus = createAsyncThunk(
    'review/updateReviewStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/reviews/${id}`, { status }, getAuthHeaders());
            toast.success('Review status updated!');
            return response.data.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update review status';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Admin: Delete Review
export const deleteReview = createAsyncThunk(
    'review/deleteReview',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`http://localhost:5000/api/reviews/${id}`, getAuthHeaders());
            toast.success('Review deleted successfully');
            return id;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete review';
            toast.error(message);
            return rejectWithValue(message);
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
                state.reviews.unshift(action.payload);
            })
            .addCase(addReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Status
            .addCase(updateReviewStatus.fulfilled, (state, action) => {
                const index = state.reviews.findIndex(r => r._id === action.payload._id);
                if (index !== -1) {
                    state.reviews[index] = action.payload;
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
