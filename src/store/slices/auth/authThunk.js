import { createAsyncThunk } from "@reduxjs/toolkit";
import { buildApiUrl, getAuthHeaders } from "../../../utils/apiConfig";
import { apiRequest } from "../../../utils/interceptor";

// Create a separate thunk that doesn't rely on the other action creators
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log("Making API call to login endpoint");

      const response = await fetch(buildApiUrl("/login"), {
        method: "POST",
        headers: getAuthHeaders(false),
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Login failed");
      }

      // Store both tokens
      if (data.token) localStorage.setItem("authToken", data.token);
      if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);

      return data;
    } catch (error) {
      console.error("Login error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const checkEmailExists = createAsyncThunk(
  "auth/checkEmailExists",
  async (email, { rejectWithValue }) => {
    try {
      const response = await apiRequest(
        `/organizations/check-email?email=${email}`,
        {
          method: "GET",
          includeAuth: false,
        }
      );
      
      return response;
    } catch (error) {
      console.error("Email check error:", error);
      return rejectWithValue(error.message || "Email check failed");
    }
  }
);

export const submitOnboarding = createAsyncThunk(
  "auth/submitOnboarding",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiRequest("/organizations/", {
        method: "POST",
        includeAuth: false,
        body: JSON.stringify(formData),
      });
      
      console.log("Onboarding response:", response);
      
      // Store both tokens
      if (response.token) localStorage.setItem("authToken", response.token);
      if (response.refreshToken) localStorage.setItem("refreshToken", response.refreshToken);
      
      return response;
    } catch (error) {
      console.error("Onboarding error:", error);
      return rejectWithValue({
        message: error.message || "Network error",
        errors: [
          { path: "form", msg: "Network error occurred. Please try again." },
        ],
      });
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      console.log("Making API call to forgot password endpoint");

      const response = await fetch(buildApiUrl("/users/forgot-password"), {
        method: "POST",
        headers: getAuthHeaders(false),
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to send reset link");
      }

      return data;
    } catch (error) {
      console.error("Forgot password error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      console.log("Making API call to reset password endpoint");

      const response = await fetch(
        buildApiUrl(`/users/reset-password?token=${token}`),
        {
          method: "POST",
          headers: getAuthHeaders(false),
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to reset password");
      }

      return data;
    } catch (error) {
      console.error("Reset password error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);
