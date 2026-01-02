import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchTickets = createAsyncThunk(
    'support/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/support');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateTicket = createAsyncThunk(
    'support/update',
    async ({ id, status, adminResponse }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/support/${id}`, { status, adminResponse });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const supportSlice = createSlice({
    name: 'support',
    initialState: {
        tickets: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTickets.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTickets.fulfilled, (state, action) => {
                state.loading = false;
                state.tickets = action.payload.data;
            })
            .addCase(updateTicket.fulfilled, (state, action) => {
                const index = state.tickets.findIndex(t => t._id === action.payload.data._id);
                if (index !== -1) {
                    state.tickets[index] = action.payload.data;
                }
            });
    },
});

export default supportSlice.reducer;
