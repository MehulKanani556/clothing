import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchOffers = createAsyncThunk(
    'offers/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/offers');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createOffer = createAsyncThunk(
    'offers/create',
    async (offerData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/offers', offerData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const offerSlice = createSlice({
    name: 'offers',
    initialState: {
        offers: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOffers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOffers.fulfilled, (state, action) => {
                state.loading = false;
                state.offers = action.payload.data;
            })
            .addCase(fetchOffers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createOffer.fulfilled, (state, action) => {
                state.offers.push(action.payload.data);
            });
    },
});

export default offerSlice.reducer;
