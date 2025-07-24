import React, { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  getPermanentToken,
  updateWabaTokenDetails,
  updateWabaBusinessDetails,
  submitBusinessVerification,
  fetchBusinessDetails,
  fetchPhoneNumberStatus,
  checkConnectionStatus, // NEW: Check connection status on page load
} from "../store/slices/whatsapp/whatsappThunk";
import {
  updateBusinessForm,
  clearError,
  clearSuccess,
  updateFormWithBusinessDetails,
} from "../store/slices/whatsapp/whatsappSlice";

// Facebook Login Component (inline for now)
const FacebookLogin = ({ disabled, onSuccess }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Inject the Facebook SDK script
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);

    // Initialize FB SDK
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: import.meta.env.VITE_FB_APP_ID || "1334612180951751", // ✅ Use YOUR app ID
        autoLogAppEvents: true,
        xfbml: true,
        version: import.meta.env.VITE_FB_VERSION || "v23.0",
      });
      console.log("Facebook SDK initialized successfully");
    };

    // ✅ FIXED: Enhanced message listener
    window.addEventListener("message", (event) => {
      console.log("🔍 Message received:", {
        origin: event.origin,
        data: event.data,
        type: typeof event.data,
      });

      // ✅ More flexible origin check
      if (!event.origin.includes("facebook.com")) {
        console.log("❌ Origin not from Facebook:", event.origin);
        return;
      }

      // ✅ Handle both string and object data
      let parsedData;
      if (typeof event.data === "string") {
        if (!event.data.startsWith("{")) {
          console.log("⏭️ Skipping non-JSON string:", event.data);
          return;
        }
        try {
          parsedData = JSON.parse(event.data);
        } catch (error) {
          if (!event.data.includes("cb=")) {
            console.error("❌ JSON parse error:", error);
          }
          return;
        }
      } else if (typeof event.data === "object") {
        parsedData = event.data;
      } else {
        console.log("⏭️ Skipping non-string/object data:", typeof event.data);
        return;
      }

      console.log("📋 Parsed message data:", parsedData);

      // ✅ Check for WhatsApp embedded signup
      if (parsedData.type === "WA_EMBEDDED_SIGNUP") {
        console.log("🎉 WhatsApp signup detected:", parsedData);

        const businessData = {
          businessAccountId: parsedData.data?.business_id,
          phoneNumberId: parsedData.data?.phone_number_id,
          wabaId: parsedData.data?.waba_id,
          businessProfile: parsedData.data?.business_profile || null,
        };

        console.log("💾 Extracted business data:", businessData);

        // ✅ Validate required fields
        if (
          !businessData.businessAccountId ||
          !businessData.phoneNumberId ||
          !businessData.wabaId
        ) {
          console.error("❌ Missing required business data:", businessData);
          return;
        }

        // ✅ Save business details to database
        console.log("🔄 Calling updateWabaBusinessDetails...");
        dispatch(updateWabaBusinessDetails(businessData))
          .unwrap()
          .then((result) => {
            console.log("✅ Business details saved successfully:", result);
            if (onSuccess) {
              onSuccess(parsedData.data);
            }
          })
          .catch((error) => {
            console.error("❌ Failed to save business details:", error);
          });
      }

      // ✅ Also check for other possible message types
      else if (parsedData.type === "platform_popup") {
        console.log("📱 Platform popup message:", parsedData);
      } else {
        console.log("❓ Unknown message type:", parsedData.type);
      }
    });

    return () => {
      const existingScript = document.querySelector(
        'script[src*="connect.facebook.net"]'
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [dispatch, onSuccess]);

  // ✅ FIXED: Simplified callback - just handle token exchange
  const fbLoginCallback = (response) => {
    console.log("📱 Facebook login response:", response);

    if (response.authResponse) {
      const code = response.authResponse.code;
      console.log("🔑 Authorization code received:", code);

      // Handle token exchange
      (async () => {
        try {
          console.log("🔄 Exchanging code for permanent token...");
          const tokenResult = await dispatch(getPermanentToken(code)).unwrap();

          console.log("🔄 Updating WABA token details...");
          await dispatch(
            updateWabaTokenDetails(tokenResult.access_token)
          ).unwrap();

          console.log("✅ Token exchange completed successfully");

          // Note: Business details will be saved via message listener
          // onSuccess will be called from message listener
        } catch (error) {
          console.error("❌ Failed to process Facebook login:", error);
        }
      })();
    } else {
      console.error("❌ Facebook login failed:", response);
    }
  };

  const launchWhatsAppSignup = () => {
    if (!window.FB) {
      console.warn("⚠️ FB SDK not yet loaded");
      return;
    }

    console.log("🚀 Launching WhatsApp signup...");
    window.FB.login(fbLoginCallback, {
      config_id: import.meta.env.VITE_FB_CONFIG_ID || "700908572907725", // ✅ Use YOUR config ID
      response_type: "code",
      override_default_response_type: true,
      extras: {
        setup: {},
        featureType: "whatsapp_business_management",
        sessionInfoVersion: "3",
      },
    });
  };

  return (
    <Button
      onClick={launchWhatsAppSignup}
      disabled={disabled}
      className="bg-gradient-to-r from-travel-purple to-travel-pink hover:from-travel-purple/90 hover:to-travel-pink/90 text-white px-6 py-2 shadow-lg"
    >
      Login with Facebook
    </Button>
  );
};

