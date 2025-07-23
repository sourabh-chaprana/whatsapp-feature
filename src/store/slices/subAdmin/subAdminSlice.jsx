import { createSlice } from "@reduxjs/toolkit";

export const SubAdminRole = {
  ADMIN: "ADMIN",
  SUB_ADMIN: "SUB_ADMIN",
  EMPLOYER: "EMPLOYER",
  LABOUR: "LABOUR"
};

const initialState = {
  subAdmins: [],
  loading: false,
  error: null,
  currentSubAdmin: null,
  pagination: {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10
  }
};

const subAdminSlice = createSlice({
  name: "subAdmins",
  initialState,
  reducers: {
    clearSubAdminErrors: (state) => {
      state.error = null;
    },
    setCurrentSubAdmin: (state, action) => {
      state.currentSubAdmin = action.payload;
    },
    clearCurrentSubAdmin: (state) => {
      state.currentSubAdmin = null;
    },
    
    // Fetch SubAdmins
    fetchSubAdminsPending: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSubAdminsFulfilled: (state, action) => {
      state.loading = false;
      state.subAdmins = action.payload.data || [];
    },
    fetchSubAdminsRejected: (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch sub-admins";
    },
    
    // Create SubAdmin
    createSubAdminPending: (state) => {
      state.loading = true;
      state.error = null;
    },
    createSubAdminFulfilled: (state, action) => {
      state.loading = false;
      // Will be updated through fetchSubAdmins
    },
    createSubAdminRejected: (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to create sub-admin";
    },
    
    // Update SubAdmin
    updateSubAdminPending: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateSubAdminFulfilled: (state, action) => {
      state.loading = false;
      const updatedSubAdmin = action.payload.data;
      if (updatedSubAdmin) {
        const index = state.subAdmins.findIndex(admin => admin._id === updatedSubAdmin._id);
        if (index !== -1) {
          state.subAdmins[index] = updatedSubAdmin;
        }
        if (state.currentSubAdmin && state.currentSubAdmin._id === updatedSubAdmin._id) {
          state.currentSubAdmin = updatedSubAdmin;
        }
      }
    },
    updateSubAdminRejected: (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to update sub-admin";
    },
    
    // Fetch SubAdmin By ID
    fetchSubAdminByIdPending: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSubAdminByIdFulfilled: (state, action) => {
      state.loading = false;
      state.currentSubAdmin = action.payload.data || action.payload;
    },
    fetchSubAdminByIdRejected: (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch sub-admin details";
    },
    
    // Soft Delete SubAdmin
    softDeleteSubAdminPending: (state) => {
      state.loading = true;
      state.error = null;
    },
    softDeleteSubAdminFulfilled: (state, action) => {
      state.loading = false;
      // Will be refreshed by the fetchSubAdmins call in the thunk
    },
    softDeleteSubAdminRejected: (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to delete sub-admin";
    }
  }
});

export const { 
  clearSubAdminErrors, 
  setCurrentSubAdmin, 
  clearCurrentSubAdmin,
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
} = subAdminSlice.actions;

export default subAdminSlice.reducer;
