import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { BASE_URL } from '../../utils/BASE_URL';
import axios from 'axios';

const initialState = {
    products: [], // General products list (e.g. for Category Page)
    newArrivals: [],
    bestSellers: [],
    product: null,
    relatedProducts: [],
    loading: false,
    error: null,
    totalPages: 0,
    currentPage: 1,
    bestSellers: [],
    mostPopular: [],
    totalProducts: 0,
    categoryDetails: null // For category specific details (banner, breadcrumbs)
};

const handleErrors = (error, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

// Fetch All Products (General)
export const fetchProducts = createAsyncThunk(
    'product/fetchProducts',
    async (params, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/products`, { params });
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

// Fetch New Arrivals
export const fetchNewArrivals = createAsyncThunk(
    'product/fetchNewArrivals',
    async (_, { rejectWithValue }) => {
        try {
            // Assuming backend supports sort=newest or featured=new-arrivals
            // const response = await axios.get(`${BASE_URL}/products?sort=newest&limit=8`);
            // Fetch from new dedicated API endpoint
            const response = await axios.get(`${BASE_URL}/products/new-arrivals`);
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

// Fetch Best Sellers
export const fetchBestSellers = createAsyncThunk(
    'product/fetchBestSellers',
    async (_, { rejectWithValue }) => {
        try {
            // Assuming backend supports featured=best-sellers
            // const response = await axios.get(`${BASE_URL}/products?featured=best-sellers&limit=8`);
            const response = await axios.get(`${BASE_URL}/products`);
            // console.log("response", response.data);
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

// Fetch Most Popular
export const fetchMostPopular = createAsyncThunk(
    'product/fetchMostPopular',
    async ({ limit } = { limit: 12 }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/products/most-popular`, { params: { limit } });
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const fetchProductById = createAsyncThunk(
    'product/fetchProductById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/products/${id}`);
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const fetchRelatedProducts = createAsyncThunk(
    'product/fetchRelatedProducts',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/products/${id}/related`);
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }

);

export const fetchProductsBySlug = createAsyncThunk(
    'product/fetchProductsBySlug',
    async ({ slug, params }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/products/listing/${slug}`, { params });
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const fetchProductBySlug = createAsyncThunk(
    'product/fetchProductBySlug',
    async (slug, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/products/details/${slug}`);
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        clearProductErrors: (state) => {
            state.error = null;
        },
        clearSingleProduct: (state) => {
            state.product = null;
        },
        updateProductReview: (state, action) => {
            if (state.product && state.product.reviews) {
                const index = state.product.reviews.findIndex(r => r._id === action.payload._id);
                if (index !== -1) {
                    state.product.reviews[index] = action.payload;
                }
            }
        },
        removeProductReview: (state, action) => {
            if (state.product && state.product.reviews) {
                state.product.reviews = state.product.reviews.filter(r => r._id !== action.payload);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Products
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.data;
                state.totalPages = action.payload.pages;
                state.currentPage = action.payload.page;
                state.totalProducts = action.payload.total;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // New Arrivals
            .addCase(fetchNewArrivals.fulfilled, (state, action) => {
                // console.log("newArrivals action.payload.data", action.payload.data);
                state.newArrivals = action.payload.data;
            })

            // Best Sellers
            .addCase(fetchBestSellers.fulfilled, (state, action) => {
                // console.log("action.payload.data", action.payload.data);
                state.bestSellers = action.payload.data;
            })

            // Single Product
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading = false;
                state.product = action.payload.data;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Related
            .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
                state.relatedProducts = action.payload.data;
            })

            // Slug based fetching
            .addCase(fetchProductsBySlug.pending, (state) => {
                state.loading = true;
                state.categoryDetails = null;
            })
            .addCase(fetchProductsBySlug.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.data;
                state.totalPages = action.payload.pages;
                state.currentPage = action.payload.page;
                state.totalProducts = action.payload.total;
                state.categoryDetails = action.payload.categoryDetails;
            })
            .addCase(fetchProductsBySlug.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            .addCase(fetchProductBySlug.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProductBySlug.fulfilled, (state, action) => {
                state.loading = false;
                state.product = action.payload.data;
            })
            .addCase(fetchProductBySlug.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            // Most Popular
            .addCase(fetchMostPopular.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMostPopular.fulfilled, (state, action) => {
                state.loading = false;
                state.mostPopular = action.payload.data;
            })
            .addCase(fetchMostPopular.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearProductErrors, clearSingleProduct, updateProductReview, removeProductReview } = productSlice.actions;
export default productSlice.reducer;