const WhatsappSettings = () => {
  const dispatch = useDispatch();
  const {
    businessDetails,
    isConnected,
    isSubmitting,
    isConnecting,
    verificationStatus,
    error,
    successMessage,
    facebookBusinessProfile,
    phoneNumberId,
    businessAccountId, // 🔥 ADD THIS LINE
    wabaBusinessDetails,
    phoneNumbers,
    isFetchingDetails,
  } = useSelector((state) => state.whatsapp);

  const [isExpanded, setIsExpanded] = useState(true);
  const [showManualSetup, setShowManualSetup] = useState(false);
  const [manualData, setManualData] = useState({
    businessAccountId: "",
    phoneNumberId: "",
    wabaId: "",
  });

  const businessCategories = [
    "Accommodation",
    "Automotive",
    "Business Services",
    "Education",
    "Entertainment",
    "Finance Services",
    "Food & Beverage",
    "Government",
    "Healthcare",
    "Non-profit",
    "Professional Services",
    "Real Estate",
    "Retail",
    "Technology",
    "Travel & Transportation",
    "Other",
  ];

  const handleInputChange = (field, value) => {
    dispatch(updateBusinessForm({ [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await dispatch(submitBusinessVerification(businessDetails)).unwrap();
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  // ✅ FIXED: handleFacebookSuccess function
  const handleFacebookSuccess = async (data) => {
    console.log("🎉 Facebook login successful, starting data fetch...", data);

    // ✅ FIXED: Immediate form update if Facebook provides business data
    if (data.business_profile) {
      dispatch(
        updateBusinessForm({
          name: data.business_profile.name || "",
          description: data.business_profile.description || "",
          category: data.business_profile.category || "",
        })
      );
    }

    if (data.phone_number_id) {
      dispatch(
        updateBusinessForm({
          phoneNumber: `+${data.phone_number_id}`,
        })
      );
    }

    // ✅ FIXED: Progressive data loading with retries
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    const fetchWithRetry = async () => {
      try {
        console.log(
          `🔄 Fetching WhatsApp Business details (attempt ${retryCount + 1})...`
        );

        const [businessDetailsResult, phoneStatusResult] = await Promise.all([
          dispatch(fetchBusinessDetails()).unwrap(),
          dispatch(fetchPhoneNumberStatus()).unwrap(),
        ]);

        console.log("✅ Business details fetched successfully:");
        console.log("📊 Business Details:", businessDetailsResult);
        console.log("📞 Phone Numbers:", phoneStatusResult);

        // Update form with fetched data
        dispatch(
          updateFormWithBusinessDetails({
            wabaBusinessDetails: businessDetailsResult,
            phoneNumbers: phoneStatusResult,
          })
        );

        return true; // Success
      } catch (error) {
        console.error(`❌ Fetch attempt ${retryCount + 1} failed:`, error);

        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`🔄 Retrying in ${retryDelay}ms...`);
          setTimeout(fetchWithRetry, retryDelay);
        } else {
          console.error("❌ All fetch attempts failed");
          dispatch(
            updateBusinessForm({
              error:
                "Failed to load business details after multiple attempts. Please refresh the page.",
            })
          );
        }
        return false; // Failed
      }
    };

    // Start fetching after a short delay
    setTimeout(fetchWithRetry, 1500); // 1.5 seconds delay
  };

  // NEW: UseEffect to auto-update form when business details are fetched
  useEffect(() => {
    if (wabaBusinessDetails && phoneNumbers.length > 0) {
      console.log("📝 Auto-updating form with fetched business details");

      const updates = {};

      // Update name if not already set
      if (!businessDetails.name) {
        if (wabaBusinessDetails.name) {
          updates.name = wabaBusinessDetails.name;
        } else if (phoneNumbers[0]?.verified_name) {
          updates.name = phoneNumbers[0].verified_name;
        }
      }

      // Update phone number if not already set
      if (
        !businessDetails.phoneNumber &&
        phoneNumbers[0]?.display_phone_number
      ) {
        updates.phoneNumber = phoneNumbers[0].display_phone_number;
      }

      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        console.log("📝 Applying form updates:", updates);
        dispatch(updateBusinessForm(updates));
      }
    }
  }, [wabaBusinessDetails, phoneNumbers, businessDetails, dispatch]);

  // Enhanced helper function to get field value with all data sources
  const getFieldValue = (fieldName) => {
    switch (fieldName) {
      case "name":
        return (
          businessDetails.name ||
          facebookBusinessProfile?.name ||
          phoneNumbers[0]?.verified_name ||
          wabaBusinessDetails?.name ||
          ""
        );
      case "category":
        return (
          businessDetails.category || facebookBusinessProfile?.category || ""
        );
      case "description":
        return (
          businessDetails.description ||
          facebookBusinessProfile?.description ||
          ""
        );
      case "phoneNumber":
        return (
          businessDetails.phoneNumber ||
          (phoneNumberId ? `+${phoneNumberId}` : "") ||
          phoneNumbers[0]?.display_phone_number ||
          ""
        );
      default:
        return businessDetails[fieldName] || "";
    }
  };

  // Enhanced helper function for showing fields
  const shouldShowField = (fieldName) => {
    if (!isConnected) return true;

    switch (fieldName) {
      case "name":
        return !!(
          facebookBusinessProfile?.name ||
          phoneNumbers[0]?.verified_name ||
          wabaBusinessDetails?.name
        );
      case "category":
        return !!facebookBusinessProfile?.category;
      case "description":
        return true; // Always show
      case "phoneNumber":
        return !!(phoneNumberId || phoneNumbers[0]?.display_phone_number);
      default:
        return true;
    }
  };

  // Check if we have all required data (either from Facebook or form)
  const hasRequiredData = () => {
    const hasName = facebookBusinessProfile?.name || businessDetails.name;
    const hasCategory =
      facebookBusinessProfile?.category || businessDetails.category;
    const hasPhone = phoneNumberId || businessDetails.phoneNumber;

    return hasName && hasCategory && hasPhone;
  };

  // Clear messages after some time
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearError());
        dispatch(clearSuccess());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);

  // ✅ FIXED: Better connection check that doesn't interfere with login
  useEffect(() => {
    let isComponentMounted = true;

    console.log("🔍 Checking connection status on component mount...");

    dispatch(checkConnectionStatus())
      .unwrap()
      .then((status) => {
        if (!isComponentMounted) return; // Component unmounted

        console.log("📊 Connection status:", status);
        if (status.isConnected && !isConnecting) {
          // ✅ Don't interfere if login is in progress
          console.log("🔄 Found existing connection, fetching details...");
          handleFacebookSuccess({});
        }
      })
      .catch((error) => {
        if (!isComponentMounted) return;
        console.log("ℹ️ No existing connection found:", error.message);
      });

    // Cleanup function
    return () => {
      isComponentMounted = false;
    };
  }, [dispatch]); // ✅ Remove isConnecting from dependencies to prevent loops

  // ✅ Manual setup function for testing
  const handleManualSetup = async () => {
    try {
      console.log("🔄 Manual setup with:", manualData);

      const result = await dispatch(
        updateWabaBusinessDetails(manualData)
      ).unwrap();
      console.log("✅ Manual setup successful:", result);

      setShowManualSetup(false);
      // Trigger data fetch
      handleFacebookSuccess({});
    } catch (error) {
      console.error("❌ Manual setup failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-travel-lightpink/5 via-white to-travel-purple/5">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-travel-purple/10"
          >
            <ArrowLeft className="h-4 w-4 text-travel-purple" />
          </Button>
          <h1 className="text-2xl font-heading font-semibold">
            <span className="whilter-gradient-text">
              Business Account Configuration
            </span>
          </h1>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-gradient-to-r from-green-50 to-green-100/50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-sm">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-sm">
            {error}
          </div>
        )}

        {/* Facebook Login Button */}
        <div className="flex justify-end gap-3 mb-6">
          <FacebookLogin
            disabled={isConnected || isConnecting}
            onSuccess={handleFacebookSuccess}
          />
          {isConnected && (
            <span className="ml-3 text-sm text-green-600 flex items-center font-medium">
              ✓ Connected to WhatsApp Business
            </span>
          )}
        </div>

        {!isConnected && (
          <div className="mt-4 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
            <button
              onClick={() => setShowManualSetup(!showManualSetup)}
              className="text-sm text-blue-600 hover:underline"
            >
              🔧 Manual Setup (for debugging)
            </button>

            {showManualSetup && (
              <div className="mt-2 space-y-2">
                <input
                  placeholder="Business Account ID"
                  value={manualData.businessAccountId}
                  onChange={(e) =>
                    setManualData({
                      ...manualData,
                      businessAccountId: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded text-sm"
                />
                <input
                  placeholder="Phone Number ID"
                  value={manualData.phoneNumberId}
                  onChange={(e) =>
                    setManualData({
                      ...manualData,
                      phoneNumberId: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded text-sm"
                />
                <input
                  placeholder="WABA ID"
                  value={manualData.wabaId}
                  onChange={(e) =>
                    setManualData({ ...manualData, wabaId: e.target.value })
                  }
                  className="w-full p-2 border rounded text-sm"
                />
                <button
                  onClick={handleManualSetup}
                  className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
                >
                  Save Business Details
                </button>
              </div>
            )}
          </div>
        )}

        {/* NEW: WhatsApp Business Account Details Card - Show only if connected and details available */}
        {isConnected && wabaBusinessDetails && (
          <Card className="border border-green-200 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50/80">
            <CardHeader className="pb-4 bg-gradient-to-r from-green-100/50 to-emerald-100/50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-lg font-heading text-gray-900">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-sm">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
                WhatsApp Business Account Details
                {isFetchingDetails && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    Loading...
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Display Name */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-600">
                    Display Name
                  </Label>
                  <div className="text-sm font-semibold text-gray-900">
                    {phoneNumbers[0]?.verified_name ||
                      wabaBusinessDetails?.name ||
                      "N/A"}
                  </div>
                </div>

                {/* Connected Number */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-600">
                    Connected Number
                  </Label>
                  <div className="text-sm font-semibold text-gray-900">
                    {phoneNumbers[0]?.display_phone_number || "N/A"}
                  </div>
                </div>

                {/* Phone Number ID */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-600">
                    Phone Number ID
                  </Label>
                  <div className="text-sm font-mono text-gray-900">
                    {phoneNumbers[0]?.id || phoneNumberId || "N/A"}
                  </div>
                </div>

                {/* Number Status */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-600">
                    Number Status
                  </Label>
                  <div className="text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        phoneNumbers[0]?.code_verification_status === "VERIFIED"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {phoneNumbers[0]?.code_verification_status || "PENDING"}
                    </span>
                  </div>
                </div>

                {/* WhatsApp Business Account ID */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-600">
                    WhatsApp Business Account ID
                  </Label>
                  <div className="text-sm font-mono text-gray-900">
                    {wabaBusinessDetails?.id || "N/A"}
                  </div>
                </div>

                {/* Business ID */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-600">
                    Business ID
                  </Label>
                  <div className="text-sm font-mono text-gray-900">
                    {businessAccountId || "N/A"}
                  </div>
                </div>

                {/* Account Status */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-600">
                    Account Status
                  </Label>
                  <div className="text-sm">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      VERIFIED
                    </span>
                  </div>
                </div>

                {/* Quality Rating */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-600">
                    Quality Rating
                  </Label>
                  <div className="text-sm font-semibold text-gray-900">
                    {phoneNumbers[0]?.quality_rating || "N/A"}
                  </div>
                </div>
              </div>

              {/* Token Section */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Label className="text-sm font-medium text-gray-600">
                  Token
                </Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    value={"•".repeat(80)}
                    disabled
                    className="font-mono text-xs"
                  />
                  <Button variant="outline" size="sm" className="text-xs">
                    👁️
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* WhatsApp Business Account Verification Card */}
        <Card className="border border-travel-purple/20 shadow-lg bg-gradient-to-br from-white to-travel-lightpink/5">
          <CardHeader className="pb-4 bg-gradient-to-r from-travel-purple/5 to-travel-pink/5 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-lg font-heading text-gray-900">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center shadow-sm">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
                WhatsApp Business Account Verification
                {verificationStatus !== "pending" && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      verificationStatus === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {verificationStatus}
                  </span>
                )}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 hover:bg-travel-purple/10"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform text-travel-purple ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </div>
          </CardHeader>

          {isExpanded && (
            <CardContent className="space-y-6 p-6">
              {/* Show notice about Facebook data */}
              {isConnected && (facebookBusinessProfile || phoneNumberId) && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50/80 border border-green-200 rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-medium text-green-800 mb-2">
                    ✓ Connected to Facebook Business Profile
                  </h3>
                  <div className="space-y-1 text-sm text-green-700">
                    {facebookBusinessProfile?.name && (
                      <p>
                        • Business Name:{" "}
                        <strong>{facebookBusinessProfile.name}</strong>
                      </p>
                    )}
                    {facebookBusinessProfile?.category && (
                      <p>
                        • Category:{" "}
                        <strong>{facebookBusinessProfile.category}</strong>
                      </p>
                    )}
                    {phoneNumberId && (
                      <p>
                        • Phone Number: <strong>+{phoneNumberId}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Name - Show if Facebook provides it, Hide if not */}
                {shouldShowField("name") && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="businessName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Business Name *{" "}
                      {facebookBusinessProfile?.name && (
                        <span className="text-xs text-green-600 font-medium">
                          (from Facebook)
                        </span>
                      )}
                    </Label>
                    <Input
                      id="businessName"
                      value={getFieldValue("name")}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Enter your business name"
                      className="w-full border-travel-purple/20 focus:border-travel-purple focus:ring-travel-purple/20"
                      disabled={
                        verificationStatus === "approved" ||
                        !!facebookBusinessProfile?.name
                      }
                    />
                  </div>
                )}

                {/* Business Category - Show if Facebook provides it, Hide if not */}
                {shouldShowField("category") && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="businessCategory"
                      className="text-sm font-medium text-gray-700"
                    >
                      Business Category *{" "}
                      {facebookBusinessProfile?.category && (
                        <span className="text-xs text-green-600 font-medium">
                          (from Facebook)
                        </span>
                      )}
                    </Label>
                    <Select
                      value={getFieldValue("category")}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                      disabled={
                        verificationStatus === "approved" ||
                        !!facebookBusinessProfile?.category
                      }
                    >
                      <SelectTrigger className="w-full border-travel-purple/20 focus:border-travel-purple focus:ring-travel-purple/20">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessCategories.map((category) => (
                          <SelectItem
                            key={category}
                            value={category.toLowerCase().replace(/\s+/g, "_")}
                          >
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Business Description - Always show */}
              <div className="space-y-2">
                <Label
                  htmlFor="businessDescription"
                  className="text-sm font-medium text-gray-700"
                >
                  Business Description (Optional)
                </Label>
                <Textarea
                  id="businessDescription"
                  value={getFieldValue("description")}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe your business..."
                  className="w-full min-h-[120px] resize-none border-travel-purple/20 focus:border-travel-purple focus:ring-travel-purple/20"
                  disabled={verificationStatus === "approved"}
                />
              </div>

              {/* Phone Number - Show if Facebook provides it, Hide if not */}
              {shouldShowField("phoneNumber") && (
                <div className="space-y-2">
                  <Label
                    htmlFor="phoneNumber"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number with Country Code *{" "}
                    {phoneNumberId && (
                      <span className="text-xs text-green-600 font-medium">
                        (from Facebook)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={getFieldValue("phoneNumber")}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    placeholder="+1 (555) 123-4567"
                    className="w-full border-travel-purple/20 focus:border-travel-purple focus:ring-travel-purple/20"
                    disabled={
                      verificationStatus === "approved" || !!phoneNumberId
                    }
                  />
                </div>
              )}

              {/* Show message for hidden fields */}
              {isConnected &&
                (!shouldShowField("name") ||
                  !shouldShowField("category") ||
                  !shouldShowField("phoneNumber")) && (
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50/80 border border-yellow-200 rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-yellow-800 mb-2">
                      ⚠️ Missing Business Information
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Some required fields are not available from your Facebook
                      Business Profile. Please ensure your Facebook Business
                      Profile is complete with:
                    </p>
                    <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
                      {!shouldShowField("name") && <li>Business Name</li>}
                      {!shouldShowField("category") && (
                        <li>Business Category</li>
                      )}
                      {!shouldShowField("phoneNumber") && <li>Phone Number</li>}
                    </ul>
                  </div>
                )}
            </CardContent>
          )}
        </Card>

        {/* Quick Response Templates */}
        <Card className="border border-travel-purple/20 shadow-lg bg-gradient-to-br from-white to-travel-lightpink/5">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-gray-500 text-sm">No messages yet</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs px-3 py-1 border-travel-purple/30 hover:bg-travel-purple/10 hover:border-travel-purple/50 text-travel-purple"
                >
                  Greeting
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs px-3 py-1 border-travel-purple/30 hover:bg-travel-purple/10 hover:border-travel-purple/50 text-travel-purple"
                >
                  Appointment
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs px-3 py-1 border-travel-purple/30 hover:bg-travel-purple/10 hover:border-travel-purple/50 text-travel-purple"
                >
                  Offers
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-travel-purple to-travel-pink hover:from-travel-purple/90 hover:to-travel-pink/90 text-white px-8 py-2 shadow-lg"
            disabled={
              !hasRequiredData() ||
              isSubmitting ||
              verificationStatus === "approved"
            }
          >
            {isSubmitting ? "Submitting..." : "Submit For Verification"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WhatsappSettings;
