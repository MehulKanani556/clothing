import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { BASE_URL } from '../../utils/BASE_URL';
import axios from 'axios';

const initialState = {
    categories: [],
    subCategories: [],
    loading: false,
    error: null
};

// Fetch All Categories
export const fetchCategories = createAsyncThunk(
    'category/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/categories`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred';
            return rejectWithValue(error.response?.data || { message: errorMessage });
        }
    }
);

// Fetch All SubCategories
export const fetchSubCategories = createAsyncThunk(
    'category/fetchSubCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/subcategories`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred';
            return rejectWithValue(error.response?.data || { message: errorMessage });
        }
    }
);

// Fetch SubCategories By Category ID
export const fetchSubCategoriesByCategoryId = createAsyncThunk(
    'category/fetchSubCategoriesById',
    async (categoryId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/subcategories/${categoryId}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred';
            return rejectWithValue(error.response?.data || { message: errorMessage });
        }
    }
);

export const categorySlice = createSlice({
    name: 'category',
    initialState,
    reducers: {
        clearCategoryErrors: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Categories
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload.data;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // SubCategories
            .addCase(fetchSubCategories.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSubCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.subCategories = action.payload.data;
            })
            .addCase(fetchSubCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // SubCategories by ID (replacing list or handling separate state? - keeping simple for now)
            .addCase(fetchSubCategoriesByCategoryId.fulfilled, (state, action) => {
                state.subCategories = action.payload.data; // Note: this overwrites generalized subcategories list, which matches usual expected behavior for a filtered view
            });
    }
});

export const { clearCategoryErrors } = categorySlice.actions;
export default categorySlice.reducer;
