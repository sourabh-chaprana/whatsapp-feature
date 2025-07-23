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

  // Memoize template mapping to prevent infinite re-renders
  const templateMapping = useMemo(
    () => ({
      bookings: "travelpro_booking_status",
      thankyou: "travelpro_thank_you_booking",
      payment: "travelpro_invoice_payment",
    }),
    []
  );

  // Parse template data from new API response format
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
            // Use example text if available, otherwise use template text
            if (component.example?.body_text?.[0]) {
              // Replace placeholders with example values
              let text = component.text;
              component.example.body_text[0].forEach((value, index) => {
                text = text.replace(`{{${index + 1}}}`, value);
              });
              bodyContent = text;
            } else {
              bodyContent = component.text;
            }
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
      footerContent,
      hasContent: !!(headerContent || bodyContent || footerContent),
    };
  };

  // Fetch template when modal opens - FIXED dependency array
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
        return;
      }

      // Fetch template if not cached
      setIsLoading(true);
      dispatch(fetchWhatsappTemplate(templateName))
        .unwrap()
        .then((result) => {
          const parsed = parseTemplateData(result.data);
          setParsedTemplate(parsed);
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

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setParsedTemplate(null);
      setIsLoading(false);
      setSending(false);
    }
  }, [isOpen]);

  // Handle send template - UPDATED to send template like modal preview
  const handleSendTemplate = async () => {
    if (!currentSession || !parsedTemplate || sending) return;

    setSending(true);

    try {
      let messageData = {
        user: null,
        sessionId: currentSession._id,
        bot: null,
      };

      if (parsedTemplate.headerType === "IMAGE") {
        // Send as template with image
        messageData.bot = {
          type: "template",
          templateType: "image_text",
          imageUrl: parsedTemplate.headerContent,
          headerText: null,
          bodyText: parsedTemplate.bodyContent || "",
          footerText: parsedTemplate.footerContent || "",
          templateName: parsedTemplate.name,
        };
      } else if (parsedTemplate.headerType === "DOCUMENT") {
        // Send as template with document
        messageData.bot = {
          type: "template",
          templateType: "document_text",
          documentUrl: parsedTemplate.headerContent,
          headerText: null,
          bodyText: parsedTemplate.bodyContent || "",
          footerText: parsedTemplate.footerContent || "",
          fileName: `${templateType}_document.pdf`,
          templateName: parsedTemplate.name,
        };
      } else {
        // Text only template
        const textParts = [
          parsedTemplate.headerContent,
          parsedTemplate.bodyContent,
          parsedTemplate.footerContent,
        ].filter(Boolean);

        messageData.bot = {
          type: "template",
          templateType: "text_only",
          headerText: parsedTemplate.headerContent,
          bodyText: parsedTemplate.bodyContent,
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
      <DialogContent className="sm:max-w-md max-w-md w-full max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-travel-purple flex items-center space-x-3">
            <i className={`${getTemplateIcon()} text-lg`}></i>
            <span>{getTemplateDisplayName()} Template</span>
          </DialogTitle>
          <DialogDescription>
            Preview and send template to{" "}
            <strong>{currentSession?.name || "the user"}</strong>
          </DialogDescription>
        </DialogHeader>

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
            <div className="space-y-4">
              {/* Template Preview */}
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
                        <img
                          src={parsedTemplate.headerContent}
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
                              Document Attachment
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

                {/* Body Content */}
                {parsedTemplate.bodyContent && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                    <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                      {parsedTemplate.bodyContent}
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
