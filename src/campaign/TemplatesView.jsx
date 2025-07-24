import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { fetchWhatsAppTemplates } from "../store/slices/chats/chatThunk";

const TemplatesView = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("ALL");

  const { whatsappTemplates, fetchingTemplates, templatesError } = useSelector(
    (state) => state.chat
  );

  useEffect(() => {
    // Fetch templates if not already loaded
    if (whatsappTemplates.length === 0) {
      dispatch(fetchWhatsAppTemplates());
    }
  }, [dispatch, whatsappTemplates.length]);

  const handleBackToCampaign = () => {
    navigate("/campaign");
  };

  // Helper function to extract header image from components
  const getTemplateImage = (components) => {
    if (!components || !Array.isArray(components)) {
      return "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=200&fit=crop";
    }

    const headerComponent = components.find((comp) => comp.type === "HEADER");
    if (
      headerComponent &&
      headerComponent.format === "IMAGE" &&
      headerComponent.example?.header_handle?.[0]
    ) {
      return headerComponent.example.header_handle[0];
    }

    // Default fallback image
    return "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=200&fit=crop";
  };

  // Helper function to extract full text from template components
  const getTemplateText = (components) => {
    if (!components || !Array.isArray(components)) return "N/A";

    const bodyComponent = components.find((comp) => comp.type === "BODY");
    if (bodyComponent && bodyComponent.text) {
      return bodyComponent.text;
    }
    return "N/A";
  };

  // Helper function to get template title from components or name
  const getTemplateTitle = (template) => {
    if (!template.components || !Array.isArray(template.components)) {
      return template.name || "N/A";
    }

    const headerComponent = template.components.find(
      (comp) => comp.type === "HEADER"
    );
    if (headerComponent && headerComponent.text) {
      return headerComponent.text;
    }

    // Fallback to formatted name
    return template.name
      ? template.name.replace(/_/g, " ").toUpperCase()
      : "N/A";
  };

  // Helper function to format category
  const formatCategory = (category) => {
    if (!category) return "N/A";
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  };

  // Helper function to format language
  const getLanguageDisplay = (language) => {
    if (!language) return "N/A";

    const languageMap = {
      en: "English",
      en_US: "en_US",
      bn_IN: "bn_IN",
      hi: "Hindi",
      es: "Spanish",
      fr: "French",
    };
    return languageMap[language] || language;
  };

  // Transform API data to match UI format
  const transformedTemplates = whatsappTemplates.map((template) => ({
    id: template.id || "N/A",
    name: template.name || "N/A",
    category: template.category?.toUpperCase() || "N/A",
    language: getLanguageDisplay(template.language),
    status: template.status || "N/A",
    image: getTemplateImage(template.components),
    content: {
      text: getTemplateText(template.components),
    },
    title: getTemplateTitle(template),
  }));

  const filteredTemplates = transformedTemplates.filter((template) => {
    if (activeTab === "ALL") return true;
    return template.category === activeTab;
  });

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-travel-lightpink/10 via-white to-travel-purple/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={handleBackToCampaign}
              className="text-travel-purple hover:text-travel-purple/80 hover:bg-travel-purple/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Templates
            </Button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Templates</h1>

          {/* Filter Tabs */}
          <div className="flex gap-4 mt-6">
            {["ALL", "MARKETING", "UTILITY"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-travel-purple text-white shadow-sm"
                    : "text-gray-600 hover:text-travel-purple hover:bg-travel-purple/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {fetchingTemplates && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-travel-purple" />
            <span className="ml-2 text-gray-600">Loading templates...</span>
          </div>
        )}

        {/* Error State */}
        {templatesError && !fetchingTemplates && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="text-red-800">
              <h3 className="font-medium">Error loading templates</h3>
              <p className="text-sm mt-1">{templatesError}</p>
            </div>
            <Button
              onClick={() => dispatch(fetchWhatsAppTemplates())}
              variant="outline"
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Templates Grid */}
        {!fetchingTemplates && !templatesError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl shadow-lg border border-travel-purple/10 overflow-hidden hover:shadow-xl transition-all duration-200 hover:border-travel-purple/20"
              >
                {/* Template Image */}
                <div className="relative">
                  <img
                    src={template.image}
                    alt={template.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=200&fit=crop";
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <Badge
                      className={`${getStatusBadgeColor(
                        template.status
                      )} border`}
                    >
                      {template.status}
                    </Badge>
                  </div>
                </div>

                {/* Template Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {template.title}
                    </h3>
                  </div>

                  <div className="text-sm text-gray-600 mb-4 line-clamp-6">
                    {template.content.text}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{template.category}</span>
                    <span>{template.language}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!fetchingTemplates &&
          !templatesError &&
          filteredTemplates.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-travel-purple/10">
              <div className="text-gray-500 mb-4">
                <h3 className="text-lg font-medium">No templates found</h3>
                <p className="text-sm">
                  {activeTab === "ALL"
                    ? "No templates available. Create your first WhatsApp template to get started."
                    : `No templates match the ${activeTab.toLowerCase()} filter.`}
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default TemplatesView;
