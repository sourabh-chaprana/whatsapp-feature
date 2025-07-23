// src/store/slices/crmSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Enums (converted from TypeScript)
export const LeadStatus = {
  NEW: "new",
  CONTACTED: "contacted",
  QUALIFIED: "qualified",
  PROPOSAL: "proposal",
  NEGOTIATION: "negotiation",
  BOOKED: "booked",
  LOST: "lost",
};

export const LeadSource = {
  WEBSITE: "website",
  REFERRAL: "referral",
  SOCIAL: "social",
  EMAIL: "email",
  PHONE: "phone",
  WHATSAPP: "whatsapp",
  MARKETPLACE: "marketplace",
  OTHER: "other",
};

export const TaskType = {
  CALL: "call",
  EMAIL: "email",
  MEETING: "meeting",
  DOCUMENT: "document",
  FOLLOW_UP: "follow_up",
  OTHER: "other",
};

export const TaskPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

export const CommunicationChannel = {
  EMAIL: "email",
  PHONE: "phone",
  WHATSAPP: "whatsapp",
  SMS: "sms",
  IN_PERSON: "in_person",
  OTHER: "other",
};

export const BookingStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

export const PaymentStatus = {
  PENDING: "pending",
  PARTIAL: "partial",
  PAID: "paid",
  OVERDUE: "overdue",
  REFUNDED: "refunded",
};

// Mock data generators
function generateMockLeads() {
  return [
    {
      id: "lead-1",
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+1234567890",
      status: LeadStatus.NEW,
      source: LeadSource.WEBSITE,
      tags: ["family", "beach", "summer"],
      notes: "Looking for a family vacation package to Hawaii",
      budget: 5000,
      travelDates: {
        start: new Date(2024, 6, 15),
        end: new Date(2024, 6, 25),
      },
      createdAt: new Date(2024, 5, 10),
      updatedAt: new Date(2024, 5, 10),
      assignedTo: "agent-1",
      collaborators: [],
      aiPriorityScore: 0.85,
      preferences: {
        destination: "Hawaii",
        accommodation: "Resort",
        activities: "Beach, Hiking, Snorkeling",
      },
      isReturnCustomer: false,
    },
    {
      id: "lead-2",
      name: "Emma Johnson",
      email: "emma@example.com",
      phone: "+1987654321",
      status: LeadStatus.CONTACTED,
      source: LeadSource.REFERRAL,
      tags: ["honeymoon", "luxury"],
      notes: "Planning a honeymoon trip to Maldives",
      budget: 8000,
      travelDates: {
        start: new Date(2024, 9, 5),
        end: new Date(2024, 9, 15),
      },
      createdAt: new Date(2024, 5, 12),
      updatedAt: new Date(2024, 5, 15),
      assignedTo: "agent-2",
      collaborators: ["agent-1"],
      aiPriorityScore: 0.92,
      preferences: {
        destination: "Maldives",
        accommodation: "Overwater bungalow",
        activities: "Snorkeling, Spa, Romantic dinner",
      },
      isReturnCustomer: false,
    },
    {
      id: "lead-3",
      name: "Michael Brown",
      email: "michael@example.com",
      phone: "+1122334455",
      status: LeadStatus.QUALIFIED,
      source: LeadSource.SOCIAL,
      tags: ["business", "conference"],
      notes: "Looking for corporate retreat venue",
      budget: 15000,
      travelDates: {
        start: new Date(2024, 8, 1),
        end: new Date(2024, 8, 5),
      },
      createdAt: new Date(2024, 5, 18),
      updatedAt: new Date(2024, 5, 20),
      assignedTo: "agent-1",
      collaborators: [],
      aiPriorityScore: 0.78,
      preferences: {
        destination: "Swiss Alps",
        accommodation: "Mountain Resort",
        activities: "Team building, Meetings",
      },
      isReturnCustomer: true,
    },
  ];
}

