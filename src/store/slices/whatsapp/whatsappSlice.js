import { createSlice } from "@reduxjs/toolkit";
import {
  getPermanentToken,
  updateWabaTokenDetails,
  updateWabaBusinessDetails,
  submitBusinessVerification,
  fetchBusinessDetails,
  fetchPhoneNumberStatus,
  checkConnectionStatus,
  fetchWhatsappTemplate,
  sendTemplateMessage,
} from "./whatsappThunk";

const initialState = {
  // Facebook/WABA connection state
  isConnected: false,
  accessToken: null,
  businessAccountId: null,
  phoneNumberId: null,
  wabaId: null,

  // Business profile data from Facebook
  facebookBusinessProfile: null,
  wabaBusinessDetails: null, // New: Full business details from Facebook API
  phoneNumbers: [], // New: Phone numbers array

  // Business verification state
  verificationStatus: "pending",
  businessDetails: {
    name: "",
    category: "",
    description: "",
    phoneNumber: "",
  },

  // Loading states
  isLoading: false,
  isSubmitting: false,
  isConnecting: false,
  isFetchingDetails: false, // New: Loading state for fetching details

  // Error handling
  error: null,

  // Success messages
  successMessage: null,

  // Template management
  templates: {},
  templateLoading: {},
  templateError: null,
  selectedTemplate: null,
  templateModalOpen: false,

  // Template sending
  sendingTemplate: false,
  templateSendError: null,
};

