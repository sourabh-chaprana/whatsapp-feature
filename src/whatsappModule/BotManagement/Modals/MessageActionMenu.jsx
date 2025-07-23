import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ListLeadFilterModal from "./ListLeadFilterModal";
import ListBookingModal from "./ListBookingModal";

const MessageActionMenu = ({ message, currentSession, onReply }) => {
  const [isThisMenuOpen, setIsThisMenuOpen] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [messageId, setMessageId] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsThisMenuOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsThisMenuOpen(!isThisMenuOpen);
  };

  // Check if message has attachment
  const hasAttachment = message.messageType === 'image' || 
    message.messageType === 'document' || 
    message.messageType === 'video' || 
    message.messageType === 'audio' || 
    (message.user && message.user.startsWith('data:')) ||
    (message.bot && (message.bot.mediaUrl || message.bot.videoUrl || message.bot.documentUrl));

  // Handle regular actions
  const handleCreateLead = () => {
    setIsThisMenuOpen(false);
    const name = currentSession?.name;
    const phoneNumber = currentSession?.phoneNumber || "";
    
    navigate(
      `/crm/leads/new?name=${encodeURIComponent(
        name
      )}&phoneNumber=${encodeURIComponent(
        phoneNumber
      )}&message_id=${encodeURIComponent(message._id)}`
    );
  };

  const handleCreateBooking = () => {
    setIsThisMenuOpen(false);
    setMessageId(message._id);
    setShowBookingModal(true);
  };

  const handleReply = () => {
    setIsThisMenuOpen(false);
    const messageContent =
      message.user ||
      (typeof message.bot === "string"
        ? message.bot
        : message.bot?.text || message.bot?.content || "message");
    onReply(messageContent);
  };

  // Handle attachment actions
  const handleAttachToLead = () => {
    setIsThisMenuOpen(false);
    setMessageId(message._id);
    setShowLeadModal(true);
  };

  const handleAttachToBooking = () => {
    setIsThisMenuOpen(false);
    setMessageId(message._id);
    setShowBookingModal(true);
  };

  const handleAttachToPayment = () => {
    setIsThisMenuOpen(false);
    setMessageId(message._id);
    setShowPaymentModal(true);
  };

  const handleLeadSelect = (selectedLead) => {
    setShowLeadModal(false);
    
    if (selectedLead) {
      // Navigate to lead edit page with message_id parameter
      navigate(
        `/crm/leads/edit/${selectedLead._id}?message_id=${message._id}`
      );
    }
  };

  const handleBookingSelect = (selectedBooking) => {
    setShowBookingModal(false);
    
    if (selectedBooking) {
      // Navigate to booking edit page with message_id parameter
      navigate(
        `/crm/bookings/edit/${selectedBooking._id}?message_id=${message._id}`
      );
    }
  };

  const handlePaymentSelect = (selectedBooking) => {
    setShowPaymentModal(false);
    
    if (selectedBooking) {
      // Navigate to payment page with message_id parameter and payment flag
      navigate(
        `/crm/bookings/edit/${selectedBooking._id}?message_id=${message._id}&attach_to=payment`
      );
    }
  };

  return (
    <div className="message-action-wrapper" ref={menuRef}>
      <button
        className={`message-dropdown-btn ${isThisMenuOpen ? "active" : ""}`}
        onClick={toggleMenu}
      >
        <i className="fas fa-ellipsis-v"></i>
      </button>

      {isThisMenuOpen && (
        <div className="message-action-menu">
          {hasAttachment ? (
            <>
              <button onClick={handleAttachToLead} className="message-action-btn">
                <i className="fas fa-user-plus"></i> Attach to Lead
              </button>
              <button onClick={handleAttachToBooking} className="message-action-btn">
                <i className="fas fa-calendar-plus"></i> Attach to Booking
              </button>
              <button onClick={handleAttachToPayment} className="message-action-btn">
                <i className="fas fa-credit-card"></i> Attach to Payment
              </button>
            </>
          ) : (
            <>
              <button onClick={handleCreateLead} className="message-action-btn">
                <i className="fas fa-user-plus"></i> Create Lead
              </button>
              <button onClick={handleCreateBooking} className="message-action-btn">
                <i className="fas fa-calendar-plus"></i> Create Booking
              </button>
            </>
          )}
          <button onClick={handleReply} className="message-action-btn">
            <i className="fas fa-reply"></i> Reply
          </button>
        </div>
      )}

      {/* Lead Modal */}
      <ListLeadFilterModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        phoneNumber={currentSession?.phoneNumber}
        onSelectLead={handleLeadSelect}
        messageId={messageId}
      />

      {/* Booking Modal */}
      <ListBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        phoneNumber={currentSession?.phoneNumber}
        onSelectBooking={handleBookingSelect}
        messageId={messageId}
        allowCreate={true}
        mode="booking"
      />

      {/* Payment Modal - reuse booking modal with different mode */}
      <ListBookingModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        phoneNumber={currentSession?.phoneNumber}
        onSelectBooking={handlePaymentSelect}
        messageId={messageId}
        allowCreate={false}
        mode="payment"
      />
    </div>
  );
};

export default MessageActionMenu;
