import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { BASE_URL } from '../../utils/BASE_URL';
import axios from 'axios';
import axiosInstance from '../../utils/axiosInstance';


const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    loggedIn: false,
    isLoggedOut: false,
    message: null,
    isLocked: false // New state for lock screen
};
const handleErrors = (error, dispatch, rejectWithValue) => {

    const errorMessage = error.response?.data?.message || 'An error occurred';
    return rejectWithValue(error.response?.data || { message: errorMessage });
};
export const login = createAsyncThunk(
    'auth/login',
    async (data, { rejectWithValue }) => {
        try {
            try {
                const response = await axiosInstance.post(`${BASE_URL}/login`, data,);
                sessionStorage.setItem('token', response.data.token);
                sessionStorage.setItem('userId', response.data.user._id);
                console.log(response.data)
                return response.data;
            } catch (error) {
                return handleErrors(error, null, rejectWithValue);
            }
        } catch (error) {

        }
    }
)
export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/register`, userData);
            // Don't set token here as it's just OTP step
            return response.data;
        } catch (error) {
            return handleErrors(error, null, rejectWithValue);
        }
    }
);

export const verifyRegistration = createAsyncThunk(
    'auth/verifyRegistration',
    async ({ email, otp }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/verify-registration`, { email, otp });
            sessionStorage.setItem('token', response.data.accessToken); // Or token depending on backend
            // Check auth.js response: sends accessToken, refreshToken
            sessionStorage.setItem('userId', response.data.user._id);
            return response.data;
        } catch (error) {
            return handleErrors(error, null, rejectWithValue);
        }
    }
);

export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (email, { rejectWithValue }) => {
        try {
            console.log(email);
            const response = await axios.post(`${BASE_URL}/forgot-password`, { email });
            if (response.status === 200) {
                return response.data; // Assuming the API returns a success message
            }
        } catch (error) {
            return handleErrors(error, null, rejectWithValue);
        }
    }
);

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async ({ email, otp }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/verify`, { email, otp });
            if (response.status === 200) {
                return response.data; // Assuming the API returns a success message
            }
        } catch (error) {
            return handleErrors(error, null, rejectWithValue);
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ email, newPassword }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/change-password`, { email, newPassword });
            if (response.status === 200) {
                return response.data; // Assuming the API returns a success message
            }
        } catch (error) {
            return handleErrors(error, null, rejectWithValue);
        }
    }
);

export const changeUserPassword = createAsyncThunk(
    'auth/changeUserPassword',
    async ({ email, oldPassword, newPassword }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/change-password`, {
                email,
                oldPassword,
                newPassword
            });
            if (response.status === 200) {
                return response.data;
            }
        } catch (error) {
            return handleErrors(error, null, rejectWithValue);
        }
    }
);

// Update User Profile
export const updateUserProfile = createAsyncThunk(
    'auth/updateUserProfile',
    async (formData, { rejectWithValue }) => {
        try {
            // Content-Type multipart/form-data is handled automatically by axios when data is FormData
            // We need to know the endpoint.
            // If the route is /users/update-profile or similar.
            // I'll check indexRoutes first.
            const response = await axiosInstance.put(`${BASE_URL}/users/profile`, formData);
            return response.data;
        } catch (error) {
            return handleErrors(error, null, rejectWithValue);
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/logout`);
            console.log(window);
            console.log(window.persistor);
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('userId');

            window.persistor.purge();
            clearAuthState();
            return response.data;
        } catch (error) {
            clearAuthState();
            return handleErrors(error, null, rejectWithValue);
        }
    }
);

// Delete Account
export const deleteMyAccount = createAsyncThunk(
    'auth/deleteMyAccount',
    async (userId, { rejectWithValue }) => {
        try {
            // The route is /users/:id but the controller uses req.user.id for self-deletion
            // We pass userId in URL just to suffice the route param requirement
            const response = await axiosInstance.delete(`${BASE_URL}/users/${userId}`);
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('userId');
            return response.data;
        } catch (error) {
            return handleErrors(error, null, rejectWithValue);
        }
    }
);

// Alias for compatibility if needed elsewhere

