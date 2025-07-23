export const onboardingSteps = [
  {
    id: "account",
    title: "Create Account",
    description: "Get started with your TravelPro account",

    fields: [
      {
        id: "fullName",
        type: "text",
        label: "Full Name",
        placeholder: "Your full name",
        required: true,
      },
      {
        id: "email",
        type: "email",
        label: "Work Email",
        placeholder: "yourname@company.com",
        required: true,
      },
      {
        id: "password",
        type: "password",
        label: "Password",
        placeholder: "Create a secure password",
        required: true,
      },
      {
        id: "termsAccepted",
        type: "checkbox",
        label: "I accept the Terms of Service and Privacy Policy",
        required: true,
      },
    ],
  },
  {
    id: "agency",
    title: "Agency Profile",
    description: "Tell us about your travel agency",
    fields: [
      {
        id: "agencyName",
        type: "text",
        label: "Agency Name",
        placeholder: "Your agency's name",
        required: true,
      },
      {
        id: "gstRegistered",
        type: "toggle",
        label: "GST Registered?",
        required: false,
      },
      {
        id: "yearsInBusiness",
        type: "number",
        label: "Years in Business",
        placeholder: "e.g. 5",
        required: true,
      },
      {
        id: "primaryMarkets",
        type: "multiselect",
        label: "Primary Markets",
        required: true,
        options: [
          { value: "domestic", label: "Domestic" },
          { value: "international", label: "International" },
          { value: "business", label: "Business" },
          { value: "leisure", label: "Leisure" },
          { value: "luxury", label: "Luxury" },
          { value: "budget", label: "Budget" },
        ],
      },
      {
        id: "averageDailyEnquiry",
        type: "select",
        label: "Average Daily Enquiries",
        required: true,
        options: [
          { value: "less_than_10", label: "Less than 10" },
          { value: "10_to_25", label: "10 - 25" },
          { value: "25_to_50", label: "25 - 50" },
          { value: "more_than_50", label: "More than 50" },
        ],
      },
    ],
  },
  {
    id: "branding",
    title: "Branding",
    description: "Customize your client-facing experience",
    fields: [
      {
        id: "logo_upload",
        type: "file",
        label: "Upload Logo",
        placeholder: "Upload your agency logo",
        required: false,
      },
      {
        id: "brand_color",
        type: "color",
        label: "Brand Color",
        required: false,
      },
    ],
  },
  {
    id: "about_you",
    title: "About You",
    description: "How clients will reach you",
    fields: [
      {
        id: "bio",
        type: "textarea",
        label: "Bio",
        placeholder: "A brief description about you or your agency",
        required: false,
      },
      {
        id: "mobileNumber",
        type: "tel",
        label: "Contact Phone",
        placeholder: "Your phone number",
        required: true,
      },
      {
        id: "preferredContactMethod",
        type: "radio",
        label: "Preferred Contact Method",
        required: true,
        options: [
          { value: "whatsapp", label: "WhatsApp" },
          { value: "email", label: "Email" },
          { value: "phone", label: "Phone" },
        ],
      },
    ],
  },
  {
    id: "seed_data",
    title: "Import Leads (optional)",
    description: "Drag & drop CSV of past enquiries / bookings.",
    fields: [
      {
        id: "csv_upload",
        type: "file",
        label: "Upload CSV",
        placeholder: "Drag and drop your CSV file here",
        required: false,
      },
    ],
  },
];
