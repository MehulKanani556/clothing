import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import { BASE_URL } from '../../utils/BASE_URL';

const initialState = {
    items: [],
    totalPrice: 0,
    loading: false,
    error: null,
    cartId: null
};

// Handle errors
const handleErrors = (error, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

// Add to Cart
export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ productId, quantity, size, color }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/cart`, {
                productId,
                quantity,
                size,
                color
            });
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

// Get Cart
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/cart`);
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

// Remove from Cart
export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async (itemId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`${BASE_URL}/cart/${itemId}`);
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

// Update Cart Item
export const updateCartItem = createAsyncThunk(
    'cart/updateCartItem',
    async ({ itemId, quantity }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`${BASE_URL}/cart/${itemId}`, { quantity });
            return response.data;
        } catch (error) {
            return handleErrors(error, rejectWithValue);
        }
    }
);

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearCartErrors: (state) => {
            state.error = null;
        },
        clearCart: (state) => {
            state.items = [];
            state.totalPrice = 0;
            state.cartId = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Add to Cart
            .addCase(addToCart.pending, (state) => {
                state.loading = true;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.totalPrice = action.payload.totalPrice;
                state.cartId = action.payload._id;
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Fetch Cart
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.totalPrice = action.payload.totalPrice;
                state.cartId = action.payload._id;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Remove from Cart
            .addCase(removeFromCart.pending, (state) => {
                state.loading = true;
            })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.totalPrice = action.payload.totalPrice;
            })
            .addCase(removeFromCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            // Update Cart Item
            .addCase(updateCartItem.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.totalPrice = action.payload.totalPrice;
            })
            .addCase(updateCartItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            });
    }
});

export const { clearCartErrors, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
