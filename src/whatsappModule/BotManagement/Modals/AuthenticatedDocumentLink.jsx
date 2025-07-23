import React, { useState } from "react";
import { toast } from "sonner";
import { buildApiUrl } from "../../../utils/apiConfig";

const AuthenticatedDocumentLink = ({
  url,
  fileName,
  customAttachment,
  children,
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();

    if (!customAttachment) {
      // Not a custom attachment, open directly
      window.open(url, "_blank");
      return;
    }

    // For custom attachments, fetch with authentication
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

      // Open in new tab
      window.open(blobUrl, "_blank");

      // Clean up blob URL after 5 minutes
      setTimeout(() => URL.revokeObjectURL(blobUrl), 300000);
    } catch (error) {
      console.error("Error fetching authenticated document:", error);
      toast.error("Failed to open document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      className="text-blue-600 text-xs hover:underline"
      style={{ pointerEvents: loading ? "none" : "auto" }}
    >
      {loading ? "Opening..." : children}
    </a>
  );
};

export default AuthenticatedDocumentLink;
  
  