import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Calendar, Search, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Label } from "../../../components/ui/label";
import { fetchBookingByNumber } from "../../../store/slices/bookings/bookingThunk";
import { formatCurrency } from "../../../utils/currencyFunc";
import { formatName } from "../../../utils/textUtils";
import { formatDate } from "../../../utils/bookingUtils";
import { format } from "date-fns";
import SearchLeadForBooking from "../SearchLeadForBooking";
import normalizePhoneNumber from "../../../utils/normalizePhoneNumber";

const ListBookingModal = ({
  isOpen,
  onClose,
  phoneNumber,
  onSelectBooking,
  messageId,
  allowCreate = true,
  mode = "booking"
}) => {
  const dispatch = useDispatch();
  const { bookingsByPhone, loading: bookingsLoading } = useSelector((state) => state.bookings);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [showLeadSearch, setShowLeadSearch] = useState(false);

  // Function to fetch bookings with filters
  const fetchBookings = useCallback(() => {
    if (phoneNumber) {
      dispatch(fetchBookingByNumber({
        phoneNumber: normalizePhoneNumber(phoneNumber),
        value: "bookings"
      }));
    }
  }, [dispatch, phoneNumber]);

  // Fetch bookings when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedBookingId("");
      fetchBookings();
    }
  }, [isOpen, fetchBookings]);

  // Update filtered bookings when bookings data changes
  useEffect(() => {
    let bookingsData = [];
    
    // Match the structure used in RightSidebar
    if (bookingsByPhone?.data?.bookings && Array.isArray(bookingsByPhone.data.bookings)) {
      bookingsData = bookingsByPhone.data.bookings;
    } else if (bookingsByPhone?.data && Array.isArray(bookingsByPhone.data)) {
      bookingsData = bookingsByPhone.data;
    } else if (bookingsByPhone?.bookings && Array.isArray(bookingsByPhone.bookings)) {
      bookingsData = bookingsByPhone.bookings;
    }
    
    // Filter out deleted bookings
    const validBookings = bookingsData.filter(booking => !booking.isDeleted);
    setFilteredBookings(validBookings);
  }, [bookingsByPhone]);

  // Handle booking selection
  const handleSelect = () => {
    if (selectedBookingId) {
      const selectedBooking = filteredBookings.find(
        (booking) => booking._id === selectedBookingId
      );
      onSelectBooking(selectedBooking);
    } else {
      onClose();
    }
  };

  // Handle create new booking
  const handleCreateNewBooking = () => {
    setShowLeadSearch(true);
  };

  // Handle lead selection for new booking
  const handleLeadSelect = (selectedLead) => {
    setShowLeadSearch(false);
    onClose();
    
    if (selectedLead && selectedLead._id) {
      window.location.href = `/crm/bookings/new?client=${encodeURIComponent(
        selectedLead.name || ""
      )}&leadId=${selectedLead._id}&message_id=${encodeURIComponent(messageId || "")}`;
    } else {
      // If no lead is selected, just use the client name from the session
      window.location.href = `/crm/bookings/new?message_id=${encodeURIComponent(messageId || "")}`;
    }
  };

  const getTitle = () => {
    switch(mode) {
      case "payment":
        return "Select Booking for Payment";
      default:
        return "Select Booking for Attachment";
    }
  };

  const getDescription = () => {
    switch(mode) {
      case "payment":
        return "Choose a booking to attach this payment information";
      default:
        return "Choose a booking to attach this file or create a new booking";
    }
  };

  // Format date safely
  const safeFormatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, h:mm a");
    } catch (e) {
      return "Invalid Date";
    }
  };

  return (
    <>
      <Dialog open={isOpen && !showLeadSearch} onOpenChange={onClose}>
        <DialogContent
          className="sm:max-w-md"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-travel-purple">
              {getTitle()}
            </DialogTitle>
            <DialogDescription>
              {getDescription()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Create New Booking Button - only show if allowCreate is true */}
            {allowCreate && (
              <Button
                variant="outline"
                className="w-full border-travel-purple/20 text-travel-purple hover:bg-travel-purple/10"
                onClick={handleCreateNewBooking}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Booking
              </Button>
            )}

            {/* Bookings List */}
            <div className="max-h-64 overflow-y-auto border border-travel-purple/20 rounded-md">
              {bookingsLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-travel-purple"></div>
                </div>
              ) : filteredBookings && filteredBookings.length > 0 ? (
                <RadioGroup
                  value={selectedBookingId}
                  onValueChange={setSelectedBookingId}
                >
                  <div className="space-y-2 p-4">
                    {filteredBookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="flex items-center space-x-2 p-2 hover:bg-travel-lightpink/10 rounded"
                      >
                        <RadioGroupItem value={booking._id} id={booking._id} />
                        <Label
                          htmlFor={booking._id}
                          className="flex items-center space-x-2 cursor-pointer flex-1"
                        >
                          <div className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 border w-full">
                            {/* Icon */}
                            <div className="w-8 h-8 bg-gradient-to-r from-travel-purple to-travel-pink rounded-full flex items-center justify-center text-white text-sm mt-1.5">
                              <Calendar className="w-4 h-4" />
                            </div>

                            {/* Booking Info */}
                            <div className="flex flex-col w-full text-sm text-gray-700">
                              {/* Destination */}
                              <div className="font-medium text-gray-800">
                                {booking.itineraryName || "No destination"}
                              </div>

                              {/* Client Name */}
                              <div className="text-xs text-gray-600">
                                {booking.client || "No client name"}
                              </div>

                              {/* Amount */}
                              <div className="text-gray-900 font-semibold text-sm">
                                {formatCurrency(booking.value || 0)}
                              </div>

                              {/* Created On */}
                              <div className="text-xs text-gray-500 mt-1">
                                Booked On: {safeFormatDate(booking.createdAt)}
                              </div>

                              {/* Travel Dates */}
                              <div className="mt-1 text-xs text-gray-600 space-y-0.5">
                                <div>Travel Start: {formatDate(booking?.itineraryStartDate)}</div>
                                <div>Travel End: {formatDate(booking?.itineraryEndDate)}</div>
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No bookings available for this contact
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-travel-purple/20 text-travel-purple hover:bg-travel-purple/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSelect}
              disabled={!selectedBookingId}
              className="bg-gradient-to-r from-travel-purple to-travel-pink hover:from-travel-purple/90 hover:to-travel-pink/90 text-white"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lead Search Modal for creating new booking */}
      {showLeadSearch && (
        <SearchLeadForBooking
          isOpen={showLeadSearch}
          onClose={() => setShowLeadSearch(false)}
          phoneNumber={normalizePhoneNumber(phoneNumber)}
          onSelectLead={handleLeadSelect}
          openMenuId={messageId}
        />
      )}
    </>
  );
};

export default ListBookingModal;