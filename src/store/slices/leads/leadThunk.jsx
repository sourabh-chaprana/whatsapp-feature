import { createAsyncThunk } from "@reduxjs/toolkit";
import {  getAuthHeaders } from "../../../utils/apiConfig";
import { apiRequest,formDataRequest } from "../../../utils/interceptor";

// Fetch all leads
export const fetchLeads = createAsyncThunk(
  "leads/fetchLeads",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest(("/leads"), {
        method: "GET",
        headers: getAuthHeaders(true),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to fetch leads");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch leads error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Create a new lead with file uploads
export const createLead = createAsyncThunk(
  "leads/createLead",
  async ({ leadData, files }, { rejectWithValue, dispatch }) => {
    try {
      console.log("Creating lead with data:", leadData);
      console.log("Files to upload:", files);

      const formData = new FormData();

      // Append lead data as JSON string
      formData.append("leadData", JSON.stringify(leadData));

      // Append lead files
      if (files && files.length > 0) {
        files.forEach((file, index) => {
          formData.append(`leadFiles_${index}`, file);
        });
      }

      // Get auth headers without Content-Type (let browser set it for FormData)
      const headers = getAuthHeaders(true);
      delete headers["Content-Type"];

      // const response = await apiRequest(("/leads"), {
      //   method: "POST",
      //   headers: headers,
      //   body: formData,
      // });
      const response = await formDataRequest(`/leads`, formData, "POST");

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Create lead API error:", errorData);

        if (response.status === 400 && errorData.errors) {
          const errorMessages = errorData.errors
            .map((err) => err.message || err.msg)
            .join(", ");
          return rejectWithValue(errorMessages);
        }

        return rejectWithValue(errorData.message || "Failed to create lead");
      }

      const data = await response.json();
      console.log("Lead created successfully:", data);

      // Force a refresh of the leads list after creating a new lead
      dispatch(fetchLeads());

      return data;
    } catch (error) {
      console.error("Create lead error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Update an existing lead with file uploads
export const updateLead = createAsyncThunk(
  "leads/updateLead",
  async ({ id, leadData, files }, { rejectWithValue }) => {
    try {
      console.log("Updating lead with data:", leadData);
      console.log("Files to upload:", files);

      const formData = new FormData();

      // Append lead data as JSON string
      formData.append("leadData", JSON.stringify(leadData));

      // Append lead files
      if (files && files.length > 0) {
        files.forEach((file, index) => {
          formData.append(`leadFiles_${index}`, file);
        });
      }

      // Get auth headers without Content-Type (let browser set it for FormData)
      const headers = getAuthHeaders(true);
      delete headers["Content-Type"];

      // const response = await apiRequest((`/leads/${id}`), {
      //   method: "PUT",
      //   headers: headers,
      //   body: formData,
      // });

      const response = await formDataRequest(`/leads/${id}`, formData, "PUT");

    
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to update lead");
      }

      const responseData = await response.json();

      return responseData;
    } catch (error) {
      console.error("Update lead error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Delete a lead
export const deleteLead = createAsyncThunk(
  "leads/deleteLead",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiRequest((`/leads/${id}`), {
        method: "DELETE",
        headers: getAuthHeaders(true),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to delete lead");
      }

      return id; // Return the id of the deleted lead
    } catch (error) {
      console.error("Delete lead error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// New comprehensive leads fetching with filters, pagination and sorting
export const getAllLeadsWithSearchFilter = createAsyncThunk(
  "leads/getAllLeadsWithSearchFilter",
  async (params, { rejectWithValue }) => {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.search) queryParams.append("search", params.search);
      if (params.status && params.status !== "all")
        queryParams.append("status", params.status);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
      if (params.phoneNumber)
        queryParams.append("phoneNumber", params.phoneNumber);

      const queryString = queryParams.toString();
      const url = `${("/leads")}${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await apiRequest(url, {
        method: "GET",
        headers: getAuthHeaders(true),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to fetch leads");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch leads error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Fetch lead details by ID
export const fetchLeadById = createAsyncThunk(
  "leads/fetchLeadById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiRequest((`/leads/${id}`), {
        method: "GET",
        headers: getAuthHeaders(true),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Failed to fetch lead details"
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch lead details error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Fetch bookings by lead ID for timeline
export const fetchLeadBookings = createAsyncThunk(
  "leads/fetchLeadBookings",
  async (leadId, { rejectWithValue }) => {
    try {
      const response = await apiRequest(("/bookings/search"), {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          page: 1,
          limit: 50,
          sortBy: "createdAt",
          sortOrder: "desc",
          filters: {
            status: "",
            leadId: leadId,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to fetch bookings");
      }

      const data = await response.json();
      return data.data.bookings || [];
    } catch (error) {
      console.error("Fetch lead bookings error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Fetch payments by lead ID for timeline
export const fetchLeadPayments = createAsyncThunk(
  "leads/fetchLeadPayments",
  async (leadId, { rejectWithValue }) => {
    try {
      const response = await apiRequest(("/payments/search"), {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          page: 1,
          limit: 50,
          sortBy: "dueDate",
          sortOrder: "desc",
          filters: {
            name: "",
            bookingId: "",
            leadId: leadId,
            // isPaid: "",
            dueDate: "",
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to fetch payments");
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Fetch lead payments error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Assign agent to lead
export const assignAgentToLead = createAsyncThunk(
  "leads/assignAgentToLead",
  async ({ leadId, userId }, { rejectWithValue }) => {
    try {
      const response = await apiRequest((`/leads/${leadId}/assign`), {
        method: "PATCH",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to assign agent");
      }

      const data = await response.json();

      return { leadId, assignedUser: data.assignedUser };
    } catch (error) {
      console.error("Assign agent error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Fetch priority score attributes
export const fetchPriorityScoreAttributes = createAsyncThunk(
  "leads/fetchPriorityScoreAttributes",
  async (_, { rejectWithValue }) => {
    try {
      // Get orgId from token
      const token = localStorage.getItem("authToken");
      if (!token) return rejectWithValue("No auth token found");

      const decoded = JSON.parse(atob(token.split(".")[1]));
      const orgId = decoded.orgId;

      const response = await apiRequest(
        (`/priority-score/attributes?orgId=${orgId}&type=label`),
        {
          method: "GET",
          headers: getAuthHeaders(true),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Failed to fetch attributes"
        );
      }

      const data = await response.json();
      return data.attributes || [];
    } catch (error) {
      console.error("Fetch priority score attributes error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Bulk import leads
export const importLeads = createAsyncThunk(
  "leads/importLeads",
  async (file, { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      formData.append("excelFile", file);

      const authHeaders = getAuthHeaders(true);
      // Remove Content-Type header to let browser set it for FormData
      const { "Content-Type": contentType, ...headersWithoutContentType } =
        authHeaders;

      const response = await apiRequest(("/leads/import"), {
        method: "POST",
        headers: headersWithoutContentType,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to import leads");
      }

      const data = await response.json();

      // Refresh leads list after successful import
      dispatch(getAllLeadsWithSearchFilter({ page: 1, limit: 10 }));

      return data;
    } catch (error) {
      console.error("Import leads error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Download import file (success or error)
export const downloadImportFile = createAsyncThunk(
  "leads/downloadImportFile",
  async ({ bulkImportId, type }, { rejectWithValue }) => {
    try {
      const response = await apiRequest(
        (`/leads/download/${bulkImportId}?type=${type}`),
        {
          method: "GET",
          headers: getAuthHeaders(true),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Failed to get download link"
        );
      }

      const data = await response.json();

      // Automatically trigger download
      if (data.signedUrl) {
        const link = document.createElement("a");
        link.href = data.signedUrl;
        link.download = `leads_${type}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      return data;
    } catch (error) {
      console.error("Download import file error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Delete lead file
export const deleteLeadFile = createAsyncThunk(
  "leads/deleteLeadFile",
  async ({ leadId, fileId }, { rejectWithValue }) => {
    try {
      const response = await apiRequest(
        (`/leads/${leadId}/files/${fileId}`),
        {
          method: "DELETE",
          headers: getAuthHeaders(true),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || "Failed to delete file");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Delete lead file error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Fetch message by ID and handle attachments
export const fetchMessageById = createAsyncThunk(
  "leads/fetchMessageById",
  async (messageId, { rejectWithValue }) => {
    try {
      const response = await apiRequest((`/chat/messages/message/${messageId}`), {
        method: "GET",
        headers: getAuthHeaders(true),
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
