import { createSlice } from "@reduxjs/toolkit";
import {
  searchOrganizations,
  fetchPriorityScoreByOrgId,
  updatePriorityScore,
} from "./organizationThunk";

const initialState = {
  searchResults: [],
  isLoading: false,
  error: null,
  priorityScoreData: null,
  isPriorityScoreLoading: false,
  priorityScoreError: null,
  isUpdating: false,
  updateError: null,
  pagination: {
    total: 0,
    pages: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
  search: {
    term: "",
    resultsCount: 0,
  },
};

const organizationsSlice = createSlice({
  name: "organizations",
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.search.term = "";
      state.search.resultsCount = 0;
    },
    clearPriorityScoreData: (state) => {
      state.priorityScoreData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchOrganizations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchOrganizations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.organizations;
        state.pagination = action.payload.pagination;
        state.search = action.payload.search;
      })
      .addCase(searchOrganizations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to search organizations";
      })
      .addCase(fetchPriorityScoreByOrgId.pending, (state) => {
        state.isPriorityScoreLoading = true;
        state.priorityScoreError = null;
      })
      .addCase(fetchPriorityScoreByOrgId.fulfilled, (state, action) => {
        state.isPriorityScoreLoading = false;
        state.priorityScoreData = action.payload;
      })
      .addCase(fetchPriorityScoreByOrgId.rejected, (state, action) => {
        state.isPriorityScoreLoading = false;
        state.priorityScoreError =
          action.payload || "Failed to fetch priority score data";
      })
      .addCase(updatePriorityScore.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updatePriorityScore.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.priorityScoreData = action.payload;
      })
      .addCase(updatePriorityScore.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload || "Failed to update priority score";
      });
  },
});

export const { clearSearchResults, clearPriorityScoreData } =
  organizationsSlice.actions;
export default organizationsSlice.reducer;
