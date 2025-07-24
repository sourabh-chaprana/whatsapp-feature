import { createSlice } from "@reduxjs/toolkit";
import {
  fetchSessions,
  fetchMessagesBySession,
  sendMessage,
  sendTemplateToPhoneNumber,
  deleteMessage,
  deleteAllSessionMessages,
  assignUsersToSession,
  fetchWhatsAppTemplates,
  sendWhatsAppTemplateToSession,
} from "./chatThunk";
// import normalizePhoneNumber from "../../../utils/normalizePhoneNumber";

const initialState = {
  sessions: [],
  currentSession: null,
  messages: [],
  loading: false,
  error: null,

  // Template message state
  sendingTemplate: false,
  templateError: null,

  // WhatsApp templates state
  whatsappTemplates: [],
  fetchingTemplates: false,
  templatesError: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    clearTemplateError: (state) => {
      state.templateError = null;
    },
    clearTemplatesError: (state) => {
      state.templatesError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sessions
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.sessions = action.payload;
        state.loading = false;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Messages by Session
      .addCase(fetchMessagesBySession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessagesBySession.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.loading = false;
      })
      .addCase(fetchMessagesBySession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
        state.loading = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Message
      .addCase(deleteMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.messages = state.messages.filter(
          (message) => message._id !== action.payload
        );
        state.loading = false;
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete All Session Messages
      .addCase(deleteAllSessionMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAllSessionMessages.fulfilled, (state, action) => {
        if (
          state.currentSession &&
          state.currentSession._id === action.payload
        ) {
          state.messages = [];
        }
        state.loading = false;
      })
      .addCase(deleteAllSessionMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Assign Users to Session
      .addCase(assignUsersToSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignUsersToSession.fulfilled, (state, action) => {
        state.loading = false;
        // Update the current session if it's the one being modified
        if (
          state.currentSession &&
          state.currentSession._id === action.payload._id
        ) {
          state.currentSession = action.payload;
        }

        // Update the session in the sessions array
        state.sessions = state.sessions.map((session) =>
          session._id === action.payload._id ? action.payload : session
        );
      })
      .addCase(assignUsersToSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle template sending to phone number
      .addCase(sendTemplateToPhoneNumber.pending, (state) => {
        state.sendingTemplate = true;
        state.templateError = null;
      })
      .addCase(sendTemplateToPhoneNumber.fulfilled, (state, action) => {
        state.sendingTemplate = false;
        // Optionally update messages if we have the session context
      })
      .addCase(sendTemplateToPhoneNumber.rejected, (state, action) => {
        state.sendingTemplate = false;
        state.templateError = action.payload;
      })

      // Handle WhatsApp templates fetch
      .addCase(fetchWhatsAppTemplates.pending, (state) => {
        state.fetchingTemplates = true;
        state.templatesError = null;
      })
      .addCase(fetchWhatsAppTemplates.fulfilled, (state, action) => {
        state.fetchingTemplates = false;
        state.whatsappTemplates = action.payload;
      })
      .addCase(fetchWhatsAppTemplates.rejected, (state, action) => {
        state.fetchingTemplates = false;
        state.templatesError = action.payload;
      })

      // Handle WhatsApp template send to session
      .addCase(sendWhatsAppTemplateToSession.pending, (state) => {
        state.sendingTemplate = true;
        state.templateError = null;
      })
      .addCase(sendWhatsAppTemplateToSession.fulfilled, (state, action) => {
        state.sendingTemplate = false;
        // Template sent successfully
      })
      .addCase(sendWhatsAppTemplateToSession.rejected, (state, action) => {
        state.sendingTemplate = false;
        state.templateError = action.payload;
      });
  },
});

export const {
  setCurrentSession,
  clearMessages,
  clearTemplateError,
  clearTemplatesError,
} = chatSlice.actions;
export default chatSlice.reducer;
