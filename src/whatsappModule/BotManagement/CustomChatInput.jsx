// ChatInput.js
import React, { useRef, useEffect, useState, useCallback } from "react";
import { SendHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import API_CONFIG from "../../utils/apiConfig";

const ChatInput = React.memo(({ 
  messageText, 
  setMessageText, 
  handleSendMessage, 
  loading,
  isExpired = false,
  currentSessionId,
  currentSession
}) => {
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [caption, setCaption] = useState("");
  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const isAnotherInputFocused = () => {
    const activeEl = document.activeElement;
    return activeEl && activeEl.tagName === 'INPUT' && activeEl !== inputRef.current;
  };
  
  // Reset all states when switching between chats
  useEffect(() => {
    // Clear message text when changing sessions
    setMessageText("");
    
    // Reset all other states
    setIsUploading(false);
    setIsSending(false);
    setCaption("");
    setShowCaptionInput(false);
    setUploadedFile(null);
    setPreviewUrl(null);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    // Focus on input field
    if (!loading && !isExpired && inputRef.current && !isAnotherInputFocused()) {
      inputRef.current.focus();
    }
  }, [currentSessionId, setMessageText]);
  
  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }
    
    // Create local preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
    
    setIsUploading(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'whatsapp');
      formData.append('resourceId', currentSessionId || 'temp');
      
      // Upload file to server
      const response = await fetch(API_CONFIG.BASE_URL + '/api/webhooks/media', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('File upload failed');
      }
      
      const data = await response.json();
      
      // Store uploaded file data
      setUploadedFile({
        url: data.url,
        mediaType: data.mediaType,
        fileName: data.fileName,
        fileType: data.fileType
      });
      
      // For images and videos, show caption input
      if (data.mediaType === 'image' || data.mediaType === 'video') {
        setShowCaptionInput(true);
      } else {
        // For documents and audio, send immediately
        await handleSendMedia(data.url, data.mediaType, "", data.fileName);
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file: " + error.message);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  // Send media message
  const handleSendMedia = async (mediaUrl, mediaType, captionText, fileName) => {
    if (!currentSession) {
      toast.error("No active conversation");
      return;
    }
    
    // Prevent double sending
    if (isSending) return;
    
    setIsSending(true);
    
    try {
      // Show sending indicator
      const loadingToast = toast.loading(`Sending ${mediaType}...`);
      
      // Send media via WhatsApp API
      const response = await fetch(
        API_CONFIG.BASE_URL + "/api/webhooks/send-media",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            to: currentSession.phoneNumber,
            mediaUrl,
            mediaType,
            caption: captionText,
            sessionId: currentSession._id,
            phoneNumberId:
              currentSession.phoneNumberId ||
              process.env.REACT_APP_DEFAULT_PHONE_NUMBER_ID,
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to send media');
      }
      
      toast.dismiss(loadingToast);
      toast.success(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} sent successfully`);
      
      // Reset states
      setShowCaptionInput(false);
      setCaption("");
      setUploadedFile(null);
      setPreviewUrl(null);
      
    } catch (error) {
      console.error("Media send error:", error);
      toast.error("Failed to send media: " + error.message);
    } finally {
      setIsSending(false);
    }
  };
  
  // Handle caption submission
  const handleCaptionSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSending) return;
    
    if (uploadedFile) {
      await handleSendMedia(uploadedFile.url, uploadedFile.mediaType, caption, uploadedFile.fileName);
    }
  };
  
  // Cancel media upload
  const cancelMediaUpload = () => {
    setShowCaptionInput(false);
    setCaption("");
    setUploadedFile(null);
    setPreviewUrl(null);
  };
  
  // Trigger file input click
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  if (isExpired) {
    return (
      <div className="expired-conversation-notice">
        <p>
          <i className="fas fa-exclamation-triangle mr-2"></i>
          This conversation is more than 24 hours old. Starting a new conversation is recommended.
        </p>
      </div>
    );
  }
  
  if (showCaptionInput) {
    return (
      <div className="media-caption-container">
        {previewUrl && uploadedFile?.mediaType === 'image' && (
          <div className="media-preview-container" style={{ background: '#e5ddd5' }}>
            <img src={previewUrl} alt="Preview" className="media-preview-image" />
          </div>
        )}
        <form className="comm-channel-chat-input" onSubmit={handleCaptionSubmit}>
          <button 
            type="button" 
            className="cancel-upload-btn"
            onClick={cancelMediaUpload}
            disabled={isSending}
          >
            <i className="fa fa-times"></i>
          </button>
          <input
            ref={inputRef}
            type="text"
            placeholder={`Add caption for ${uploadedFile?.mediaType || 'media'}...`}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isSending}
            autoFocus
          />
          <button 
            type="submit" 
            disabled={isSending || isUploading}
          >
            {isSending ? (
              <i className="fa fa-spinner fa-spin"></i>
            ) : (
              <i className="fa fa-paper-plane"></i>
            )}
          </button>
        </form>
        {isSending && (
          <div className="sending-indicator">
            <span>Sending image...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <form className="comm-channel-chat-input" onSubmit={handleSendMessage}>
      <i className="fa fa-smile-o"></i>
      <i 
        className="fa fa-paperclip"
        onClick={openFileSelector}
        style={{ cursor: isUploading || isSending ? 'not-allowed' : 'pointer' }}
        disabled={isUploading || isSending}
      ></i>
      <input
        ref={inputRef}
        type="text"
        placeholder="Type a message..."
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        disabled={loading || isExpired || isUploading || isSending}
      />
      {messageText.trim() && (
        <button 
          type="submit" 
          disabled={loading || isExpired || isUploading || isSending}
        >
          {isUploading || isSending ? (
            <i className="fa fa-spinner fa-spin"></i>
          ) : (
            <i className="fa fa-paper-plane"></i>
          )}
        </button>
      )}
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        disabled={isUploading || isSending}
      />
    </form>
  );
});

export default ChatInput;
