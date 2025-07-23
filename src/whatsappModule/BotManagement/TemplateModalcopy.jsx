import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWhatsappTemplate } from "../../store/slices/whatsapp/whatsappThunk";
import { sendMessage } from "../../store/slices/chats/chatThunk";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";

const TemplateModal = ({ isOpen, onClose, templateType, currentSession }) => {
  const dispatch = useDispatch();
  const { templates, templateLoading, templateError } = useSelector(
    (state) => state.whatsapp
  );

  const [parsedTemplate, setParsedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // ✅ UPDATED: Custom editable values with base64 support
  const [customValues, setCustomValues] = useState({});
  const [customMedia, setCustomMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [customMediaBase64, setCustomMediaBase64] = useState(null); // ✅ NEW: Store base64
  const [activeTab, setActiveTab] = useState("edit");

  // Memoize template mapping to prevent infinite re-renders
  const templateMapping = useMemo(
    () => ({
      bookings: "travelpro_booking_status",
      thankyou: "travelpro_thank_you_booking",
      payment: "travelpro_invoice_payment",
    }),
    []
  );

  // ✅ NEW: Extract placeholders from template text
  const extractPlaceholders = (text) => {
    if (!text) return [];
    const matches = text.match(/\{\{\d+\}\}/g);
    return matches ? [...new Set(matches)].sort() : [];
  };

  // ✅ NEW: Get default values from API example
  const getDefaultValues = (templateData) => {
    if (!templateData?.success || !templateData?.data?.data?.[0]?.components) {
      return {};
    }

    const template = templateData.data.data[0];
    const bodyComponent = template.components.find((c) => c.type === "BODY");

    if (!bodyComponent?.example?.body_text?.[0]) {
      return {};
    }

    const defaultValues = {};
    bodyComponent.example.body_text[0].forEach((value, index) => {
      defaultValues[`{{${index + 1}}}`] = value;
    });

    return defaultValues;
  };

  // ✅ UPDATED: Parse template data with original text (not example-filled)
  const parseTemplateData = (templateData) => {
    if (!templateData?.success || !templateData?.data?.data?.[0]?.components) {
      return null;
    }

    const template = templateData.data.data[0];
    const components = template.components;

    let headerContent = null;
    let bodyContent = null;
    let footerContent = null;
    let headerType = null;
    let originalBodyText = null;

    components.forEach((component) => {
      switch (component.type) {
        case "HEADER":
          if (
            component.format === "IMAGE" &&
            component.example?.header_handle?.[0]
          ) {
            headerContent = component.example.header_handle[0];
            headerType = "IMAGE";
          } else if (
            component.format === "DOCUMENT" &&
            component.example?.header_handle?.[0]
          ) {
            headerContent = component.example.header_handle[0];
            headerType = "DOCUMENT";
          } else if (component.format === "TEXT" && component.text) {
            headerContent = component.text;
            headerType = "TEXT";
          }
          break;
        case "BODY":
          if (component.text) {
            // Keep the original template text with placeholders
            originalBodyText = component.text;
            bodyContent = component.text;
          }
          break;
        case "FOOTER":
          if (component.text) {
            footerContent = component.text;
          }
          break;
        default:
          break;
      }
    });

    return {
      name: template.name,
      headerContent,
      headerType,
      bodyContent,
      originalBodyText,
      footerContent,
      placeholders: extractPlaceholders(originalBodyText),
      hasContent: !!(headerContent || bodyContent || footerContent),
    };
  };

  // ✅ NEW: Replace placeholders with custom values
  const applyCustomValues = (text, values) => {
    if (!text) return text;

    let result = text;
    Object.entries(values).forEach(([placeholder, value]) => {
      // Replace placeholder with custom value
      result = result.replace(
        new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"),
        value
      );
    });

    // Replace \n\n with actual line breaks for display
    result = result.replace(/\\n\\n/g, "\n\n").replace(/\\n/g, "\n");

    return result;
  };

  // ✅ NEW: Convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // ✅ UPDATED: Handle file upload with base64 conversion
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type based on template header type
    if (parsedTemplate.headerType === "IMAGE") {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Check file size (limit to 5MB for images)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
    } else if (parsedTemplate.headerType === "DOCUMENT") {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }

      // Check file size (limit to 10MB for PDFs)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("PDF size should be less than 10MB");
        return;
      }
    }

    try {
      // Show loading state
      toast.loading("Processing file...", { id: "file-upload" });

      // Convert to base64 for permanent storage
      const base64 = await convertFileToBase64(file);

      // Create preview URL (this is just for preview, not for sending)
      const previewUrl = URL.createObjectURL(file);

      // Store both preview URL and base64
      setMediaPreview(previewUrl);
      setCustomMediaBase64(base64);
      setCustomMedia(file);

      toast.success("File uploaded successfully", { id: "file-upload" });
    } catch (error) {
      console.error("Error converting file to base64:", error);
      toast.error("Failed to process file", { id: "file-upload" });
    }
  };

  // ✅ NEW: Handle placeholder value change
  const handlePlaceholderChange = (placeholder, value) => {
    setCustomValues((prev) => ({
      ...prev,
      [placeholder]: value,
    }));
  };

  // ✅ NEW: Get placeholder label
  const getPlaceholderLabel = (placeholder, templateType) => {
    const placeholderLabels = {
      bookings: {
        "{{1}}": "Customer Name",
        "{{2}}": "Booking Status",
        "{{3}}": "Destination",
        "{{4}}": "Date",
        "{{5}}": "Booking ID",
        "{{6}}": "Company Name",
      },
      thankyou: {
        "{{1}}": "Customer Name",
        "{{2}}": "Company Name",
        "{{3}}": "Destination",
      },
      payment: {
        "{{1}}": "Customer Name",
        "{{2}}": "Amount",
        "{{3}}": "Invoice ID",
        "{{4}}": "Destination",
        "{{5}}": "Travel Date",
      },
    };

    return placeholderLabels[templateType]?.[placeholder] || placeholder;
  };

  // Fetch template when modal opens
  useEffect(() => {
    if (isOpen && templateType) {
      const templateName = templateMapping[templateType];
      if (!templateName) {
        toast.error("Unknown template type");
        return;
      }

      // Check if template is already cached
      const cachedTemplate = templates[templateName];
      if (cachedTemplate) {
        const parsed = parseTemplateData(cachedTemplate);
        setParsedTemplate(parsed);

        // Set default values from API example
        const defaults = getDefaultValues(cachedTemplate);
        setCustomValues(defaults);
        return;
      }

      // Fetch template if not cached
      setIsLoading(true);
      dispatch(fetchWhatsappTemplate(templateName))
        .unwrap()
        .then((result) => {
          const parsed = parseTemplateData(result.data);
          setParsedTemplate(parsed);

          // Set default values from API example
          const defaults = getDefaultValues(result.data);
          setCustomValues(defaults);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error loading template:", error);
          setIsLoading(false);

          // Better error handling
          if (error.includes("Facebook access token expired")) {
            toast.error(
              "Facebook connection expired. Please reconnect your WhatsApp Business account."
            );
          } else if (error.includes("WABA not configured")) {
            toast.error(
              "WhatsApp Business account not configured. Please complete setup."
            );
          } else {
            toast.error(`Failed to load ${templateType} template: ${error}`);
          }
        });
    }
  }, [isOpen, templateType, dispatch, templateMapping]);

  // ✅ UPDATED: Reset state when modal closes and cleanup blob URLs
  useEffect(() => {
    if (!isOpen) {
      // Cleanup blob URLs to prevent memory leaks
      if (mediaPreview && mediaPreview.startsWith("blob:")) {
        URL.revokeObjectURL(mediaPreview);
      }

      setParsedTemplate(null);
      setIsLoading(false);
      setSending(false);
      setCustomValues({});
      setCustomMedia(null);
      setMediaPreview(null);
      setCustomMediaBase64(null);
      setActiveTab("edit");
    }
  }, [isOpen]);

  // ✅ UPDATED: Handle send template with base64 images
  const handleSendTemplate = async () => {
    if (!currentSession || !parsedTemplate || sending) return;

    setSending(true);

    try {
      let messageData = {
        user: null,
        sessionId: currentSession._id,
        bot: null,
      };

      // ✅ FIXED: Use base64 for custom media, otherwise use original
      const finalMediaUrl = customMediaBase64 || parsedTemplate.headerContent;

      // Apply custom values to body text
      const finalBodyText = applyCustomValues(
        parsedTemplate.originalBodyText,
        customValues
      );

      if (parsedTemplate.headerType === "IMAGE") {
        // Send as template with image
        messageData.bot = {
          type: "template",
          templateType: "image_text",
          imageUrl: finalMediaUrl,
          headerText: null,
          bodyText: finalBodyText || "",
          footerText: parsedTemplate.footerContent || "",
          templateName: parsedTemplate.name,
        };
      } else if (parsedTemplate.headerType === "DOCUMENT") {
        // Send as template with document
        messageData.bot = {
          type: "template",
          templateType: "document_text",
          documentUrl: finalMediaUrl,
          headerText: null,
          bodyText: finalBodyText || "",
          footerText: parsedTemplate.footerContent || "",
          fileName: customMedia
            ? customMedia.name
            : `${templateType}_document.pdf`,
          templateName: parsedTemplate.name,
        };
      } else {
        // Text only template
        const textParts = [
          parsedTemplate.headerContent,
          finalBodyText,
          parsedTemplate.footerContent,
        ].filter(Boolean);

        messageData.bot = {
          type: "template",
          templateType: "text_only",
          headerText: parsedTemplate.headerContent,
          bodyText: finalBodyText,
          footerText: parsedTemplate.footerContent,
          fullText: textParts.join("\n\n"),
          templateName: parsedTemplate.name,
        };
      }

      // Send the message
      await dispatch(sendMessage(messageData)).unwrap();

      toast.success(
        `${
          templateType.charAt(0).toUpperCase() + templateType.slice(1)
        } template sent successfully`
      );
      onClose();
    } catch (error) {
      console.error("Error sending template:", error);
      toast.error("Failed to send template");
    } finally {
      setSending(false);
    }
  };

  // Get template display name
  const getTemplateDisplayName = () => {
    switch (templateType) {
      case "bookings":
        return "📅 Booking Status";
      case "thankyou":
        return "🎉 Thank You";
      case "payment":
        return "💳 Payment Invoice";
      default:
        return templateType;
    }
  };

  // Get template icon
  const getTemplateIcon = () => {
    switch (templateType) {
      case "bookings":
        return "fas fa-calendar-check";
      case "thankyou":
        return "fas fa-heart";
      case "payment":
        return "fas fa-credit-card";
      default:
        return "fas fa-file-alt";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-travel-purple flex items-center space-x-3">
            <i className={`${getTemplateIcon()} text-lg`}></i>
            <span>{getTemplateDisplayName()} Template</span>
          </DialogTitle>
          <DialogDescription>
            Customize and send template to{" "}
            <strong>{currentSession?.name || "the user"}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "edit"
                ? "text-travel-purple border-b-2 border-travel-purple"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("edit")}
          >
            <i className="fas fa-edit mr-2"></i>
            Edit Template
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "preview"
                ? "text-travel-purple border-b-2 border-travel-purple"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("preview")}
          >
            <i className="fas fa-eye mr-2"></i>
            Preview
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {isLoading || templateLoading[templateMapping[templateType]] ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-travel-purple"></div>
              <p className="text-gray-600">Loading template...</p>
            </div>
          ) : templateError ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <div className="bg-red-100 rounded-full p-3">
                <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-800 font-medium">
                  Failed to load template
                </p>
                <p className="text-gray-600 text-sm mt-1">{templateError}</p>
              </div>
            </div>
          ) : !parsedTemplate?.hasContent ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <div className="bg-yellow-100 rounded-full p-3">
                <i className="fas fa-exclamation-triangle text-yellow-500 text-xl"></i>
              </div>
              <p className="text-gray-800 font-medium">
                Template has no content
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {activeTab === "edit" ? (
                /* Edit Tab */
                <div className="space-y-6">
                  {/* Media Upload Section */}
                  {(parsedTemplate.headerType === "IMAGE" ||
                    parsedTemplate.headerType === "DOCUMENT") && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <i
                          className={`fas ${
                            parsedTemplate.headerType === "IMAGE"
                              ? "fa-image"
                              : "fa-file-pdf"
                          } mr-2`}
                        ></i>
                        {parsedTemplate.headerType === "IMAGE"
                          ? "Header Image"
                          : "Header Document"}
                      </h4>

                      {/* Current Media Preview */}
                      <div className="mb-4">
                        {parsedTemplate.headerType === "IMAGE" ? (
                          <img
                            src={mediaPreview || parsedTemplate.headerContent}
                            alt="Template header"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-red-100 rounded-full p-2">
                                <i className="fas fa-file-pdf text-red-600 text-lg"></i>
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {customMedia
                                    ? customMedia.name
                                    : "Document Attachment"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  PDF Document
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ✅ NEW: Show image not available fallback */}
                        <div className="hidden w-full h-32 bg-gray-100 rounded-lg border border-gray-200 flex-col items-center justify-center space-y-2">
                          <i className="fas fa-image text-gray-400 text-2xl"></i>
                          <span className="text-gray-600 text-sm">
                            Image not available
                          </span>
                        </div>
                      </div>

                      {/* File Upload */}
                      <div className="flex items-center space-x-3">
                        <label className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center space-x-2">
                          <i className="fas fa-upload"></i>
                          <span>
                            {parsedTemplate.headerType === "IMAGE"
                              ? "Upload Image"
                              : "Upload PDF"}
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept={
                              parsedTemplate.headerType === "IMAGE"
                                ? "image/*"
                                : ".pdf"
                            }
                            onChange={handleFileUpload}
                          />
                        </label>
                        {(mediaPreview || customMedia) && (
                          <button
                            onClick={() => {
                              // Cleanup blob URL
                              if (
                                mediaPreview &&
                                mediaPreview.startsWith("blob:")
                              ) {
                                URL.revokeObjectURL(mediaPreview);
                              }
                              setMediaPreview(null);
                              setCustomMedia(null);
                              setCustomMediaBase64(null);
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            <i className="fas fa-times mr-1"></i>
                            Reset
                          </button>
                        )}
                      </div>

                      {/* ✅ NEW: File size info */}
                      <p className="text-xs text-gray-500 mt-2">
                        {parsedTemplate.headerType === "IMAGE"
                          ? "Supported: JPG, PNG, GIF (Max 5MB)"
                          : "Supported: PDF only (Max 10MB)"}
                      </p>
                    </div>
                  )}

                  {/* Text Fields Section */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                      <i className="fas fa-edit mr-2"></i>
                      Customize Message Content
                    </h4>

                    <div className="space-y-4">
                      {parsedTemplate.placeholders.map((placeholder) => (
                        <div key={placeholder}>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            {getPlaceholderLabel(placeholder, templateType)}
                            <span className="text-gray-400 ml-1">
                              ({placeholder})
                            </span>
                          </label>
                          <input
                            type="text"
                            value={customValues[placeholder] || ""}
                            onChange={(e) =>
                              handlePlaceholderChange(
                                placeholder,
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-travel-purple focus:border-transparent"
                            placeholder={`Enter ${getPlaceholderLabel(
                              placeholder,
                              templateType
                            ).toLowerCase()}`}
                          />
                        </div>
                      ))}
                    </div>

                    {parsedTemplate.placeholders.length === 0 && (
                      <p className="text-gray-600 text-sm italic">
                        This template has no customizable fields.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                /* Preview Tab */
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <i className="fas fa-eye mr-2"></i>
                    Template Preview
                  </h4>

                  {/* Header Content */}
                  {parsedTemplate.headerContent && (
                    <div className="mb-4">
                      {parsedTemplate.headerType === "IMAGE" ? (
                        <div className="relative">
                          {/* ✅ UPDATED: Show base64 or preview for better reliability */}
                          <img
                            src={
                              customMediaBase64 ||
                              mediaPreview ||
                              parsedTemplate.headerContent
                            }
                            alt="Template header"
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                          <div className="hidden w-full h-48 bg-gray-100 rounded-lg border border-gray-200 flex-col items-center justify-center space-y-2">
                            <i className="fas fa-image text-gray-400 text-2xl"></i>
                            <span className="text-gray-600 text-sm">
                              Image preview not available
                            </span>
                          </div>
                        </div>
                      ) : parsedTemplate.headerType === "DOCUMENT" ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-red-100 rounded-full p-2">
                              <i className="fas fa-file-pdf text-red-600 text-lg"></i>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                {customMedia
                                  ? customMedia.name
                                  : "Document Attachment"}
                              </p>
                              <p className="text-sm text-gray-600">
                                PDF Document
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-blue-800 font-medium">
                            {parsedTemplate.headerContent}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Body Content with Custom Values */}
                  {parsedTemplate.originalBodyText && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                      <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                        {applyCustomValues(
                          parsedTemplate.originalBodyText,
                          customValues
                        )}
                      </p>
                    </div>
                  )}

                  {/* Footer Content */}
                  {parsedTemplate.footerContent && (
                    <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                      <p className="text-gray-600 text-sm">
                        {parsedTemplate.footerContent}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Template Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
                  <div>
                    <p className="text-blue-800 text-sm font-medium">
                      This template will be sent to{" "}
                      {currentSession?.name || "the user"}
                    </p>
                    <p className="text-blue-700 text-xs mt-1">
                      Template: {parsedTemplate.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={sending}
            className="border-travel-purple/20 text-travel-purple hover:bg-travel-purple/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendTemplate}
            disabled={isLoading || !parsedTemplate?.hasContent || sending}
            className="bg-gradient-to-r from-travel-purple to-travel-pink hover:from-travel-purple/90 hover:to-travel-pink/90 text-white"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane mr-2"></i>
                Send Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateModal;
