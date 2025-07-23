import { createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { buildApiUrl, getAuthHeaders } from "../../../utils/apiConfig";
import { apiRequest } from "../../../utils/interceptor";
import {
  fetchSubAdminsPending,
  fetchSubAdminsFulfilled,
  fetchSubAdminsRejected,
  createSubAdminPending,
  createSubAdminFulfilled,
  createSubAdminRejected,
  updateSubAdminPending,
  updateSubAdminFulfilled,
  updateSubAdminRejected,
  fetchSubAdminByIdPending,
  fetchSubAdminByIdFulfilled,
  fetchSubAdminByIdRejected,
  softDeleteSubAdminPending,
  softDeleteSubAdminFulfilled,
  softDeleteSubAdminRejected
} from "./subAdminSlice";

// Helper to get orgId from token
const getOrgIdFromToken = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.orgId;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Fetch all sub-admins
export const fetchSubAdmins = () => async (dispatch) => {
  try {
    dispatch(fetchSubAdminsPending());
    
    // Get orgId from token
    const orgId = getOrgIdFromToken();
    if (!orgId) {
      return dispatch(fetchSubAdminsRejected("Organization ID not found in token"));
    }

    // Append orgId as a query parameter
    const response = await apiRequest(
      `${("/sub-admin")}?orgId=${orgId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return dispatch(fetchSubAdminsRejected(
        errorData.message || "Failed to fetch sub-admins"
      ));
    }

    const data = await response.json();
    dispatch(fetchSubAdminsFulfilled(data));
  } catch (error) {
    console.error("Fetch sub-admins error:", error);
    dispatch(fetchSubAdminsRejected(error.message || "Network error"));
  }
};

// Create a new sub-admin
export const createSubAdmin = (subAdminData) => async (dispatch) => {
  try {
    dispatch(createSubAdminPending());
    
    const orgId = getOrgIdFromToken();
    if (!orgId) {
      return dispatch(createSubAdminRejected("Unable to retrieve organization ID"));
    }

    // Add orgId to the data
    const dataWithOrgId = {
      ...subAdminData,
      orgId,
      role: "SUB_ADMIN", // Ensure role is SUB_ADMIN
    };

    const response = await apiRequest(("/sub-admin"), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(dataWithOrgId),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return dispatch(createSubAdminRejected(
        errorData.message || "Failed to create sub-admin"
      ));
    }

    const data = await response.json();
    dispatch(createSubAdminFulfilled(data));

    // Force a refresh of the sub-admins list after creating a new one
    dispatch(fetchSubAdmins());
  } catch (error) {
    console.error("Create sub-admin error:", error);
    dispatch(createSubAdminRejected(error.message || "Network error"));
  }
};

// Update an existing sub-admin
export const updateSubAdmin = ({ id, updatedFields }) => async (dispatch) => {
  try {
    dispatch(updateSubAdminPending());
    
    const response = await apiRequest((`/sub-admin/${id}`), {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updatedFields),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return dispatch(updateSubAdminRejected(
        errorData.message || "Failed to update sub-admin"
      ));
    }

    const data = await response.json();
    dispatch(updateSubAdminFulfilled(data));
  } catch (error) {
    console.error("Update sub-admin error:", error);
    dispatch(updateSubAdminRejected(error.message || "Network error"));
  }
};

// Fetch sub-admin details by ID
export const fetchSubAdminById = (id) => async (dispatch) => {
  try {
    dispatch(fetchSubAdminByIdPending());
    
    const response = await apiRequest((`/sub-admin/${id}`), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return dispatch(fetchSubAdminByIdRejected(
        errorData.message || "Failed to fetch sub-admin details"
      ));
    }

    const data = await response.json();
    dispatch(fetchSubAdminByIdFulfilled(data));
  } catch (error) {
    console.error("Fetch sub-admin details error:", error);
    dispatch(fetchSubAdminByIdRejected(error.message || "Network error"));
  }
};

// Soft delete a sub-admin (set isDeleted = true)
export const softDeleteSubAdmin = (id) => async (dispatch) => {
  try {
    dispatch(softDeleteSubAdminPending());
    
    const response = await apiRequest((`/sub-admin/${id}`), {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        isDeleted: true,
        // Include orgId to ensure proper authorization
        orgId: getOrgIdFromToken(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return dispatch(softDeleteSubAdminRejected(
        errorData.message || "Failed to delete sub-admin"
      ));
    }

    const data = await response.json();
    dispatch(softDeleteSubAdminFulfilled(data));

    // Refresh the list after soft delete
    dispatch(fetchSubAdmins());
  } catch (error) {
    console.error("Soft delete sub-admin error:", error);
    dispatch(softDeleteSubAdminRejected(error.message || "Network error"));
  }
};
