import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { BASE_URL } from '../../utils/BASE_URL';
import axios from 'axios';

const initialState = {
    categories: [],
    subCategories: [],
    categoryDetails: null, // For single category view
    categoryProducts: [], // For products in single category view
    loading: false,
    error: null
};

// Fetch Category By ID
export const fetchCategoryById = createAsyncThunk(
    'category/fetchCategoryById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/categories/${id}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred';
            return rejectWithValue(error.response?.data || { message: errorMessage });
        }
    }
);

// ... (create, update, delete thunks) ...

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

// Fetch All admin Categories
export const fetchAdminCategories = createAsyncThunk(
    'category/fetchAdminCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/admincategories`);
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

// Fetch Admin SubCategories
export const fetchAdminSubCategories = createAsyncThunk(
    'category/fetchAdminSubCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/adminsubcategories`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred';
            return rejectWithValue(error.response?.data || { message: errorMessage });
        }
    }
);

// Create SubCategory
export const createSubCategory = createAsyncThunk(
    'category/createSubCategory',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/subcategories`, data);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred';
            return rejectWithValue(error.response?.data || { message: errorMessage });
        }
    }
);

// Update SubCategory
export const updateSubCategory = createAsyncThunk(
    'category/updateSubCategory',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${BASE_URL}/subcategories/${id}`, data);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred';
            return rejectWithValue(error.response?.data || { message: errorMessage });
        }
    }
);

// Delete SubCategory (Soft Delete)
export const deleteSubCategory = createAsyncThunk(
    'category/deleteSubCategory',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`${BASE_URL}/subcategories/${id}`);
            return { id };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred';
            return rejectWithValue(error.response?.data || { message: errorMessage });
        }
    }
);

// Create Category
export const createCategory = createAsyncThunk(
    'category/createCategory',
    async (categoryData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/categories`, categoryData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred';
            return rejectWithValue(error.response?.data || { message: errorMessage });
        }
    }
);

// Update Category
export const updateCategory = createAsyncThunk(
    'category/updateCategory',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${BASE_URL}/categories/${id}`, data);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'An error occurred';
            return rejectWithValue(error.response?.data || { message: errorMessage });
        }
    }
);

// Delete Category
export const deleteCategory = createAsyncThunk(
    'category/deleteCategory',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`${BASE_URL}/categories/${id}`);
            return id;
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

            // fetch Admin Categories
            .addCase(fetchAdminCategories.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAdminCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload.data;
            })
            .addCase(fetchAdminCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Fetch Category By ID
            .addCase(fetchCategoryById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategoryById.fulfilled, (state, action) => {
                state.loading = false;
                state.categoryDetails = action.payload.data.category;
                state.categoryProducts = action.payload.data.products;
            })
            .addCase(fetchCategoryById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Create Category
            .addCase(createCategory.fulfilled, (state, action) => {
                state.categories.push(action.payload.data);
                state.loading = false;
            })
            .addCase(createCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Update Category
            .addCase(updateCategory.fulfilled, (state, action) => {
                const index = state.categories.findIndex(c => c._id === action.payload.data._id);
                if (index !== -1) {
                    state.categories[index] = action.payload.data;
                }
                state.loading = false;
            })
            .addCase(updateCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Delete Category
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.categories = state.categories.filter(c => c._id !== action.payload);
                state.loading = false;
            })
            .addCase(deleteCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteCategory.rejected, (state, action) => {
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
                state.subCategories = action.payload.data;
            })

            // Admin SubCategories
            .addCase(fetchAdminSubCategories.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAdminSubCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.subCategories = action.payload.data;
            })
            .addCase(fetchAdminSubCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Create SubCategory
            .addCase(createSubCategory.fulfilled, (state, action) => {
                state.subCategories.push(action.payload.data);
                state.loading = false;
            })
            .addCase(createSubCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(createSubCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Update SubCategory
            .addCase(updateSubCategory.fulfilled, (state, action) => {
                const index = state.subCategories.findIndex(c => c._id === action.payload.data._id);
                if (index !== -1) {
                    state.subCategories[index] = action.payload.data;
                }
                state.loading = false;
            })
            .addCase(updateSubCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateSubCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Delete SubCategory
            .addCase(deleteSubCategory.fulfilled, (state, action) => {
                // Soft delete often returns the object, but if it returns ID or we filter by visual state:
                // If we are in admin view showing all, we might want to update the status instead of removing.
                // Assuming standard removal from list for now or mapped update.
                const index = state.subCategories.findIndex(c => c._id === action.payload.id); // Assuming payload has id, or logic below
                if (index !== -1) {
                    // Update local state to reflect soft delete (set deletedAt) if we want to keep showing it
                    // Or remove it if we want to hide it
                    state.subCategories[index] = { ...state.subCategories[index], deletedAt: new Date().toISOString(), isActive: false };
                }
                state.loading = false;
            })
            .addCase(deleteSubCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteSubCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            });
    }
});

export const { clearCategoryErrors } = categorySlice.actions;
export default categorySlice.reducer;
