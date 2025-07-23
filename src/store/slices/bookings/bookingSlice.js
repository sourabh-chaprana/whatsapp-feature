import { createSlice } from "@reduxjs/toolkit";
import {
  fetchBookings,
  fetchBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  updatePaymentStatus,
  fetchBookingByNumber,
} from "./bookingThunk";

// Booking status enums
export const BookingStatus = {
  DRAFT: "DRAFT",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
};

// Payment status enums
export const PaymentStatus = {
  PENDING: "PENDING",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
  REFUNDED: "REFUNDED",
};

const initialState = {
  // Data
  bookings: [],
  currentBooking: null,
  bookingsByPhone: null,

  // Pagination
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  },

  // UI State
  loading: false,
  error: null,

  // Filters and sorting
  filters: {
    status: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
};

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    // UI actions
    clearError: (state) => {
      state.error = null;
    },
    setCurrentBooking: (state, action) => {
      state.currentBooking = action.payload;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },

    // Filter actions
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    clearFilters: (state) => {
      state.filters = {
        status: "",
        search: "",
        sortBy: "createdAt",
        sortOrder: "desc",
      };
    },

    // Pagination actions
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1; // Reset to first page
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Bookings
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.data.bookings;

        // Update pagination
        state.pagination = {
          currentPage: action.payload.page,
          totalPages: Math.ceil(action.payload.total / action.payload.limit),
          totalItems: action.payload.total,
          itemsPerPage: action.payload.limit,
          hasNextPage:
            action.payload.page <
            Math.ceil(action.payload.total / action.payload.limit),
          hasPrevPage: action.payload.page > 1,
        };
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Booking by ID
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Don't automatically fetch bookings here since we'll be redirecting
        // The BookingsPage will fetch fresh data when mounted
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Booking
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.loading = false;
        // The fetchBookings will be called automatically after update
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Booking
      .addCase(deleteBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.loading = false;
        // The fetchBookings will be called automatically after deletion
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Payment Status
      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        // The fetchBookings will be called automatically after payment update
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Bookings by Phone Number
      .addCase(fetchBookingByNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingByNumber.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingsByPhone = action.payload;
      })
      .addCase(fetchBookingByNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setCurrentBooking,
  clearCurrentBooking,
  setFilter,
  clearFilters,
  setCurrentPage,
  setItemsPerPage,
} = bookingSlice.actions;

export default bookingSlice.reducer;
