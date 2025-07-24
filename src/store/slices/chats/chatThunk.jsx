import { createAsyncThunk } from "@reduxjs/toolkit";
import { getOrgIdFromToken } from "../../../utils/orgIdFun";
import { buildApiUrl, getAuthHeaders } from "../../../utils/apiConfig";
import normalizePhoneNumber from "../../../utils/normalizePhoneNumber";
import { apiRequest } from "../../../utils/interceptor";

// 1. Fetch all chat sessions
export const fetchSessions = createAsyncThunk(
  "chat/fetchSessions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest("/chat/sessions", {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || "Failed to fetch sessions");
      }

      return data;
    } catch (error) {
      console.error("Fetch sessions error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// 2. Fetch messages by session ID
export const fetchMessagesBySession = createAsyncThunk(
  "chat/fetchMessagesBySession",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/chat/messages/${sessionId}`);
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || "Failed to fetch messages");
      }

      return data;
    } catch (error) {
      console.error("Fetch messages error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Modified: Send message (handles both sessionId and phoneNumber)
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (messageData, { rejectWithValue, dispatch, getState }) => {
    try {
      let finalMessageData = { ...messageData };

      // If phoneNumber is provided but no sessionId, try to find or create session
      if (messageData.phoneNumber && !messageData.sessionId) {
        const normalizedPhone = normalizePhoneNumber(messageData.phoneNumber);

        // Get current sessions from state
        const state = getState();
        let sessions = state.chat.sessions;

        // If sessions are empty, fetch them first
        if (!sessions || sessions.length === 0) {
          sessions = await dispatch(fetchSessions()).unwrap();
        }

        // Look for existing session with this phone number
        const targetSession = sessions.find(
          (session) =>
            normalizePhoneNumber(session.phoneNumber) === normalizedPhone
        );

        if (targetSession) {
          // Use existing session
          finalMessageData.sessionId = targetSession._id;
          delete finalMessageData.phoneNumber;
        } else {
          // No existing session - we need to create one
          // For now, let's try sending with phoneNumber and let backend handle it
          // If backend doesn't support this, we'll need a different approach
          console.log("No existing session found for phone:", normalizedPhone);
        }
      }

      const response = await apiRequest("/chat/message", {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(finalMessageData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || "Failed to send message");
      }

      // If we created a new session, refresh the sessions list
      if (messageData.phoneNumber && !messageData.sessionId) {
        await dispatch(fetchSessions());
      }

      return data;
    } catch (error) {
      console.error("Send message error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// 4. Delete a message
export const deleteMessage = createAsyncThunk(
  "chat/deleteMessage",
  async (messageId, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/chat/message/${messageId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || "Failed to delete message");
      }

      return messageId; // Return the ID of the deleted message
    } catch (error) {
      console.error("Delete message error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// 5. Delete all messages for a session
export const deleteAllSessionMessages = createAsyncThunk(
  "chat/deleteAllSessionMessages",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/chat/messages/${sessionId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || "Failed to delete messages");
      }

      return sessionId; // Return the session ID whose messages were deleted
    } catch (error) {
      console.error("Delete all messages error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Delete a lead (this seems misplaced in chat thunk - consider moving to lead thunk)
export const deleteLead = createAsyncThunk(
  "leads/deleteLead",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/leads/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(false),
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

// 6. Assign users to a session
export const assignUsersToSession = createAsyncThunk(
  "chat/assignUsersToSession",
  async ({ sessionId, userIds }, { rejectWithValue }) => {
    try {
      const orgId = getOrgIdFromToken();
      console.log("orgId--------------------------------", orgId);
      const response = await apiRequest("/chat/assign-user", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          sessionId,
          userIds,
          orgId: orgId, // You might want to get this from your state or config
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || "Failed to assign users");
      }

      return data; // Return the updated session data
    } catch (error) {
      console.error("Assign users error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// 7. Send template message
export const sendTemplateMessage = createAsyncThunk(
  "chat/sendTemplateMessage",
  async ({ templateData, sessionId, templateType }, { rejectWithValue }) => {
    try {
      const response = await apiRequest("/chat/send-template", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          templateData,
          sessionId,
          templateType,
          source: "whatsapp_template",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || "Failed to send template message");
      }

      return data;
    } catch (error) {
      console.error("Send template message error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// 8. Send template message to phone number (creates session if needed)
export const sendTemplateToPhoneNumber = createAsyncThunk(
  "chat/sendTemplateToPhoneNumber",
  async (
    { templateData, phoneNumber, clientName },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);

      // Get current sessions from state
      const state = getState();
      let sessions = state.chat.sessions;

      // If sessions are empty, fetch them first
      if (!sessions || sessions.length === 0) {
        sessions = await dispatch(fetchSessions()).unwrap();
      }

      // Look for existing session with this phone number
      const targetSession = sessions.find(
        (session) =>
          normalizePhoneNumber(session.phoneNumber) === normalizedPhone
      );

      if (targetSession) {
        // Send to existing session
        const messagePayload = {
          user: null,
          bot: templateData,
          sessionId: targetSession._id,
        };

        const response = await apiRequest("/chat/message", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(messagePayload),
        });

        const data = await response.json();

        if (!response.ok) {
          return rejectWithValue(
            data.error || "Failed to send template message"
          );
        }

        return data;
      } else {
        // No existing session - create a new one by sending the template
        // Try using a different endpoint or approach for session creation
        const createAndSendPayload = {
          user: null,
          name: clientName || "Unknown ",
          bot: templateData,
          phoneNumber: normalizedPhone,
          createSession: true, // Flag to indicate session creation needed
          phoneNumberId: null,
        };

        // Try the original endpoint with createSession flag
        const response = await apiRequest("/chat/message", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(createAndSendPayload),
        });

        const data = await response.json();

        if (!response.ok) {
          // If the backend doesn't support session creation, try a different approach
          if (data.error && data.error.includes("sessionId")) {
            // The backend requires sessionId, so we need to create session first
            // For now, let's try a workaround by using the WhatsApp API directly

            // Alternative: Try using a different endpoint that might handle this
            const altResponse = await apiRequest("/whatsapp/send-template", {
              method: "POST",
              headers: getAuthHeaders(),
              body: JSON.stringify({
                phoneNumber: normalizedPhone,
                templateData: templateData,
              }),
            });

            if (altResponse.ok) {
              const altData = await altResponse.json();
              // Refresh sessions after successful send
              await dispatch(fetchSessions());
              return altData;
            }
          }

          return rejectWithValue(
            data.error || "Failed to send template message"
          );
        }

        // Refresh sessions after creating new one
        await dispatch(fetchSessions());

        return data;
      }
    } catch (error) {
      console.error("Send template to phone number error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// 9. Fetch WhatsApp Templates
export const fetchWhatsAppTemplates = createAsyncThunk(
  "chat/fetchWhatsAppTemplates",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest("/whatsapp/templates/list", {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || "Failed to fetch templates");
      }

      // Filter out hello_world template
      const filteredTemplates =
        data.data?.data?.filter(
          (template) => template.name !== "hello_world"
        ) || [];

      return filteredTemplates;
    } catch (error) {
      console.error("Fetch WhatsApp templates error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// 10. Send WhatsApp Template to Current Session
export const sendWhatsAppTemplateToSession = createAsyncThunk(
  "chat/sendWhatsAppTemplateToSession",
  async ({ templateData, sessionId, phoneNumber }, { rejectWithValue }) => {
    try {
      const response = await apiRequest("/whatsapp/send-template", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          templateId: templateData.id,
          templateName: templateData.name,
          parameters: templateData.parameters || [],
          phoneNumber: phoneNumber,
          sessionId: sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || "Failed to send template");
      }

      return data;
    } catch (error) {
      console.error("Send WhatsApp template error:", error);
      return rejectWithValue(error.message || "Network error");
    }
  }
);
