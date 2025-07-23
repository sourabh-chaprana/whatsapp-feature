import React, { useState, useEffect } from "react";
import { buildApiUrl } from "../../../utils/apiConfig";

const AuthenticatedImage = ({
  src,
  alt,
  className,
  style,
  onClick,
  customAttachment,
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!customAttachment) {
      // Not a custom attachment, use direct URL
      setImageSrc(src);
      setLoading(false);
      return;
    }

    // For custom attachments, fetch with authentication
    const fetchImageWithAuth = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Build the authenticated URL
        const fileUrl = buildApiUrl(
          `/bookings/files/view/${encodeURIComponent(customAttachment.fileUrl)}`
        );

        const response = await fetch(fileUrl, {
          method: "GET",
          headers: headers,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setImageSrc(blobUrl);
        setLoading(false);

        // Cleanup blob URL after 10 minutes
        setTimeout(() => URL.revokeObjectURL(blobUrl), 600000);
      } catch (error) {
        console.error("Error fetching authenticated image:", error);
        setError(true);
        setLoading(false);
      }
    };

    fetchImageWithAuth();

    // Cleanup on unmount
    return () => {
      if (imageSrc && imageSrc.startsWith("blob:")) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [src, customAttachment]);

  if (loading) {
    return (
      <div
        className={`${className} bg-gray-100 flex items-center justify-center`}
        style={style}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (error || !imageSrc) {
    return (
      <div
        className={`${className} bg-gray-100 flex flex-col items-center justify-center space-y-2`}
        style={style}
      >
        <i className="fas fa-image text-gray-400 text-2xl"></i>
        <span className="text-gray-600 text-sm">Image not available</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={style}
      onClick={onClick}
      onError={() => setError(true)}
    />
  );
};

export default AuthenticatedImage;
  