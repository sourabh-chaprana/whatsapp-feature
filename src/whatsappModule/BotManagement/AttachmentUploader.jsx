import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { buildApiUrl, getAuthHeaders } from "../../utils/apiConfig";

const AttachmentUploader = ({ onAttachmentComplete, currentSession }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const handleAttachmentClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 16MB for WhatsApp)
    const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large. Maximum size is 16MB.");
      return;
    }
    
    // Check if we have a current session
    if (!currentSession || !currentSession._id) {
      toast.error("No active conversation selected");
      return;
    }
    
    setUploading(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'whatsapp');
      formData.append('resourceId', currentSession._id);
      
      // Upload the file
      const response = await fetch(buildApiUrl('/webhooks/attachment'), {
        method: 'POST',
        headers: getAuthHeaders(true, true), // Set multipart to true
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      // Determine file type
      let messageType = 'document';
      if (file.type.startsWith('image/')) {
        messageType = 'image';
      } else if (file.type.startsWith('video/')) {
        messageType = 'video';
      } else if (file.type.startsWith('audio/')) {
        messageType = 'audio';
      }
      
      // Call the callback with file info
      onAttachmentComplete({
        url: data.url,
        key: data.key,
        filename: file.name,
        type: messageType,
        mimeType: file.type
      });
      
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <>
      <i 
        className={`fa fa-paperclip ${uploading ? 'uploading' : ''}`} 
        onClick={handleAttachmentClick}
        style={{ cursor: uploading ? 'wait' : 'pointer' }}
        title="Attach a file"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        disabled={uploading}
      />
    </>
  );
};

export default AttachmentUploader;