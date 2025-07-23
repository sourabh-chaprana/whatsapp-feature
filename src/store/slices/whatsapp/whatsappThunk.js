import { createAsyncThunk } from "@reduxjs/toolkit";
import { buildApiUrl, getAuthHeaders } from "../../../utils/apiConfig";
import { apiRequest } from "../../../utils/interceptor";

// Get permanent token from Facebook code
export const getPermanentToken = createAsyncThunk(
  "whatsapp/getPermanentToken",
  async (code, { rejectWithValue }) => {
    try {
      const response = await apiRequest(
        ("/whatsapp/get-permanent-token"),
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ code }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Failed to get permanent token"
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get permanent token error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Update WABA token details
export const updateWabaTokenDetails = createAsyncThunk(
  "whatsapp/updateWabaTokenDetails",
  async (accessToken, { rejectWithValue }) => {
    try {
      const response = await apiRequest(("/whatsapp/update-token"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ accessToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Failed to update token details"
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Update WABA token error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Update WABA business details
export const updateWabaBusinessDetails = createAsyncThunk(
  "whatsapp/updateWabaBusinessDetails",
  async (
    { businessAccountId, phoneNumberId, wabaId, businessProfile },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiRequest(("/whatsapp/update-business"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          businessAccountId,
          phoneNumberId,
          wabaId,
          businessProfile,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Failed to update business details"
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Update WABA business details error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Submit business verification form
export const submitBusinessVerification = createAsyncThunk(
  "whatsapp/submitBusinessVerification",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiRequest(("/whatsapp/verify-business"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Failed to submit verification"
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Submit business verification error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Fetch WhatsApp Business Account Details
export const fetchBusinessDetails = createAsyncThunk(
  "whatsapp/fetchBusinessDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest(("/whatsapp/business-details"), {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Failed to fetch business details"
        );
      }

      const data = await response.json();
      return data.data; // Return the business details data
    } catch (error) {
      console.error("Fetch business details error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Fetch Phone Number Status
export const fetchPhoneNumberStatus = createAsyncThunk(
  "whatsapp/fetchPhoneNumberStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest(("/whatsapp/phone-status"), {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Failed to fetch phone number status"
        );
      }

      const data = await response.json();
      return data.data; // Return the phone numbers array
    } catch (error) {
      console.error("Fetch phone number status error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// NEW: Check connection status on page load
export const checkConnectionStatus = createAsyncThunk(
  "whatsapp/checkConnectionStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest(("/whatsapp/connection-status"), {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Failed to check connection"
        );
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Fetch WhatsApp template by name
export const fetchWhatsappTemplate = createAsyncThunk(
  "whatsapp/fetchTemplate",
  async (templateName, { rejectWithValue }) => {
    try {
      const response = await apiRequest(
        (`/whatsapp/templates?templateName=${templateName}`),
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || `Failed to fetch ${templateName} template`
        );
      }

      return { templateName, data };
    } catch (error) {
      console.error("Fetch template error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Send template message
export const sendTemplateMessage = createAsyncThunk(
  "whatsapp/sendTemplateMessage",
  async ({ templateData, sessionId }, { rejectWithValue }) => {
    try {
      const response = await apiRequest(("/chat/send-template"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          templateData,
          sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to send template message"
        );
      }

      return data;
    } catch (error) {
      console.error("Send template message error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);
