import { store } from "../store/store";
import { buildApiUrl, getAuthHeaders } from "./apiConfig";
import { logout } from "../store/slices/auth/authSlice";

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Function to check if token needs refresh (less than 30 seconds to expiry)
const shouldRefreshToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check if token expires in less than 30 seconds
    return (payload.exp * 1000) - Date.now() < 30000;
  } catch (e) {
    console.error('Error parsing token:', e);
    return false;
  }
};

// Function to refresh token
const refreshToken = async () => {
  console.log("Attempting to refresh token");
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    // Use the correct endpoint for refresh token
    const response = await fetch(buildApiUrl("/login/refresh-token"), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    
    if (!response.ok) {
      // Check if refresh token has expired
      const data = await response.json().catch(() => ({}));
      
      if (response.status === 403) {
        // Refresh token has expired, force logout and redirect
        handleTokenExpiration();
        throw new Error('Refresh token expired. Please login again.');
      }
      
      throw new Error('Failed to refresh token');
    }
    
    const data = await response.json();
    const newToken = data.token;
    
    console.log("Token refreshed successfully");
    
    // Store the new token
    localStorage.setItem('authToken', newToken);
    
    return newToken;
  } catch (error) {
    console.error("Token refresh error:", error);
    throw error;
  }
};

// Handle complete token expiration (both access and refresh tokens)
const handleTokenExpiration = () => {
  // Clear tokens
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  
  // Dispatch logout action
  store.dispatch(logout());
  
  // Redirect to login page
  window.location.href = '/login';
};

export const fetchWithInterceptor = async (url, options = {}) => {
  // Check if token needs to be refreshed before request
  if (shouldRefreshToken() && !isRefreshing) {
    console.log("Token needs refresh, refreshing...");
    isRefreshing = true;
    
    try {
      await refreshToken();
      console.log("Token refreshed successfully before request");
      isRefreshing = false;
      
      // Update headers with new token for current request
      if (options.headers && options.headers.Authorization) {
        const newToken = localStorage.getItem('authToken');
        options.headers.Authorization = `Bearer ${newToken}`;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      isRefreshing = false;
      
      // If refresh token has expired, we've already handled the redirect in refreshToken()
      if (!error.message.includes('Refresh token expired')) {
        handleTokenExpiration();
      }
      
      throw error;
    }
  }
  
  // Make the request with current token
  try {
    const response = await fetch(url, options);
    
    // If response is OK or not 401, return it
    if (response.status !== 401) {
      return response;
    }
    
    console.log("Received 401 response, attempting token refresh");
    
    // Handle 401 Unauthorized - token might be expired
    const refreshTokenValue = localStorage.getItem('refreshToken');
    
    if (!refreshTokenValue) {
      // No refresh token available, force logout and redirect
      handleTokenExpiration();
      throw new Error('Authentication failed. Please login again.');
    }
    
    // If already refreshing, queue this request
    if (isRefreshing) {
      console.log("Another refresh in progress, queueing request");
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          // Retry with new token
          console.log("Retrying request with new token from queue");
          const newOptions = {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${token}`
            }
          };
          return fetch(url, newOptions);
        })
        .catch(err => Promise.reject(err));
    }
    
    isRefreshing = true;
    
    // Try to refresh the token
    try {
      const newToken = await refreshToken();
      isRefreshing = false;
      processQueue(null, newToken);
      
      // Retry the original request with new token
      console.log("Retrying original request with new token");
      const newOptions = {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`
        }
      };
      
      return fetch(url, newOptions);
    } catch (error) {
      console.error("Token refresh failed on 401:", error);
      isRefreshing = false;
      processQueue(error);
      
      // If refresh token has expired, we've already handled the redirect in refreshToken()
      if (!error.message.includes('Refresh token expired')) {
        handleTokenExpiration();
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Helper function for FormData requests (no data conversion)
export const formDataRequest = async (endpoint, formData, method = "POST") => {
  const url = buildApiUrl(endpoint);
  
  // Get auth headers without Content-Type (let browser set it for FormData)
  const headers = getAuthHeaders(true); // Always include auth
  delete headers["Content-Type"];
  
  // Just return the response, let the thunk handle data conversion
  return fetchWithInterceptor(url, {
    method,
    headers,
    body: formData,
  });
};

// Helper function to make API requests with the interceptor (no data conversion)
export const apiRequest = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);
  const includeAuth = options.includeAuth !== false; // Default to true
  
  const fetchOptions = {
    ...options,
    headers: {
      ...getAuthHeaders(includeAuth), // Always include auth headers by default
      ...options.headers,
    },
  };
  
  // Remove includeAuth from options as it's not a standard fetch option
  if ('includeAuth' in fetchOptions) {
    delete fetchOptions.includeAuth;
  }
  
  // Just return the response, let the thunk handle data conversion
  return fetchWithInterceptor(url, fetchOptions);
};
