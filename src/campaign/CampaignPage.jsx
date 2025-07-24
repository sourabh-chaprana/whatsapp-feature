import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, BarChart3, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { fetchWhatsAppTemplates } from "../store/slices/chats/chatThunk";

const CampaignPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { whatsappTemplates, fetchingTemplates, templatesError } = useSelector(
    (state) => state.chat
  );

  useEffect(() => {
    // Fetch templates when component mounts
    dispatch(fetchWhatsAppTemplates());
  }, [dispatch]);

  const handleViewAllTemplates = () => {
    navigate("/campaign/templates");
  };

  const handleViewInsights = (templateName) => {
    // Placeholder for viewing insights
    console.log(`View insights for ${templateName}`);
  };

  // Helper function to extract description from template components
  const getTemplateDescription = (components) => {
    if (!components || !Array.isArray(components)) return "N/A";

    const bodyComponent = components.find((comp) => comp.type === "BODY");
    if (bodyComponent && bodyComponent.text) {
      // Truncate long descriptions
      const text = bodyComponent.text;
      return text.length > 60 ? `${text.substring(0, 60)}...` : text;
    }
    return "N/A";
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

  // Transform API data to match UI format
  const transformedTemplates = whatsappTemplates.map((template) => ({
    id: template.id || "N/A",
    name: template.name || "N/A",
    category: formatCategory(template.category),
    language: getLanguageDisplay(template.language),
    status: template.status || "N/A",
    description: getTemplateDescription(template.components),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-travel-lightpink/10 via-white to-travel-purple/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                WhatsApp Templates
              </h1>
              <p className="text-gray-600">
                Manage your WhatsApp Business API message templates
              </p>
            </div>
            <Button
              onClick={handleViewAllTemplates}
              className="bg-travel-purple hover:bg-travel-purple/90 text-white flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View All Templates
            </Button>
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

        {/* Templates Table */}
        {!fetchingTemplates && !templatesError && (
          <div className="bg-white rounded-xl shadow-lg border border-travel-purple/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-travel-lightpink/20 to-travel-purple/20 border-b border-travel-purple/10">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Template Name
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Language
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transformedTemplates.map((template, index) => (
                    <tr
                      key={template.id}
                      className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-travel-lightpink/5 hover:to-travel-purple/5 transition-all duration-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900">
                            {template.name}
                          </div>
                          <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                            {template.description}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-900">
                          {template.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900">
                            {template.language}
                          </div>
                          <div className="text-sm text-gray-500">
                            {template.description}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          className={`${getStatusBadgeColor(
                            template.status
                          )} border`}
                        >
                          {template.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewInsights(template.name)}
                          className="text-travel-purple hover:text-travel-purple/80 hover:bg-travel-purple/10"
                        >
                          <BarChart3 className="h-4 w-4 mr-1" />
                          View insights
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State Message */}
        {!fetchingTemplates &&
          !templatesError &&
          transformedTemplates.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-travel-purple/10">
              <div className="text-gray-500 mb-4">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium">No templates found</h3>
                <p className="text-sm">
                  Create your first WhatsApp template to get started.
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default CampaignPage;