function generateMockTasks() {
  return [
    {
      id: "task-1",
      title: "Follow up with John Smith",
      description:
        "Call to discuss Hawaii vacation details and send customized package options",
      type: TaskType.CALL,
      priority: TaskPriority.HIGH,
      dueDate: new Date(2024, 5, 20),
      completed: false,
      leadId: "lead-1",
      assignedTo: "agent-1",
      createdAt: new Date(2024, 5, 15),
      updatedAt: new Date(2024, 5, 15),
    },
    {
      id: "task-2",
      title: "Send Maldives proposal",
      description:
        "Prepare and send detailed honeymoon package proposal to Emma Johnson",
      type: TaskType.EMAIL,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date(2024, 5, 22),
      completed: true,
      completedAt: new Date(2024, 5, 21),
      leadId: "lead-2",
      assignedTo: "agent-2",
      createdAt: new Date(2024, 5, 16),
      updatedAt: new Date(2024, 5, 21),
    },
    {
      id: "task-3",
      title: "Schedule corporate retreat meeting",
      description:
        "Arrange meeting with Michael Brown to discuss corporate retreat requirements",
      type: TaskType.MEETING,
      priority: TaskPriority.HIGH,
      dueDate: new Date(2024, 5, 25),
      completed: false,
      leadId: "lead-3",
      assignedTo: "agent-1",
      createdAt: new Date(2024, 5, 18),
      updatedAt: new Date(2024, 5, 18),
    },
  ];
}

function generateMockCommunications() {
  return [
    {
      id: "comm-1",
      leadId: "lead-1",
      channel: CommunicationChannel.EMAIL,
      direction: "outgoing",
      content:
        "Thank you for your interest in our Hawaii packages. I'd love to help you plan the perfect family vacation. When would be a good time for a quick call?",
      sentAt: new Date(2024, 5, 15),
      sentBy: "agent-1",
      attachments: [],
      aiSentiment: 0.8,
    },
    {
      id: "comm-2",
      leadId: "lead-2",
      channel: CommunicationChannel.PHONE,
      direction: "incoming",
      content:
        "Hi, I'm interested in your Maldives honeymoon packages. Can you send me some options for October?",
      sentAt: new Date(2024, 5, 12),
      sentBy: "lead-2",
      attachments: [],
      aiSentiment: 0.9,
    },
    {
      id: "comm-3",
      leadId: "lead-3",
      channel: CommunicationChannel.EMAIL,
      direction: "outgoing",
      content:
        "Thank you for considering us for your corporate retreat. I've attached our corporate packages brochure. Let's schedule a meeting to discuss your specific requirements.",
      sentAt: new Date(2024, 5, 19),
      sentBy: "agent-1",
      attachments: [
        {
          id: "att-1",
          name: "Corporate_Packages_2024.pdf",
          url: "/attachments/corporate-packages.pdf",
          type: "application/pdf",
        },
      ],
      aiSentiment: 0.7,
    },
  ];
}

function generateMockBookings() {
  return [
    {
      id: "booking-1",
      leadId: "lead-2",
      status: BookingStatus.CONFIRMED,
      itinerary: {
        id: "itinerary-1",
        name: "Maldives Honeymoon Package",
        description:
          "7 nights in luxury overwater bungalow with full board and spa treatments",
        startDate: new Date(2024, 9, 5),
        endDate: new Date(2024, 9, 15),
      },
      totalAmount: 8000,
      paidAmount: 2000,
      paymentStatus: PaymentStatus.PARTIAL,
      paymentStages: [
        {
          id: "payment-1",
          name: "Deposit",
          amount: 2000,
          dueDate: new Date(2024, 6, 1),
          paid: true,
          paidAt: new Date(2024, 6, 1),
        },
        {
          id: "payment-2",
          name: "Final Payment",
          amount: 6000,
          dueDate: new Date(2024, 8, 1),
          paid: false,
        },
      ],
      createdAt: new Date(2024, 5, 20),
      updatedAt: new Date(2024, 6, 1),
    },
    {
      id: "booking-2",
      leadId: "lead-3",
      status: BookingStatus.PENDING,
      itinerary: {
        id: "itinerary-2",
        name: "Swiss Alps Corporate Retreat",
        description:
          "4 days corporate retreat with meeting facilities and team building activities",
        startDate: new Date(2024, 8, 1),
        endDate: new Date(2024, 8, 5),
      },
      totalAmount: 15000,
      paidAmount: 0,
      paymentStatus: PaymentStatus.PENDING,
      paymentStages: [
        {
          id: "payment-3",
          name: "Full Payment",
          amount: 15000,
          dueDate: new Date(2024, 7, 15),
          paid: false,
        },
      ],
      createdAt: new Date(2024, 5, 25),
      updatedAt: new Date(2024, 5, 25),
    },
  ];
}

