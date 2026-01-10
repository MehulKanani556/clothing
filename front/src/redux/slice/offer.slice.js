import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import { BASE_URL } from '../../utils/BASE_URL';

const initialState = {
    offers: [],
    loading: false,
    error: null,
    appliedCoupon: null, // { code, discount }
    validationLoading: false,
    validationError: null
};

// Fetch all offers
export const fetchOffers = createAsyncThunk(
    'offer/fetchOffers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/offers`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

// Validate Coupon
export const validateCoupon = createAsyncThunk(
    'offer/validateCoupon',
    async ({ code, cartValue }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/offers/validate`, { code, cartValue });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

// Create Offer (Admin)
export const createOffer = createAsyncThunk(
    'offer/createOffer',
    async (offerData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/offers`, offerData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

// Update Offer (Admin)
export const updateOffer = createAsyncThunk(
    'offer/updateOffer',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`${BASE_URL}/offers/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

// Delete Offer (Admin)
export const deleteOffer = createAsyncThunk(
    'offer/deleteOffer',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`${BASE_URL}/offers/${id}`);
            return { id, ...response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const offerSlice = createSlice({
    name: 'offer',
    initialState,
    reducers: {
        removeCoupon: (state) => {
            state.appliedCoupon = null;
            state.validationError = null;
        },
        clearOfferErrors: (state) => {
            state.error = null;
            state.validationError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Offers
            .addCase(fetchOffers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOffers.fulfilled, (state, action) => {
                state.loading = false;
                state.offers = action.payload.data;
            })
            .addCase(fetchOffers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Create Offer
            .addCase(createOffer.pending, (state) => {
                state.loading = true;
            })
            .addCase(createOffer.fulfilled, (state, action) => {
                state.loading = false;
                state.offers.push(action.payload.data);
            })
            .addCase(createOffer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Update Offer
            .addCase(updateOffer.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateOffer.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.offers.findIndex(offer => offer._id === action.payload.data._id);
                if (index !== -1) {
                    state.offers[index] = action.payload.data;
                }
            })
            .addCase(updateOffer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Delete Offer
            .addCase(deleteOffer.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteOffer.fulfilled, (state, action) => {
                state.loading = false;
                state.offers = state.offers.filter(offer => offer._id !== action.payload.id);
            })
            .addCase(deleteOffer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Validate Coupon
            .addCase(validateCoupon.pending, (state) => {
                state.validationLoading = true;
                state.validationError = null;
            })
            .addCase(validateCoupon.fulfilled, (state, action) => {
                state.validationLoading = false;
                // action.payload = { success: true, discount, offerCode }
                state.appliedCoupon = {
                    code: action.payload.offerCode,
                    discount: action.payload.discount
                };
            })
            .addCase(validateCoupon.rejected, (state, action) => {
                state.validationLoading = false;
                state.validationError = action.payload?.message;
                state.appliedCoupon = null;
            })
    }
});

export const { removeCoupon, clearOfferErrors } = offerSlice.actions;
export default offerSlice.reducer;
