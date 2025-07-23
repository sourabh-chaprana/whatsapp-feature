import { createSlice } from "@reduxjs/toolkit";
import {
  loginUser,
  checkEmailExists,
  submitOnboarding,
  forgotPassword,
  resetPassword,
} from "./authThunk";

// Check if token exists in localStorage for initial state
const token = localStorage.getItem("authToken");

const initialState = {
  user: null,
  token: token || null,
  loading: false,
  error: null,
  isAuthenticated: !!token, // Set to true if token exists
  emailExists: false,
  emailChecking: false,
  emailCheckError: null,
  onboardingLoading: false,
  onboardingError: null,
  onboardingSuccess: false,
  forgotPasswordLoading: false,
  forgotPasswordError: null,
  forgotPasswordSuccess: false,
  // Add reset password state
  resetPasswordLoading: false,
  resetPasswordError: null,
  resetPasswordSuccess: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      // Remove tokens from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;
    },
    clearEmailCheck: (state) => {
      state.emailExists = false;
      state.emailChecking = false;
      state.emailCheckError = null;
    },
    clearOnboardingStatus: (state) => {
      state.onboardingLoading = false;
      state.onboardingError = null;
      state.onboardingSuccess = false;
    },
    clearForgotPasswordStatus: (state) => {
      state.forgotPasswordLoading = false;
      state.forgotPasswordError = null;
      state.forgotPasswordSuccess = false;
    },
    clearResetPasswordStatus: (state) => {
      state.resetPasswordLoading = false;
      state.resetPasswordError = null;
      state.resetPasswordSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload || "Login failed";
      })

      .addCase(checkEmailExists.pending, (state) => {
        state.emailChecking = true;
        state.emailCheckError = null;
      })
      .addCase(checkEmailExists.fulfilled, (state, action) => {
        state.emailChecking = false;
        state.emailExists = action.payload.exists;
      })
      .addCase(checkEmailExists.rejected, (state, action) => {
        state.emailChecking = false;
        state.emailCheckError = action.payload;
      })

      .addCase(submitOnboarding.pending, (state) => {
        state.onboardingLoading = true;
        state.onboardingError = null;
      })
      .addCase(submitOnboarding.fulfilled, (state, action) => {
        state.onboardingLoading = false;
        state.onboardingSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(submitOnboarding.rejected, (state, action) => {
        state.onboardingLoading = false;
        state.onboardingError = action.payload;
      })

      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordLoading = true;
        state.forgotPasswordError = null;
        state.forgotPasswordSuccess = false;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordSuccess = true;
        state.forgotPasswordError = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordSuccess = false;
        state.forgotPasswordError =
          action.payload || "Failed to send reset link";
      })

      // Add reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordLoading = true;
        state.resetPasswordError = null;
        state.resetPasswordSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordSuccess = true;
        state.resetPasswordError = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordSuccess = false;
        state.resetPasswordError = action.payload || "Failed to reset password";
      });
  },
});

export const {
  logout,
  clearEmailCheck,
  clearOnboardingStatus,
  clearForgotPasswordStatus,
  clearResetPasswordStatus,
} = authSlice.actions;
export default authSlice.reducer;