const initialState = {
  // Data
  leads: generateMockLeads(),
  tasks: generateMockTasks(),
  communications: generateMockCommunications(),
  bookings: generateMockBookings(),

  // UI State
  leadViewMode: "list",
  currentLeadId: null,
  currentTaskId: null,
  sidebarCollapsed: false,
  isOffline: false,

  // Settings
  currency: "USD",
  language: "EN",

  // Loading states
  loading: false,
  error: null,
};

const crmSlice = createSlice({
  name: "crm",
  initialState,
  reducers: {
    // Lead actions
    addLead: (state, action) => {
      state.leads.push(action.payload);
    },
    updateLead: (state, action) => {
      const { id, data } = action.payload;
      const index = state.leads.findIndex((lead) => lead.id === id);
      if (index !== -1) {
        state.leads[index] = {
          ...state.leads[index],
          ...data,
          updatedAt: new Date(),
        };
      }
    },
    deleteLead: (state, action) => {
      state.leads = state.leads.filter((lead) => lead.id !== action.payload);
    },

    // Task actions
    addTask: (state, action) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action) => {
      const { id, data } = action.payload;
      const index = state.tasks.findIndex((task) => task.id === id);
      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          ...data,
          updatedAt: new Date(),
        };
      }
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },
    toggleTaskCompletion: (state, action) => {
      const { id, completed } = action.payload;
      const index = state.tasks.findIndex((task) => task.id === id);
      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          completed,
          completedAt: completed ? new Date() : undefined,
          updatedAt: new Date(),
        };
      }
    },

    // Communication actions
    addCommunication: (state, action) => {
      state.communications.push(action.payload);
    },
    updateCommunication: (state, action) => {
      const { id, data } = action.payload;
      const index = state.communications.findIndex((comm) => comm.id === id);
      if (index !== -1) {
        state.communications[index] = {
          ...state.communications[index],
          ...data,
        };
      }
    },
    deleteCommunication: (state, action) => {
      state.communications = state.communications.filter(
        (comm) => comm.id !== action.payload
      );
    },

    // Booking actions
    addBooking: (state, action) => {
      state.bookings.push(action.payload);
    },
    updateBooking: (state, action) => {
      const { id, data } = action.payload;
      const index = state.bookings.findIndex((booking) => booking.id === id);
      if (index !== -1) {
        state.bookings[index] = {
          ...state.bookings[index],
          ...data,
          updatedAt: new Date(),
        };
      }
    },
    deleteBooking: (state, action) => {
      state.bookings = state.bookings.filter(
        (booking) => booking.id !== action.payload
      );
    },

    // UI actions
    setLeadViewMode: (state, action) => {
      state.leadViewMode = action.payload;
    },
    setCurrentLeadId: (state, action) => {
      state.currentLeadId = action.payload;
    },
    setCurrentTaskId: (state, action) => {
      state.currentTaskId = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setOfflineStatus: (state, action) => {
      state.isOffline = action.payload;
    },

    // Loading and error
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Settings actions
    setCurrency: (state, action) => {
      state.currency = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
  },
});

export const {
  addLead,
  updateLead,
  deleteLead,
  addTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  addCommunication,
  updateCommunication,
  deleteCommunication,
  addBooking,
  updateBooking,
  deleteBooking,
  setLeadViewMode,
  setCurrentLeadId,
  setCurrentTaskId,
  toggleSidebar,
  setOfflineStatus,
  setLoading,
  setError,
  clearError,
  setCurrency,
  setLanguage,
} = crmSlice.actions;

export default crmSlice.reducer;
