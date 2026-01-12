import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import { BASE_URL } from '../../utils/BASE_URL';

const initialState = {
    heroBanners: [],
    loading: false,
    error: null,
};

// Fetch Hero Banners (Admin)
export const fetchAdminHeroBanners = createAsyncThunk(
    'heroBanner/fetchAdminHeroBanners',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/herobanners/admin`);
            
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

// Fetch Hero Banners (Public)
export const fetchHeroBanners = createAsyncThunk(
    'heroBanner/fetchHeroBanners',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/herobanners`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

// Create Hero Banner
export const createHeroBanner = createAsyncThunk(
    'heroBanner/createHeroBanner',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/herobanners`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

// Update Hero Banner
export const updateHeroBanner = createAsyncThunk(
    'heroBanner/updateHeroBanner',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`${BASE_URL}/herobanners/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

// Delete Hero Banner
export const deleteHeroBanner = createAsyncThunk(
    'heroBanner/deleteHeroBanner',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`${BASE_URL}/herobanners/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const heroBannerSlice = createSlice({
    name: 'heroBanner',
    initialState,
    reducers: {
        clearHeroBannerErrors: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Admin Hero Banners
            .addCase(fetchAdminHeroBanners.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAdminHeroBanners.fulfilled, (state, action) => {
                state.loading = false;
                state.heroBanners = action.payload.data;
            })
            .addCase(fetchAdminHeroBanners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Fetch Public Hero Banners
            .addCase(fetchHeroBanners.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchHeroBanners.fulfilled, (state, action) => {
                state.loading = false;
                state.heroBanners = action.payload.data;
            })
            .addCase(fetchHeroBanners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Create Hero Banner
            .addCase(createHeroBanner.fulfilled, (state, action) => {
                state.heroBanners.unshift(action.payload.data);
            })

            // Update Hero Banner
            .addCase(updateHeroBanner.fulfilled, (state, action) => {
                const index = state.heroBanners.findIndex(b => b._id === action.payload.data._id);
                if (index !== -1) {
                    state.heroBanners[index] = action.payload.data;
                }
            })

            // Delete Hero Banner
            .addCase(deleteHeroBanner.fulfilled, (state, action) => {
                state.heroBanners = state.heroBanners.filter(b => b._id !== action.payload);
            });
    }
});

export const { clearHeroBannerErrors } = heroBannerSlice.actions;
export default heroBannerSlice.reducer;