export const addAddress = createAsyncThunk(
    'auth/addAddress',
    async (addressData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`${BASE_URL}/users/address`, addressData);
            return response.data;
        } catch (error) {
            return handleErrors(error, null, rejectWithValue);
        }
    }
);

export const deleteAddress = createAsyncThunk(
    'auth/deleteAddress',
    async (addressId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`${BASE_URL}/users/address/${addressId}`);
            return response.data;
        } catch (error) {
            return handleErrors(error, null, rejectWithValue);
        }
    }
);

export const setDefaultAddress = createAsyncThunk(
    'auth/setDefaultAddress',
    async (addressId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`${BASE_URL}/users/address/${addressId}/default`);
            return response.data;
        } catch (error) {
            return handleErrors(error, null, rejectWithValue);
        }
    }
);

export const logoutUser = logout;

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Reducer-only action if we want to force clear without API
        clearAuthState: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            state.message = "Logged out successfully";
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('userId');
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
        },
        clearMessage: (state) => {
            state.message = null;
            state.error = null;
        },
        lockSession: (state) => {
            state.isLocked = true;
        },
        unlockSession: (state) => {
            state.isLocked = false;
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(logout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = null;
                state.message = "Logged out successfully";
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('userId');
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
            })
            .addCase(logout.rejected, (state) => {
                // Even if logout API fails, clear the state locally
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.message = "Logout Failed";
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('userId');
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
            })
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.user = action.payload?.user || null;
                state.isAuthenticated = true;
                state.loading = false;
                state.error = null;
                state.message = action.payload?.message || "Login successfully";
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload?.message || "Login Failed";
                state.message = action.payload?.message || "Login Failed";
            })
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                // state.user = action.payload?.user || null; // Not authenticated yet
                // state.isAuthenticated = true;              // Not authenticated yet
                state.loading = false;
                state.error = null;
                state.message = action.payload?.message || "Verification code sent to email.";
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload?.message || "Registration Failed";
                state.message = action.payload?.message || "Registration Failed";
            })
            .addCase(verifyRegistration.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(verifyRegistration.fulfilled, (state, action) => {
                state.user = action.payload?.user || null;
                state.isAuthenticated = true;
                state.loading = false;
                state.error = null;
                state.message = action.payload?.message || "Account created successfully";
            })
            .addCase(verifyRegistration.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload?.message || "Verification Failed";
                state.message = action.payload?.message || "Verification Failed";
            })
            .addCase(forgotPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.message = action.payload?.message || action.payload?.message || "Email Sent Successfully...";
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Forgot Password Failed";
                state.message = action.payload?.message || "Forgot Password Failed";
            })
            .addCase(verifyOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.message = action.payload?.message || "Otp Verify SuccessFully...";
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Verify OTP Failed";
                state.message = action.payload?.message || "Verify OTP Failed";
            })
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.message = action.payload?.message || "Password Changed SuccessFully...";
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Reset Password Failed";
                state.message = action.payload?.message || "Reset Password Failed";
            })

            .addCase(changeUserPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(changeUserPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.message = action.payload?.message || "Password Changed Successfully";
            })
            .addCase(changeUserPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to change password";
                state.message = action.payload?.message || "Failed to change password";
            })

            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.user = action.payload.user;
                state.message = "Profile Updated Successfully";
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Profile Update Failed";
            })

            .addCase(deleteMyAccount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteMyAccount.fulfilled, (state, action) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.message = "Account Deleted Successfully";
            })
            .addCase(deleteMyAccount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Delete Account Failed";
            })
            .addCase(addAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.message = "Address Added Successfully";
            })
            .addCase(addAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to add address";
            })
            .addCase(deleteAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.message = "Address Deleted Successfully";
            })
            .addCase(deleteAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to delete address";
            })
            .addCase(setDefaultAddress.pending, (state) => {
                state.loading = true;
            })
            .addCase(setDefaultAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.message = "Default address updated";
            })
            .addCase(setDefaultAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to update default address";
            });
    }

});

export const { clearAuthState, clearMessage, lockSession, unlockSession } = authSlice.actions;
export default authSlice.reducer;
