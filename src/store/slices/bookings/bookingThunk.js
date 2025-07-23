import { createAsyncThunk } from "@reduxjs/toolkit";
import { buildApiUrl, getAuthHeaders } from "../../../utils/apiConfig";
import { apiRequest, formDataRequest } from "../../../utils/interceptor";

// Fetch all bookings with pagination
export const fetchBookings = createAsyncThunk(
  "bookings/fetchBookings",
  async (params = {}, { rejectWithValue }) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("page", params.page || 1);
      queryParams.append("limit", params.limit || 10);

      if (params.status && params.status !== "")
        queryParams.append("status", params.status);
      if (params.search) queryParams.append("search", params.search);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      // const queryString = queryParams.toString();
      const url = "/bookings/search"

      const response = await apiRequest(url, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to fetch bookings");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch bookings error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Fetch booking by ID
export const fetchBookingById = createAsyncThunk(
  "bookings/fetchBookingById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiRequest((`/bookings/${id}`), {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Failed to fetch booking details"
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch booking details error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Fetch booking by phone number
export const fetchBookingByNumber = createAsyncThunk(
  "bookings/fetchBookingByNumber",
  async (params, { rejectWithValue }) => {
    try {
      const { phoneNumber, value } = params;
      const url = `/leads/bookings-by-phone/${phoneNumber}?include=${value}`
      

      const response = await apiRequest(url, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Failed to fetch booking details"
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch booking by phone number error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Create a new booking with file uploads
export const createBooking = createAsyncThunk(
  "bookings/createBooking",
  async ({ bookingData, files }, { rejectWithValue }) => {
    try {
      console.log("Creating booking with data:", bookingData);
      console.log("Files to upload:", files);

      const formData = new FormData();

      // Append booking data as JSON string
      formData.append("bookingData", JSON.stringify(bookingData));

      // Append itinerary files
      if (files.itineraryFiles && files.itineraryFiles.length > 0) {
        files.itineraryFiles.forEach((file, index) => {
          // Check if it's our custom file object with _blob property
          if (file._blob) {
            formData.append(`itineraryFiles`, file._blob, file.name);
          } else {
            formData.append(`itineraryFiles`, file);
          }
        });
      }

      // Append payment files
      if (files.paymentFiles && Object.keys(files.paymentFiles).length > 0) {
        Object.entries(files.paymentFiles).forEach(
          ([paymentIndex, paymentFilesList]) => {
            if (paymentFilesList && paymentFilesList.length > 0) {
              paymentFilesList.forEach((file) => {
                // Check if it's our custom file object with _blob property
                if (file._blob) {
                  formData.append(`paymentFiles_${paymentIndex}`, file._blob, file.name);
                } else {
                  formData.append(`paymentFiles_${paymentIndex}`, file);
                }
              });
            }
          }
        );
      }

      // Get auth headers without Content-Type (let browser set it for FormData)
      const headers = getAuthHeaders();
      delete headers["Content-Type"];

      // const response = await apiRequest(("/bookings"), {
      //   method: "POST",
      //   headers: headers,
      //   body: formData,
      // });

      const response = await formDataRequest(`/bookings`, formData, "POST");

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Create booking API error:", errorData);

        if (response.status === 400 && errorData.errors) {
          const errorMessages = errorData.errors
            .map((err) => err.message || err.msg)
            .join(", ");
          return rejectWithValue(errorMessages);
        }

        return rejectWithValue(errorData.message || "Failed to create booking");
      }

      const data = await response.json();
      console.log("Booking created successfully:", data);

      return data;
    } catch (error) {
      console.error("Create booking error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Update an existing booking with file uploads
export const updateBooking = createAsyncThunk(
  "bookings/updateBooking",
  async ({ id, bookingData, files }, { rejectWithValue, dispatch }) => {
    try {
      console.log("Updating booking with data:", bookingData);
      console.log("Files to upload:", files);

      const formData = new FormData();

      // Append booking data as JSON string
      formData.append("bookingData", JSON.stringify(bookingData));

      // Append itinerary files
      if (files.itineraryFiles && files.itineraryFiles.length > 0) {
        files.itineraryFiles.forEach((file, index) => {
          // Check if it's our custom file object with _blob property
          if (file._blob) {
            formData.append(`itineraryFiles`, file._blob, file.name);
          } else {
            formData.append(`itineraryFiles`, file);
          }
        });
      }

      // Append payment files
      if (files.paymentFiles && Object.keys(files.paymentFiles).length > 0) {
        Object.entries(files.paymentFiles).forEach(
          ([paymentIndex, paymentFilesList]) => {
            if (paymentFilesList && paymentFilesList.length > 0) {
              paymentFilesList.forEach((file) => {
                // Check if it's our custom file object with _blob property
                if (file._blob) {
                  formData.append(`paymentFiles_${paymentIndex}`, file._blob, file.name);
                } else {
                  formData.append(`paymentFiles_${paymentIndex}`, file);
                }
              });
            }
          }
        );
      }

      // Get auth headers without Content-Type (let browser set it for FormData)
      const headers = getAuthHeaders();
      delete headers["Content-Type"];

      const response = await formDataRequest(`/bookings/${id}`, formData, "PUT");

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to update booking");
      }

      const responseData = await response.json();

      // Refresh bookings list after updating
      dispatch(fetchBookings());

      return responseData;
    } catch (error) {
      console.error("Update booking error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Delete booking file
export const deleteBookingFile = createAsyncThunk(
  "bookings/deleteBookingFile",
  async ({ bookingId, fileId, fileType }, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/bookings/${bookingId}/files/${fileId}?fileType=${fileType}`
        ,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || "Failed to delete file");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Delete booking file error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Delete payment file
export const deletePaymentFile = createAsyncThunk(
  "bookings/deletePaymentFile",
  async ({ paymentId, fileId }, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/payments/${paymentId}/files/${fileId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.error || "Failed to delete payment file"
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Delete payment file error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Delete a booking
export const deleteBooking = createAsyncThunk(
  "bookings/deleteBooking",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await apiRequest((`/bookings/${id}`), {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to delete booking");
      }

      // Refresh bookings list after deleting
      dispatch(fetchBookings());

      return id;
    } catch (error) {
      console.error("Delete booking error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Update payment status
export const updatePaymentStatus = createAsyncThunk(
  "bookings/updatePaymentStatus",
  async (
    { bookingId, paymentId, paymentData },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await apiRequest(
        (`/bookings/${bookingId}/payments/${paymentId}`),
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(paymentData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to update payment");
      }

      const data = await response.json();

      // Refresh bookings list after updating payment
      dispatch(fetchBookings());

      return data;
    } catch (error) {
      console.error("Update payment error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Add this new thunk function to fetch message by ID for bookings
export const fetchMessageById = createAsyncThunk(
  "bookings/fetchMessageById",
  async (messageId, { rejectWithValue }) => {
    try {
      const response = await apiRequest((`/chat/messages/message/${messageId}`), {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to fetch message");
      }

      const data = await response.json();
      
      // Process different message types to extract attachments
      let attachment = null;
      
      // Handle user message with base64 data (image/audio)
      if (data.user && data.user.startsWith('data:')) {
        attachment = {
          data: data.user,
          type: data.messageType || (data.user.includes('image') ? 'image' : 'audio')
        };
      }
      // Handle bot message with media
      else if (data.bot) {
        const mediaType = data.bot.type || data.bot.mediaType || data.messageType;
        const mediaUrl = data.bot.mediaUrl || data.bot.videoUrl || data.bot.documentUrl || '';
        
        if (mediaUrl && mediaType !== 'text') {
          attachment = {
            data: mediaUrl,
            type: mediaType
          };
        }
      }
      
      return {
        message: data,
        attachment
      };
    } catch (error) {
      console.error("Fetch message error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);
