import React, { useState, useCallback, useRef } from "react";
import API_CONFIG from "../../utils/apiConfig";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

const UserMessage = ({ msg }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const videoRef = useRef(null);

  // Handle image click for modal
  const handleImageClick = useCallback((e) => {
    e.stopPropagation(); // Stop event propagation to prevent parent handlers
    setIsImageModalOpen(true);
  }, []);

  // Handle video fullscreen
  const toggleVideoFullscreen = useCallback((e) => {
    e.stopPropagation();
    
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  }, []);

  // Close image modal
  const closeImageModal = useCallback(() => {
    setIsImageModalOpen(false);
  }, []);

  if (!msg) return null;

  // Handle text messages
  if (msg.messageType === "text" || !msg.messageType) {
    return <div>{msg.user}</div>;
  }
  
  // Handle image messages
  if (msg.messageType === "image") {
    // Check if it's a base64 image
    const isBase64 = typeof msg.user === "string" && msg.user.startsWith("data:");
    
    let imageUrl = msg.user;
    
    return (
      <div className="user-media-message" onClick={(e) => e.stopPropagation()}>
        <div className="media-container">
          <img 
            src={imageUrl} 
            alt="User sent" 
            className="user-image" 
            onClick={handleImageClick}
            style={{ cursor: "zoom-in" }}
          />
          
          <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
            <DialogContent className="image-dialog-content">
              <DialogHeader>
                <DialogTitle>Image Preview</DialogTitle>
              </DialogHeader>
              <div className="image-dialog-body">
                <img 
                  src={imageUrl} 
                  alt="Enlarged" 
                  className="dialog-image"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {msg.mediaCaption && (
          <div className="media-caption">{msg.mediaCaption}</div>
        )}
      </div>
    );
  }

  // Handle video messages
  if (msg.messageType === "video") {
    // Check if it's a base64 video
    const isBase64 = typeof msg.user === "string" && msg.user.startsWith("data:");
    
    let videoUrl = msg.user;
    
    return (
      <div className="user-media-message" onClick={(e) => e.stopPropagation()}>
        <div className="video-container">
          <video 
            ref={videoRef}
            controls 
            className="user-video" 
            onClick={(e) => e.stopPropagation()}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div 
            className="video-zoom-overlay" 
            onClick={toggleVideoFullscreen}
            title="Click to view in fullscreen"
          >
            <i className="fas fa-expand"></i>
          </div>
        </div>
        {msg.mediaCaption && (
          <div className="media-caption">{msg.mediaCaption}</div>
        )}
      </div>
    );
  }

  // Handle document messages (including PDFs)
  if (msg.messageType === "document") {
    const fileName = msg.document?.filename || "Document";
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    
    // Document URL is directly from S3 now
    const docUrl = msg.user;
    
    return (
      <div className="user-media-message" onClick={(e) => e.stopPropagation()}>
        <div className="document-container">
          <i className={`fas ${isPdf ? 'fa-file-pdf' : 'fa-file'}`}></i>
          <a 
            href={docUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            📄 {fileName}
          </a>
        </div>
        
        {isPdf && (
          <div className="pdf-preview" onClick={(e) => e.stopPropagation()}>
            <iframe 
              src={docUrl}
              title="PDF Document" 
              width="100%" 
              height="300px"
              style={{ border: "1px solid #ddd", borderRadius: "4px", marginTop: "8px" }}
            />
            
            <div className="pdf-actions">
              <a 
                href={docUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="pdf-action-btn"
                onClick={(e) => e.stopPropagation()}
              >
                <i className="fas fa-external-link-alt"></i> Open in New Tab
              </a>
              <a 
                href={docUrl}
                download={fileName}
                className="pdf-action-btn"
                onClick={(e) => e.stopPropagation()}
              >
                <i className="fas fa-download"></i> Download
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Handle location messages
  if (msg.messageType === "location" && msg.user.includes("Location:")) {
    const locationMatch = msg.user.match(/Location: (-?\d+\.\d+), (-?\d+\.\d+)/);
    if (locationMatch) {
      const [_, latitude, longitude] = locationMatch;
      const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      
      return (
        <div className="user-media-message" onClick={(e) => e.stopPropagation()}>
          <div className="location-container">
            <i className="fas fa-map-marker-alt"></i>
            <a 
              href={mapUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              View Location on Map
            </a>
            <p className="location-coordinates">
              {msg.user}
            </p>
          </div>
        </div>
      );
    }
  }

  // Handle contact messages
  if (msg.messageType === "contacts") {
    return (
      <div className="user-media-message" onClick={(e) => e.stopPropagation()}>
        <div className="contacts-container">
          <i className="fas fa-address-card"></i>
          <span>Contact shared</span>
        </div>
      </div>
    );
  }

  // Handle audio messages
  if (msg.messageType === "audio" || msg.messageType === "voice") {
    // Check if it's a base64 audio
    const isBase64 = typeof msg.user === "string" && msg.user.startsWith("data:");
    
    let audioUrl = msg.user;
    
    return (
      <div className="user-media-message" onClick={(e) => e.stopPropagation()}>
        <div className="audio-container">
          <audio 
            controls 
            className="user-audio"
            onClick={(e) => e.stopPropagation()}
          >
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    );
  }

  // Fallback for other message types
  return <div>{msg.user}</div>;
};

export default UserMessage;
