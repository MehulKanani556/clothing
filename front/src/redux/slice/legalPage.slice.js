import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
    currentLegalPage: null, // Unified state for the currently viewed page
    loading: false,
    error: null,
    success: false,
    message: ""
};

const handleErrors = (error, dispatch, rejectWithValue) => {
    const errorMessage = error.response?.data?.message || "An error occurred";
    return rejectWithValue(error.response?.data || { message: errorMessage });
};

export const getLegalPage = createAsyncThunk(
    "legalPage/getLegalPage",
    async (slug, { dispatch, rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/legal-page/${slug}`);
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const upsertLegalPage = createAsyncThunk(
    "legalPage/upsertLegalPage",
    async ({ slug, title, content, structure }, { dispatch, rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/legal-page/${slug}`, { title, content, structure });
            toast.success(response.data.message || "Legal Page Updated Successfully");
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred");
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

export const softDeleteLegalPage = createAsyncThunk(
    "legalPage/softDeleteLegalPage",
    async ({ slug, id }, { dispatch, rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/legal-page/${slug}/${id}`);
            return response.data;
        } catch (error) {
            return handleErrors(error, dispatch, rejectWithValue);
        }
    }
);

const legalPageSlice = createSlice({
    name: "legalPage",
    initialState,
    reducers: {
        clearLegalPageState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
            state.message = "";
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getLegalPage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getLegalPage.fulfilled, (state, action) => {
                state.loading = false;
                state.currentLegalPage = action.payload.data || { title: '', content: '' };
            })
            .addCase(getLegalPage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            .addCase(upsertLegalPage.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(upsertLegalPage.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload.message;
                state.currentLegalPage = action.payload.data;
            })
            .addCase(upsertLegalPage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
                state.success = false;
            })
            .addCase(softDeleteLegalPage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(softDeleteLegalPage.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload.message;
                // Optionally clear current page if deleted
                if (state.currentLegalPage?._id === action.meta.arg.id) {
                    state.currentLegalPage = null;
                }
            })
            .addCase(softDeleteLegalPage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            });
    },
});

export const { clearLegalPageState } = legalPageSlice.actions;
export default legalPageSlice.reducer;
