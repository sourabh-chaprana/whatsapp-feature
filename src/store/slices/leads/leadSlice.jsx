import { createSlice } from "@reduxjs/toolkit";
import {
  fetchLeads,
  createLead,
  updateLead,
  deleteLead,
  getAllLeadsWithSearchFilter,
  fetchLeadById,
  fetchLeadBookings,
  fetchLeadPayments,
  assignAgentToLead,
  fetchPriorityScoreAttributes,
  importLeads,
  downloadImportFile,
} from "./leadThunk";

// Define lead status and source enums
export const LeadStatus = {
  NEW: "new",
  CONTACTED: "contacted",
  QUALIFIED: "qualified",
  PROPOSAL: "proposal",
  NEGOTIATION: "negotiation",
  BOOKED: "booked",
  LOST: "lost",
};

export const LeadSource = {
  WEBSITE: "website",
  REFERRAL: "referral",
  SOCIAL: "social",
  EMAIL: "email",
  PHONE: "phone",
  WHATSAPP: "whatsapp",
  MARKETPLACE: "marketplace",
  OTHER: "other",
};

const initialState = {
  leads: [],
  loading: false,
  error: null,
  currentLead: null,
  pagination: {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  priorityScoreAttributes: [],
  timelineData: {
    bookings: [],
    payments: [],
    loading: false,
    error: null,
  },
  importResult: null,
  importLoading: false,
  downloadLoading: false,
};

const leadSlice = createSlice({
  name: "leads",
  initialState,
  reducers: {
    clearLeadErrors: (state) => {
      state.error = null;
    },
    setCurrentLead: (state, action) => {
      state.currentLead = action.payload;
    },
    clearCurrentLead: (state) => {
      state.currentLead = null;
    },
    clearImportResult: (state) => {
      state.importResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Leads
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch leads";
      })

      // Create Lead
      .addCase(createLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload;
      })
      .addCase(createLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create lead";
      })

      // Update Lead
      .addCase(updateLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.loading = false;
        // Find and update the lead in the list if it exists
        const updatedLead = action.payload;
        const index = state.leads.findIndex(
          (lead) => lead._id === updatedLead._id
        );
        if (index !== -1) {
          state.leads[index] = updatedLead;
        }
        // Also update currentLead if it's the same lead
        if (state.currentLead && state.currentLead._id === updatedLead._id) {
          state.currentLead = updatedLead;
        }
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update lead";
      })

      // Delete Lead
      .addCase(deleteLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = state.leads.filter((lead) => lead._id !== action.payload);
      })
      .addCase(deleteLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete lead";
      })

      // Get Leads with search filter
      .addCase(getAllLeadsWithSearchFilter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllLeadsWithSearchFilter.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload.data.leads || [];
        state.pagination = {
          currentPage: action.payload.page || 1,
          totalItems: action.payload.total || 0,
          itemsPerPage: action.payload.limit || 10,
        };
      })
      .addCase(getAllLeadsWithSearchFilter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch leads";
      })

      // Fetch Lead By ID
      .addCase(fetchLeadById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeadById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLead = action.payload.data.lead;
      })
      .addCase(fetchLeadById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch lead details";
      })

      // Fetch Lead Bookings
      .addCase(fetchLeadBookings.pending, (state) => {
        state.timelineData.loading = true;
        state.timelineData.error = null;
      })
      .addCase(fetchLeadBookings.fulfilled, (state, action) => {
        state.timelineData.bookings = action.payload;
      })
      .addCase(fetchLeadBookings.rejected, (state, action) => {
        state.timelineData.loading = false;
        state.timelineData.error = action.payload;
      })

      // Fetch Lead Payments
      .addCase(fetchLeadPayments.pending, (state) => {
        state.timelineData.loading = true;
        state.timelineData.error = null;
      })
      .addCase(fetchLeadPayments.fulfilled, (state, action) => {
        state.timelineData.payments = action.payload;
        state.timelineData.loading = false;
      })
      .addCase(fetchLeadPayments.rejected, (state, action) => {
        state.timelineData.loading = false;
        state.timelineData.error = action.payload;
      })

      // Assign Agent to Lead
      .addCase(assignAgentToLead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignAgentToLead.fulfilled, (state, action) => {
        state.loading = false;
        const { leadId, assignedUser } = action.payload;

        // Update the lead in the leads array
        const leadIndex = state.leads.findIndex((lead) => lead._id === leadId);
        if (leadIndex !== -1) {
          state.leads[leadIndex].assignedUser = assignedUser;
        }

        // Update currentLead if it's the same lead
        if (state.currentLead && state.currentLead._id === leadId) {
          state.currentLead.assignedUser = assignedUser;
        }
      })
      .addCase(assignAgentToLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to assign agent";
      })

      // Fetch Priority Score Attributes
      .addCase(fetchPriorityScoreAttributes.fulfilled, (state, action) => {
        state.priorityScoreAttributes = action.payload;
      })
      .addCase(fetchPriorityScoreAttributes.rejected, (state, action) => {
        state.error =
          action.payload || "Failed to fetch priority score attributes";
      })

      // Import Leads
      .addCase(importLeads.pending, (state) => {
        state.importLoading = true;
        state.error = null;
      })
      .addCase(importLeads.fulfilled, (state, action) => {
        state.importLoading = false;
        state.importResult = action.payload;
      })
      .addCase(importLeads.rejected, (state, action) => {
        state.importLoading = false;
        state.error = action.payload || "Failed to import leads";
      })

      // Download Import File
      .addCase(downloadImportFile.pending, (state) => {
        state.downloadLoading = true;
        state.error = null;
      })
      .addCase(downloadImportFile.fulfilled, (state) => {
        state.downloadLoading = false;
      })
      .addCase(downloadImportFile.rejected, (state, action) => {
        state.downloadLoading = false;
        state.error = action.payload || "Failed to download file";
      });
  },
});

export const {
  clearLeadErrors,
  setCurrentLead,
  clearCurrentLead,
  clearImportResult,
} = leadSlice.actions;
export default leadSlice.reducer;