const whatsappSlice = createSlice({
  name: "whatsapp",
  initialState,
  reducers: {
    // Clear error messages
    clearError: (state) => {
      state.error = null;
    },

    // Clear success messages
    clearSuccess: (state) => {
      state.successMessage = null;
    },

    // Update business form data
    updateBusinessForm: (state, action) => {
      state.businessDetails = {
        ...state.businessDetails,
        ...action.payload,
      };
    },

    // Reset connection state
    resetConnection: (state) => {
      state.isConnected = false;
      state.accessToken = null;
      state.businessAccountId = null;
      state.phoneNumberId = null;
      state.wabaId = null;
    },

    // Updated reducer to properly handle Facebook data
    updateFormWithFacebookData: (state, action) => {
      const { businessProfile, phoneNumber } = action.payload;

      if (businessProfile) {
        state.facebookBusinessProfile = businessProfile;

        // Update form fields with Facebook data
        if (businessProfile.name) {
          state.businessDetails.name = businessProfile.name;
        }
        if (businessProfile.description) {
          state.businessDetails.description = businessProfile.description;
        }
        if (businessProfile.category) {
          state.businessDetails.category = businessProfile.category;
        }
      }

      if (phoneNumber) {
        state.businessDetails.phoneNumber = phoneNumber;
      }
    },

    // NEW: Update form with fetched business details
    updateFormWithBusinessDetails: (state, action) => {
      const { wabaBusinessDetails, phoneNumbers } = action.payload;

      // Update form with business details from backend
      if (wabaBusinessDetails?.name) {
        state.businessDetails.name = wabaBusinessDetails.name;
      }

      if (phoneNumbers?.[0]?.verified_name && !state.businessDetails.name) {
        state.businessDetails.name = phoneNumbers[0].verified_name;
      }

      if (phoneNumbers?.[0]?.display_phone_number) {
        state.businessDetails.phoneNumber =
          phoneNumbers[0].display_phone_number;
      }

      // Map category if available (you might need to adjust based on your backend data)
      if (wabaBusinessDetails?.category) {
        state.businessDetails.category = wabaBusinessDetails.category;
      }
    },

    // Template modal actions
    openTemplateModal: (state, action) => {
      state.selectedTemplate = action.payload;
      state.templateModalOpen = true;
      state.templateError = null;
    },

    closeTemplateModal: (state) => {
      state.selectedTemplate = null;
      state.templateModalOpen = false;
      state.templateError = null;
    },

    clearTemplateError: (state) => {
      state.templateError = null;
      state.templateSendError = null;
    },
  },
  extraReducers: (builder) => {
    // Get Permanent Token
    builder
      .addCase(getPermanentToken.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(getPermanentToken.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.accessToken = action.payload.access_token;
        state.successMessage = "Successfully obtained permanent token";
      })
      .addCase(getPermanentToken.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.payload || "Failed to get permanent token";
      });

    // Update WABA Token Details
    builder
      .addCase(updateWabaTokenDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWabaTokenDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Token details updated successfully";
      })
      .addCase(updateWabaTokenDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update token details";
      });

    // Update WABA Business Details - FIXED
    builder
      .addCase(updateWabaBusinessDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWabaBusinessDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isConnected = true;

        // ✅ CRITICAL FIX: Update Redux state with the saved data
        if (action.meta.arg.businessAccountId) {
          state.businessAccountId = action.meta.arg.businessAccountId;
        }
        if (action.meta.arg.phoneNumberId) {
          state.phoneNumberId = action.meta.arg.phoneNumberId;
        }
        if (action.meta.arg.wabaId) {
          state.wabaId = action.meta.arg.wabaId;
        }

        // Store Facebook business profile if available
        if (action.meta.arg.businessProfile) {
          state.facebookBusinessProfile = action.meta.arg.businessProfile;
        }

        state.successMessage =
          "WhatsApp Business account connected successfully";
      })
      .addCase(updateWabaBusinessDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update business details";
      });

    // Submit Business Verification
    builder
      .addCase(submitBusinessVerification.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitBusinessVerification.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.verificationStatus = action.payload.status || "pending";
        state.successMessage = "Business verification submitted successfully";
      })
      .addCase(submitBusinessVerification.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to submit verification";
      });

    // Fetch Business Details - UPDATED
    builder
      .addCase(fetchBusinessDetails.pending, (state) => {
        state.isFetchingDetails = true;
        state.error = null;
      })
      .addCase(fetchBusinessDetails.fulfilled, (state, action) => {
        state.isFetchingDetails = false;
        state.wabaBusinessDetails = action.payload;
        state.successMessage = "Business details fetched successfully";

        // Auto-update form with fetched business details
        if (action.payload?.name) {
          state.businessDetails.name = action.payload.name;
        }
      })
      .addCase(fetchBusinessDetails.rejected, (state, action) => {
        state.isFetchingDetails = false;
        state.error = action.payload || "Failed to fetch business details";
      });

    // Fetch Phone Number Status - UPDATED
    builder
      .addCase(fetchPhoneNumberStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPhoneNumberStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.phoneNumbers = action.payload;

        // Auto-update form with phone number details
        if (action.payload?.[0]) {
          const phoneData = action.payload[0];

          if (phoneData.verified_name && !state.businessDetails.name) {
            state.businessDetails.name = phoneData.verified_name;
          }

          if (phoneData.display_phone_number) {
            state.businessDetails.phoneNumber = phoneData.display_phone_number;
          }
        }
      })
      .addCase(fetchPhoneNumberStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch phone number status";
      });

    // ✅ FIXED: Add proper handling for checkConnectionStatus
    builder
      .addCase(checkConnectionStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkConnectionStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const { isConnected, businessAccountId, phoneNumberId, wabaId } =
          action.payload;

        if (isConnected) {
          state.isConnected = true;
          state.businessAccountId = businessAccountId;
          state.phoneNumberId = phoneNumberId;
          state.wabaId = wabaId;
        } else {
          // Don't clear existing data, just mark as disconnected
          state.isConnected = false;
        }
      })
      .addCase(checkConnectionStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch WhatsApp Template
    builder
      .addCase(fetchWhatsappTemplate.pending, (state, action) => {
        const templateName = action.meta.arg;
        state.templateLoading[templateName] = true;
        state.templateError = null;
      })
      .addCase(fetchWhatsappTemplate.fulfilled, (state, action) => {
        const { templateName, data } = action.payload;
        state.templateLoading[templateName] = false;
        state.templates[templateName] = data;
      })
      .addCase(fetchWhatsappTemplate.rejected, (state, action) => {
        const templateName = action.meta.arg;
        state.templateLoading[templateName] = false;
        state.templateError = action.payload;
      });

    // Send Template Message
    builder
      .addCase(sendTemplateMessage.pending, (state) => {
        state.sendingTemplate = true;
        state.templateSendError = null;
      })
      .addCase(sendTemplateMessage.fulfilled, (state) => {
        state.sendingTemplate = false;
        state.templateModalOpen = false;
        state.selectedTemplate = null;
      })
      .addCase(sendTemplateMessage.rejected, (state, action) => {
        state.sendingTemplate = false;
        state.templateSendError = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  updateBusinessForm,
  resetConnection,
  updateFormWithFacebookData,
  updateFormWithBusinessDetails, // NEW
  openTemplateModal,
  closeTemplateModal,
  clearTemplateError,
} = whatsappSlice.actions;

export default whatsappSlice.reducer;
