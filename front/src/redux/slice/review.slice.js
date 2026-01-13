import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

// Add Review (User)
export const addReview = createAsyncThunk(
    'review/addReview',
    async (reviewData, { rejectWithValue }) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };
            // If reviewData is standard object, axios sends json, if FormData, it handles boundary. 
            // Explicitly setting header is safer if we know it's FormData, but often axios detects it.
            // Let's pass headers just in case if input is FormData.
            const response = await axiosInstance.post('/reviews', reviewData, config);
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

// Admin: Fetch All Reviews
export const fetchAllReviews = createAsyncThunk(
    'review/fetchAllReviews',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/reviews/admin');
            return response.data;
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
                    // Only update the status to preserve populated user/product data
                    state.reviews[index].status = action.payload.data.status;
                }
            })

            // Delete Review
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.reviews = state.reviews.filter(r => r._id !== action.payload);
            })

            // Fetch All Reviews
            .addCase(fetchAllReviews.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload.data;
            })
            .addCase(fetchAllReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearReviewError } = reviewSlice.actions;
export default reviewSlice.reducer;
