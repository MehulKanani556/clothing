import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchSettings = createAsyncThunk(
    'settings/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/settings');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateSetting = createAsyncThunk(
    'settings/update',
    async ({ key, value, description }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/settings', { key, value, description });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        settings: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSettings.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload.data;
            })
            .addCase(updateSetting.fulfilled, (state, action) => {
                const index = state.settings.findIndex(s => s.key === action.payload.data.key);
                if (index !== -1) {
                    state.settings[index] = action.payload.data;
                } else {
                    state.settings.push(action.payload.data);
                }
            });
    },
});

export default settingsSlice.reducer;
