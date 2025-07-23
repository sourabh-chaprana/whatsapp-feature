import React, { useRef } from "react";
import { useSelector } from "react-redux";
import LeadCardView from "./LeadCardView";
import BookingCardView from "./BookingCardView";
import "./RightSidebar.css";

const RightSidebar = ({
  isOpen,
  onClose,
  activeTab,
  currentSession,
  // selectedAgents,
}) => {
  const { leads, loading } = useSelector((state) => state.leads);
  const { bookingsByPhone, loading: bookingsLoading } = useSelector((state) => state.bookings);
  const sidebarRef = useRef(null);

  // Don't render anything if no valid tab is selected
  if (!activeTab || !isOpen) {
    return null;
  }

  // Handle backdrop clicks - only close if clicking outside sidebar AND not on dropdown menus
  const handleBackdropClick = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      // Check if the click is on a dropdown menu
      const isDropdownClick =
        e.target.closest("[data-radix-popper-content-wrapper]") ||
        e.target.closest(".dropdown-menu") ||
        e.target.closest('[role="menu"]') ||
        e.target.closest('[data-state="open"]');

      if (!isDropdownClick) {
        onClose();
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "leads":
        return (
          <div className="right-sidebar-content">
            <div className="right-sidebar-header">
              <div className="right-sidebar-title-section">
                <h3>
                  Leads for{" "}
                  {currentSession?.name || currentSession?.phoneNumber}
                </h3>
                <p className="right-sidebar-subtitle">
                  Phone: {currentSession?.phoneNumber}
                </p>
              </div>
              <button className="right-sidebar-close" onClick={onClose}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="right-sidebar-body">
              {loading ? (
                <div className="loading-state">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Loading leads...</span>
                </div>
              ) : (
                <div className="sidebar-card-container">
                  <LeadCardView leads={leads} />
                </div>
              )}
            </div>
          </div>
        );
      case "bookings":
        return (
          <div className="right-sidebar-content">
            <div className="right-sidebar-header">
              <div className="right-sidebar-title-section">
                <h3>Bookings</h3>
                <p className="right-sidebar-subtitle">
                  For {currentSession?.name || currentSession?.phoneNumber}
                </p>
              </div>
              <button className="right-sidebar-close" onClick={onClose}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="right-sidebar-body">
              {bookingsLoading ? (
                <div className="loading-state">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Loading bookings...</span>
                </div>
              ) : bookingsByPhone && bookingsByPhone.data && bookingsByPhone.data.bookings && bookingsByPhone.data.bookings.length > 0 ? (
                <div className="sidebar-card-container">
                  <BookingCardView bookings={bookingsByPhone.data.bookings} />
                </div>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-calendar-alt"></i>
                  <h4>No bookings found</h4>
                  <p>No bookings available for this contact</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const content = renderContent();

  if (!content) {
    return null;
  }

  return (
    <>
      {/* Backdrop/Overlay with smart click handling */}
      <div
        className="right-sidebar-backdrop"
        onClick={handleBackdropClick}
      ></div>

      {/* Sidebar */}
      <div className="right-sidebar open" ref={sidebarRef}>
        {content}
      </div>
    </>
  );
};

export default RightSidebar;
