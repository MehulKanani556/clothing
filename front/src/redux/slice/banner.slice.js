import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import { BASE_URL } from '../../utils/BASE_URL';
import toast from 'react-hot-toast';

const initialState = {
    banners: [],
    loading: false,
    error: null,
};

// Fetch Banners (Admin)
export const fetchAdminBanners = createAsyncThunk(
    'banner/fetchAdminBanners',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/banners/admin`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

// Fetch Banners (Public)
export const fetchBanners = createAsyncThunk(
    'banner/fetchBanners',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/banners`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

// Create Banner
export const createBanner = createAsyncThunk(
    'banner/createBanner',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/banners`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Banner created successfully');
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create banner');
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

// Update Banner
export const updateBanner = createAsyncThunk(
    'banner/updateBanner',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`${BASE_URL}/banners/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Banner updated successfully');
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update banner');
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

// Delete Banner
export const deleteBanner = createAsyncThunk(
    'banner/deleteBanner',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`${BASE_URL}/banners/${id}`);
            toast.success('Banner deleted successfully');
            return id;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete banner');
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

// Toggle Banner Status
export const toggleBannerStatus = createAsyncThunk(
    'banner/toggleStatus',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`${BASE_URL}/banners/${id}/status`);
            toast.success('Banner status updated');
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const bannerSlice = createSlice({
    name: 'banner',
    initialState,
    reducers: {
        clearBannerErrors: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Admin Banners
            .addCase(fetchAdminBanners.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAdminBanners.fulfilled, (state, action) => {
                state.loading = false;
                state.banners = action.payload.data;
            })
            .addCase(fetchAdminBanners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Fetch Public Banners
            .addCase(fetchBanners.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchBanners.fulfilled, (state, action) => {
                state.loading = false;
                state.banners = action.payload.data;
            })
            .addCase(fetchBanners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Create Banner
            .addCase(createBanner.fulfilled, (state, action) => {
                state.banners.unshift(action.payload.data);
            })

            // Update Banner & Toggle Status
            .addCase(updateBanner.fulfilled, (state, action) => {
                const index = state.banners.findIndex(b => b._id === action.payload.data._id);
                if (index !== -1) {
                    state.banners[index] = action.payload.data;
                }
            })
            .addCase(toggleBannerStatus.fulfilled, (state, action) => {
                const index = state.banners.findIndex(b => b._id === action.payload.data._id);
                if (index !== -1) {
                    state.banners[index] = action.payload.data;
                }
            })

            // Delete Banner
            .addCase(deleteBanner.fulfilled, (state, action) => {
                state.banners = state.banners.filter(b => b._id !== action.payload);
            });
    }
});

export const { clearBannerErrors } = bannerSlice.actions;
export default bannerSlice.reducer;
