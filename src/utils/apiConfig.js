// API Configuration
// Base URL from environment variables with fallback
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
// const BASE_URL = "http://localhost:3000";
//
// API endpoints configuration
export const API_CONFIG = {
  BASE_URL,
  API_BASE: `${BASE_URL}/api`,

  // Endpoint builders
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: "/login",
      CHECK_EMAIL: "/organizations/check-email",
      ONBOARDING: "/organizations/",
    },

    // Leads endpoints
    LEADS: "/leads",

    // Organizations endpoints
    ORGANIZATIONS: "/organizations",
    PRIORITY_SCORE: "/priority-score",

    // Sub-admin endpoints
    SUB_ADMIN: "/sub-admin",

    // Chat endpoints
    CHAT: {
      BASE: "/chat",
      SESSIONS: "/chat/sessions",
      MESSAGES: "/chat/messages",
      MESSAGE: "/chat/message",
      ASSIGN_USER: "/chat/assign-user",
    },

    // WhatsApp endpoints
    WHATSAPP: {
      GET_PERMANENT_TOKEN: "/whatsapp/get-permanent-token",
      UPDATE_TOKEN: "/whatsapp/update-token",
      UPDATE_BUSINESS: "/whatsapp/update-business",
      VERIFY_BUSINESS: "/whatsapp/verify-business",
    },

    // Booking endpoints
    BOOKINGS: "/bookings",
  },
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.API_BASE}${endpoint}`;
};

// Helper function for common headers
export const getAuthHeaders = (includeAuth = true) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = localStorage.getItem("authToken");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

export default API_CONFIG;
