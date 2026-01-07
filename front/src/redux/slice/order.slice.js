import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';
import { BASE_URL } from '../../utils/BASE_URL';

const initialState = {
    orders: [],
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



// Get all orders of users
export const fetchUserOrders = createAsyncThunk(
    'order/fetchUserOrders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/orders/my-orders`);
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

export const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
       
    },
    extraReducers: (builder) => {
        builder
            //fetch users all order
            .addCase(fetchUserOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.data;
            })
            .addCase(fetchUserOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

           
    }
});

export const {  } = orderSlice.actions;
export default orderSlice.reducer;
