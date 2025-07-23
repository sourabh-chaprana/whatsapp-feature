// Helper functions for booking calculations

import { formatCurrency as dynamicFormatCurrency } from "./currencyFunc";

export const calculateBookingStats = (bookings) => {
  if (!bookings || bookings.length === 0) {
    return {
      totalBookings: 0,
      totalValue: 0,
      totalPaid: 0,
      totalOutstanding: 0,
    };
  }

  const stats = bookings.reduce(
    (acc, booking) => {
      const paidAmount =
        booking.payments?.reduce((sum, payment) => {
          return sum + (payment.isPaid ? payment.amount : 0);
        }, 0) || 0;

      acc.totalBookings += 1;
      acc.totalValue += booking.value || 0;
      acc.totalPaid += paidAmount;
      acc.totalOutstanding += (booking.value || 0) - paidAmount;

      return acc;
    },
    {
      totalBookings: 0,
      totalValue: 0,
      totalPaid: 0,
      totalOutstanding: 0,
    }
  );

  return stats;
};

export const calculatePaymentProgress = (booking) => {
  if (!booking || !booking.payments) return 0;

  const totalAmount = booking.value || 0;
  const paidAmount = booking.payments.reduce((sum, payment) => {
    return sum + (payment.isPaid ? payment.amount : 0);
  }, 0);

  return totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;
};

export const getBookingStatusBadge = (status) => {
  const statusMap = {
    DRAFT: {
      variant: "outline",
      className: "bg-gray-100 text-gray-800",
      label: "Draft",
    },
    CONFIRMED: {
      variant: "outline",
      className: "bg-blue-100 text-blue-800",
      label: "Confirmed",
    },
    CANCELLED: {
      variant: "outline",
      className: "bg-red-100 text-red-800",
      label: "Cancelled",
    },
    COMPLETED: {
      variant: "outline",
      className: "bg-green-100 text-green-800",
      label: "Completed",
    },
  };

  return (
    statusMap[status] || { variant: "outline", className: "", label: status }
  );
};

// Replace the existing formatCurrency function with the dynamic one
export const formatCurrency = dynamicFormatCurrency;

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
