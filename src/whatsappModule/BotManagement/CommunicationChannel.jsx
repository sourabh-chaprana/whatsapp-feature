import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  // useContext,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./CommunicationChannel.css";
import AgencyDropdown from "./AgencyDropdown";
import RightSidebar from "./RightSidebar";
import AgentAvatar from "./AgentAvatar";
import {
  sendMessage,
  deleteMessage,
  deleteAllSessionMessages,
} from "../../store/slices/chats/chatThunk";
import { setCurrentSession } from "../../store/slices/chats/chatSlice";
import { getAllLeadsWithSearchFilter } from "../../store/slices/leads/leadThunk";
import noChatImage from "../../assets/noChats.png";
import ChatInput from "./CustomChatInput";
import { useCallback } from "react";
import { fetchSubAdmins } from "../../store/slices/subAdmin/subAdminThunk";
import { toast } from "sonner";
import normalizePhoneNumber from "../../utils/normalizePhoneNumber";
import { fetchBookingByNumber } from "../../store/slices/bookings/bookingThunk";
import API_CONFIG from "../../utils/apiConfig";
import UserMessage from "./UserMassage";
import MessageActionMenu from "./Modals/MessageActionMenu";
import { io } from "socket.io-client";
import { BotMessage } from "./Modals/BotMessages";
// import API_CONFIG from "../../utils/apiConfig";

const FEMALE_AVATAR =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAbiyhbiVsB3BauQDza-fHaDfNxk52Pni0HMyFfqThLgsWnOtOeApfliG3-1BgH61WITg&usqp=CAU";
const MALE_AVATAR =
  "https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740";


// Create a context to track which menu is open
const MessageMenuContext = createContext({
  openMenuId: null,
  setOpenMenuId: () => {},
});

const CommunicationChannel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sessions, currentSession, messages, loading } = useSelector(
    (state) => state.chat
  );
  const { subAdmins } = useSelector((state) => state.subAdmins);

  // Get URL parameters using useLocation
  const location = window.location;
  const searchParams = new URLSearchParams(location.search);
  const phoneParam = searchParams.get("phone");

  // Track if we've already processed the phone parameter
  const [processedPhoneParam, setProcessedPhoneParam] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  // Add filter state
  const [filterType, setFilterType] = useState("all"); // "all", "assigned", "unassigned"
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // Add sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // const [messageText, setMessageText] = useState("");
  const [localMessages, setLocalMessages] = useState([]);
  const [localSessions, setLocalSessions] = useState([]);
  const [assignedAgents, setAssignedAgents] = useState([]);
  const [pendingAgents, setPendingAgents] = useState([]);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const chatBodyRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const sessionPollingIntervalRef = useRef(null);
  const sentMessagesRef = useRef(new Set()); // Track sent messages to prevent duplicates
  const [messageText, setMessageText] = useState("");
  const messageTextRef = useRef("");
  const [isConversationExpired, setIsConversationExpired] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const filterRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  // Add this state to track new messages when scrolled up
  const [newMessageCount, setNewMessageCount] = useState(0);

  // Create socket ref to store the socket instance
  const socketRef = useRef(null);

  // console.log('currentSession--------------------',currentSession)
  // console.log('sessions----------------------------',sessions)
  // Initial fetch of sessions
  useEffect(() => {
    console.log(
      "CommunicationChannel: Component mounted, setting up socket connection"
    );

    // Create socket instance inside the component
    if (!socketRef.current) {
      console.log("Creating new socket instance...");
      socketRef.current = io(API_CONFIG.BASE_URL || "http://localhost:3000", {
        path: "/socket.io",
        auth: {
          token: localStorage.getItem("authToken"),
        },
        transports: ["polling"],
        forceNew: true, // Force a new connection
      });
    }

    const socket = socketRef.current;

    // Handle socket connection event
    const handleConnect = () => {
      console.log("Socket connected successfully, requesting initial data");
      // Request initial data only after socket is connected
      socket.emit("load_sessions");
    };

    // Handle socket disconnect event
    const handleDisconnect = (reason) => {
      console.log("Socket disconnected:", reason);
    };

    // Handle connection error
    const handleConnectError = (error) => {
      console.log("Socket connection error:", error);
    };

    // Set up connection event listeners first
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    // Connect and set up event listeners when component mounts
    if (!socket.connected) {
      console.log("Socket not connected, attempting to connect...");
      socket.connect();
    } else {
      console.log("Socket already connected, requesting data immediately");
      // If already connected, request data immediately
      socket.emit("load_sessions");
    }

    // Handle sessions data
    socket.on("sessions_loaded", (sessions) => {
      console.log("sessions_loaded: ", sessions);
      // Initialize unreadCount and sort by updatedAt (newest first)
      const sessionsWithUnreadCount = sessions.map((session) => ({
        ...session,
        unreadCount: session.unreadCount || 0,
      }));

      // Sort by lastMessageAt (newest first), falling back to updatedAt if not available
      const sortedSessions = [...sessionsWithUnreadCount].sort((a, b) => {
        const dateA = new Date(a.lastMessageAt || a.updatedAt);
        const dateB = new Date(b.lastMessageAt || b.updatedAt);
        return dateB - dateA; // Newest first
      });

      setLocalSessions(sortedSessions);

      // Process phone parameter if needed
      if (phoneParam && !processedPhoneParam) {
        const normalizedPhoneParam = normalizePhoneNumber(phoneParam);
        const matchingSession = sessionsWithUnreadCount.find(
          (session) =>
            normalizePhoneNumber(session.phoneNumber) === normalizedPhoneParam
        );

        if (matchingSession) {
          dispatch(setCurrentSession(matchingSession));
        } else {
          dispatch(setCurrentSession(null));
          toast.info(
            `No conversation found for ${normalizedPhoneParam}. Please select a conversation from the list.`
          );
        }
        setProcessedPhoneParam(true);
      }
    });

    // Handle new session added
    // Handle new session added - using named function for proper cleanup
    const handleSessionAdded = (session) => {
      console.log("New session added:", session);
      setLocalSessions((prev) => {
        // Check if session already exists
        const exists = prev.some((s) => s._id === session._id);
        if (!exists) {
          return [session, ...prev];
        }
        return prev;
      });
    };
    socket.on("session_added", handleSessionAdded);

    // Handle session updated
    socket.on("session_updated", (updatedSession) => {
      setLocalSessions((prev) =>
        prev.map((session) =>
          session._id === updatedSession._id ? updatedSession : session
        )
      );

      // Update current session if it's the one that was updated
      if (currentSession && currentSession._id === updatedSession._id) {
        dispatch(setCurrentSession(updatedSession));
      }
    });

    // Handle messages loaded for a session
    socket.on("messages_loaded", ({ sessionId, messages }) => {
      console.log("messages_loaded-----------", messages);
      console.log("sessionId-----------", sessionId);
      // Remove duplicates by message content and timestamp
      const uniqueMessages = removeDuplicateMessages(messages);

      // Check if messages have actually changed before updating state
      setLocalMessages((prevMessages) => {
        if (
          prevMessages.length === uniqueMessages.length &&
          prevMessages.every((msg, i) => msg._id === uniqueMessages[i]._id)
        ) {
          return prevMessages; // No change needed
        }
        return uniqueMessages;
      });

      // Update sent messages tracking
      uniqueMessages.forEach((msg) => {
        if (msg._id) {
          sentMessagesRef.current.add(msg._id);
        }
      });
    });

    // Handle new message added
    socket.on("message_added", (msg) => {
      console.log("message_added: ", msg);
      const isCurrentSession = msg.sessionId === currentSession?._id;
      if (isCurrentSession) {
        // If session already openend and new message come then mark it as read
        socket.emit("mark_as_read", msg.sessionId);
      }
      setLocalSessions((prev) => {
        // 1. First update the session that received the message
        const updatedSessions = prev.map((session) => {
          if (session?._id === msg?.sessionId) {
            return {
              ...session,
              lastMessage:
                msg.user ||
                (typeof msg.bot === "string"
                  ? msg.bot
                  : msg.bot?.text || "New message"),
              lastMessageAt: new Date().toISOString(), // Always update lastMessageAt
              updatedAt: new Date().toISOString(),
              unreadCount: isCurrentSession
                ? 0
                : (session.unreadCount || 0) + 1, // Reset unread count for message updates
            };
          }
          return session;
        });

        // 2. Then sort all sessions by lastMessageAt (newest first)
        return [...updatedSessions].sort((a, b) => {
          const dateA = new Date(a.lastMessageAt || a.updatedAt);
          const dateB = new Date(b.lastMessageAt || b.updatedAt);
          return dateB - dateA; // Descending order (newest first)
        });
      });
      
      // Update current conversation messages regardless of which session it's for
      if (msg?._id && !sentMessagesRef.current.has(msg?._id)) {
        sentMessagesRef.current.add(msg._id);
        setLocalMessages((prev) => [...prev, msg]);
        setShouldAutoScroll(true);
      }
    });

    // Initialize state after setup
    setTimeout(() => {
      setIsInitialized(true);
      setHasInitialLoad(true);
    }, 100);

    // Clean up event listeners when component unmounts
    return () => {
      console.log("CommunicationChannel: Cleaning up socket event listeners");
      if (socket) {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        socket.off("connect_error", handleConnectError);
        socket.off("sessions_loaded");
        socket.off("session_added", handleSessionAdded);
        socket.off("session_updated");
        socket.off("messages_loaded");
        socket.off("message_added");
        // Don't disconnect the socket here, just remove listeners
        // socket.disconnect();
      }
    };
  }, [dispatch, phoneParam, processedPhoneParam]);

  // Temporary debug - listen to all events
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const debugAllEvents = (eventName, ...args) => {
      if (eventName !== "heartbeat") {
        // Skip noisy heartbeat events
        console.log("Socket event:", eventName, args);
      }
    };

    socket.onAny(debugAllEvents);

    return () => {
      if (socket) {
        socket.offAny(debugAllEvents);
      }
    };
  }, []);

  // Add a more frequent polling mechanism as a backup
  useEffect(() => {
    const socket = socketRef.current;
    if (currentSession?._id && socket) {
      const pollInterval = setInterval(() => {
        socket.emit("load_messages", currentSession._id);
        socket.emit("mark_as_read", currentSession._id);
      }, 10000);

      return () => clearInterval(pollInterval);
    }
  }, [currentSession?._id]);

  // Add a heartbeat to keep connection alive
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const heartbeat = setInterval(() => {
      if (socket.connected) {
        socket.emit("heartbeat");
      } else {
        socket.connect();
        socket.emit("load_sessions");
        if (currentSession?._id) {
          socket.emit("load_messages", currentSession._id);
          socket.emit("mark_as_read", currentSession._id);
        }
      }
    }, 1000); // Every 30 seconds

    return () => clearInterval(heartbeat);
  }, [currentSession]);

  // Update this useEffect to set assigned agents when session changes
  useEffect(() => {
    if (currentSession && hasInitialLoad) {
      // If the current session has assignedUsers, use that directly
      if (
        currentSession.assignedUsers &&
        Array.isArray(currentSession.assignedUsers)
      ) {
        // Create agent objects from the assignedUsers data
        const assignedAgentsList = currentSession.assignedUsers
          .filter((assignment) => assignment.isActive)
          .map((assignment) => {
            // Find the corresponding subAdmin if available
            const subAdmin = subAdmins?.find(
              (admin) => admin._id === assignment.userId
            );

            return {
              _id: assignment.userId,
              fullName: subAdmin?.fullName || assignment.name || "Agent",
              email: subAdmin?.email || assignment.email || "",
              isActive: true,
            };
          });

        setAssignedAgents(assignedAgentsList);
        // Also set as pending agents so they appear checked in the dropdown
        setPendingAgents(assignedAgentsList);
      } else {
        // Reset agents for new session with no assigned users
        setAssignedAgents([]);
        setPendingAgents([]);
      }
    }
  }, [currentSession?._id, hasInitialLoad, subAdmins]);

  // Function to remove duplicate messages
  const removeDuplicateMessages = (messages) => {
    const uniqueMap = new Map();
    const seenMessageIds = new Set();

    // First pass: Filter out duplicates by messageId
    const messagesWithoutDuplicateIds = messages.filter((msg) => {
      if (!msg.messageId) return true;

      if (seenMessageIds.has(msg.messageId)) {
        return false;
      }

      seenMessageIds.add(msg.messageId);
      return true;
    });

    // Second pass: Group messages by content and timestamp (rounded to minute)
    messagesWithoutDuplicateIds.forEach((msg) => {
      const isUser = !!msg.user;
      const content = isUser
        ? msg.user
        : typeof msg.bot === "string"
        ? msg.bot
        : msg.bot?.text || msg.bot?.content || JSON.stringify(msg.bot);

      // Round timestamp to the minute to group messages sent in the same minute
      const timestamp = new Date(msg.date);
      const timeKey = `${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}-${timestamp.getHours()}-${timestamp.getMinutes()}`;

      const key = `${isUser ? "user" : "bot"}-${content}-${timeKey}-${
        msg.messageType || "text"
      }`;

      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, msg);
      } else {
        // If we already have this message, keep the one with a valid _id
        const existing = uniqueMap.get(key);
        if (!existing._id && msg._id) {
          uniqueMap.set(key, msg);
        }
      }
    });

    // Convert back to array and sort by date
    return Array.from(uniqueMap.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  };

  // Handle scroll events to detect if user is reading previous messages
  const handleScroll = () => {
    if (chatBodyRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
      const isBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 20;

      // Only update auto-scroll behavior when user manually scrolls
      if (isBottom !== shouldAutoScroll) {
        setShouldAutoScroll(isBottom);
      }

      setIsAtBottom(isBottom);

      // Reset new message count when user scrolls to bottom
      if (isBottom && newMessageCount > 0) {
        setNewMessageCount(0);
      }
    }
  };

  // Add this useEffect to handle initial scroll and attach scroll listener
  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (chatBody) {
      // Initial scroll to bottom only on first load
      if (localMessages.length > 0 && shouldAutoScroll) {
        chatBody.scrollTop = chatBody.scrollHeight;
      }

      chatBody.addEventListener("scroll", handleScroll);
      return () => chatBody.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Modify this useEffect to respect user's scrolling position
  useEffect(() => {
    // Only auto-scroll if user is already at the bottom or it's the first load
    if (chatBodyRef.current && shouldAutoScroll) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [localMessages]);

  // Add useEffect to handle filter dropdown clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  // Helper function to check if a session is assigned
  const isSessionAssigned = (session) => {
    return (
      session.assignedUsers &&
      Array.isArray(session.assignedUsers) &&
      session.assignedUsers.some((assignment) => assignment.isActive)
    );
  };

  // Update the filteredSessions logic to include filter type
  const filteredSessions = localSessions.filter((session) => {
    // First filter by search query
    const matchesSearch = (session.name || session.phoneNumber)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Then filter by assignment status
    switch (filterType) {
      case "assigned":
        return isSessionAssigned(session);
      case "unassigned":
        return !isSessionAssigned(session);
      case "all":
      default:
        return true;
    }
  });

  // Function to handle filter selection
  const handleFilterSelect = (filter) => {
    setFilterType(filter);
    setIsFilterOpen(false);
  };

  // Function to get filter display text
  const getFilterDisplayText = () => {
    switch (filterType) {
      case "assigned":
        return "Assigned";
      case "unassigned":
        return "Unassigned";
      case "all":
      default:
        return "All";
    }
  };

  // Function to get filter count
  const getFilterCount = (type) => {
    switch (type) {
      case "assigned":
        return localSessions.filter((session) => isSessionAssigned(session))
          .length;
      case "unassigned":
        return localSessions.filter((session) => !isSessionAssigned(session))
          .length;
      case "all":
      default:
        return localSessions.length;
    }
  };

  // Update the session click handler to use WebSockets
  // Update the session click handler to use WebSockets
  const handleSessionClick = (session) => {
    const socket = socketRef.current;
    if (!socket) return;

    // Reset auto-scroll and message count when changing sessions
    setShouldAutoScroll(true);
    setNewMessageCount(0);

    // Clear previous session data
    console.log("session_clicked-----------", session);
    sentMessagesRef.current.clear();
    setLocalMessages([]);

    // Request messages for the selected session
    socket.emit("load_messages", session._id);
    socket.emit("mark_as_read", session._id);

    // Reset unread count locally immediately
    setLocalSessions((prev) =>
      prev.map((s) => (s._id === session._id ? { ...s, unreadCount: 0 } : s))
    );

    // Update URL with the new phone number
    if (session.phoneNumber) {
      const url = new URL(window.location);
      url.searchParams.set("phone", session.phoneNumber);
      window.history.pushState({}, "", url);
    }

    // Set the new current session
    dispatch(setCurrentSession(session));
    setProcessedPhoneParam(true);
  };

  // Use useCallback for the setMessageText function to prevent recreating it on every render
  const handleSetMessageText = useCallback((value) => {
    setMessageText(value);
    messageTextRef.current = value;
  }, []);

  // Handle reply to message
  const handleReplyToMessage = (messageContent) => {
    // Set the message we're replying to
    setReplyingTo({
      content: messageContent,
      timestamp: new Date().toISOString(),
    });

    // Focus the input field
    const inputField = document.querySelector(".comm-channel-chat-input input");
    if (inputField) {
      inputField.focus();
    }
  };

  // Clear reply
  const clearReply = () => {
    setReplyingTo(null);
  };

  // Update the send message handler to use WebSockets
  // Update the send message handler to use WebSockets
  const handleSendMessage = useCallback(
    (e) => {
      e.preventDefault();
      const text = messageTextRef.current.trim();
      if (!text || !currentSession) return;

      const socket = socketRef.current;
      if (!socket) return;

      // Create temporary message for optimistic UI update
      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        _id: tempId,
        user: null,
        bot: {
          type: "text",
          text,
          replyTo: replyingTo
            ? {
                content: replyingTo.content,
                timestamp: replyingTo.timestamp,
              }
            : null,
        },
        sessionId: currentSession._id,
        date: new Date(),
      };

      // Add to local state immediately for responsive UI
      if (!sentMessagesRef.current.has(tempId)) {
        sentMessagesRef.current.add(tempId);
        setLocalMessages((prev) => [...prev, tempMessage]);
      }

      // Clear input and reply state
      setMessageText("");
      messageTextRef.current = "";
      clearReply();

      // Send message through WebSocket
      socket.emit("new_message", {
        user: null,
        bot: {
          type: "text",
          text,
          replyTo: replyingTo
            ? {
                content: replyingTo.content,
                timestamp: replyingTo.timestamp,
              }
            : null,
        },
        sessionId: currentSession._id,
      });
    },
    [currentSession, replyingTo, clearReply]
  );

 
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Updated function to send simple text messages instead of opening modal
  const sendPredefinedResponse = (responseType) => {
    if (!currentSession) {
      toast.error("Please select a conversation first");
      return;
    }

    let messageText = "";

    switch (responseType) {
      case "bookings":
        messageText =
          "Thank you for your interest in our booking services! 📅 Our team will get back to you shortly with the details.";
        break;
      case "thankyou":
        messageText =
          "Thank you so much for choosing our services! 🎉 We appreciate your trust in us and look forward to serving you.";
        break;
      case "payment":
        messageText =
          "Thank you for your payment! 💳 Your transaction has been received. You will receive a confirmation email shortly.";
        break;
      default:
        toast.error("Unknown response type");
        return;
    }

    // Create temporary message for immediate UI update
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      user: null,
      bot: {
        type: "text",
        text: messageText,
      },
      sessionId: currentSession._id,
      date: new Date(),
    };

    // Add to local messages immediately
    if (!sentMessagesRef.current.has(tempId)) {
      sentMessagesRef.current.add(tempId);
      setLocalMessages((prev) => [...prev, tempMessage]);

      // Send the actual message
      dispatch(
        sendMessage({
          user: null,
          bot: {
            type: "text",
            text: messageText,
          },
          sessionId: currentSession._id,
        })
      );

      toast.success("Message sent successfully!");
    }
  };

  // Use useCallback for the handleAgentSelect function
  const handleAgentSelect = useCallback((agents) => {
    setPendingAgents(agents);
  }, []);

  // Use useCallback for the handleAgentAdd function
  const handleAgentAdd = useCallback(() => {
    // Update assigned agents based on pending selection
    setAssignedAgents(pendingAgents);
  }, [pendingAgents]);

  // Handle removing individual assigned agent
  const handleRemoveAssignedAgent = (agentToRemove) => {
    setAssignedAgents(
      assignedAgents.filter((agent) => agent._id !== agentToRemove._id)
    );
    setPendingAgents(
      pendingAgents.filter((agent) => agent._id !== agentToRemove._id)
    );
  };

  // Handle tab navigation - ONLY open sidebar when user explicitly clicks
  const handleTabNavigation = (tabType) => {
    if (!currentSession) return;

    // Ensure we have a valid tab type before opening sidebar
    switch (tabType) {
      case "leads":
        dispatch(
          getAllLeadsWithSearchFilter({
            phoneNumber: normalizePhoneNumber(currentSession?.phoneNumber),
            page: 1,
            limit: 50,
          })
        );
        // Set both activeTab and sidebar state atomically
        setActiveTab("leads");
        setRightSidebarOpen(true);
        break;
      case "bookings":
        // Fetch bookings by phone number
        dispatch(
          fetchBookingByNumber({
            phoneNumber: normalizePhoneNumber(currentSession?.phoneNumber),
            value: "bookings",
          })
        );
        // Set both activeTab and sidebar state atomically
        setActiveTab("bookings");
        setRightSidebarOpen(true);
        break;
      default:
        // Don't open sidebar for invalid tab types
        break;
    }
  };

  // Handle sidebar close - reset both states
  const handleSidebarClose = () => {
    setRightSidebarOpen(false);
    setActiveTab(null);
  };

  // Function to get display name for chat header
  const getChatDisplayName = () => {
    return (
      currentSession.name || normalizePhoneNumber(currentSession?.phoneNumber)
    );
  };

  // Add this useEffect to check if the conversation is expired
  useEffect(() => {
    if (currentSession) {
      // Check if the conversation is expired (more than 24 hours)
      const lastMessageTime =
        currentSession.updatedAt || currentSession.createdAt;
      const lastMessageDate = new Date(lastMessageTime);
      const currentDate = new Date();
      const hoursDifference =
        (currentDate - lastMessageDate) / (1000 * 60 * 60);

      // If more than 24 hours have passed, mark as expired
      setIsConversationExpired(hoursDifference > 24);
    }
  }, [currentSession]);

  // Function to toggle sidebar collapse
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    // Close filter when collapsing
    if (!isSidebarCollapsed) {
      setIsFilterOpen(false);
    }
  };

  // Function to get initials or digits for collapsed view
  const getCollapsedDisplay = (session) => {
    if (session.name) {
      // If name exists, return first letter
      return session.name.charAt(0).toUpperCase();
    } else if (session.phoneNumber) {
      // If phone number, return first two digits after country code (skip +91)
      const digits = session.phoneNumber.replace(/\D/g, "");

      // Skip country code (first 2 digits if it's 91, or first 1-3 digits generally)
      let mainNumber = digits;
      if (digits.startsWith("91") && digits.length > 2) {
        // Skip +91 country code
        mainNumber = digits.substring(2);
      } else if (digits.startsWith("1") && digits.length > 1) {
        // Skip +1 country code (US/Canada)
        mainNumber = digits.substring(1);
      }

      return mainNumber.length >= 2
        ? `${mainNumber.substring(0, 2)}...`
        : mainNumber + "...";
    }
    return "?";
  };

  // Function to get tooltip text for collapsed view
  const getTooltipText = (session) => {
    const name = session.name || "Unknown";
    const phone = normalizePhoneNumber(session.phoneNumber) || "No number";
    return `${name}\n${phone}`;
  };
  // Add this function to handle scroll events


  // Add this function to scroll to bottom on demand
  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      setShouldAutoScroll(true);
      setNewMessageCount(0); // Reset counter when scrolling down
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (chatBody) {
      chatBody.addEventListener("scroll", handleScroll);
      return () => chatBody.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div className="  w-auto min-h-screen bg-gradient-to-b from-gray-100 to-white p-4 md:p-8 lg:p-12 fixed ">
      <MessageMenuContext.Provider value={{ openMenuId, setOpenMenuId }}>
        <div
          className={`comm-channel-root ${
            rightSidebarOpen ? "sidebar-open" : ""
          } ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}
        >
          <div className="comm-channel-main">
            <div
              className={`comm-channel-sidebar ${
                isSidebarCollapsed ? "collapsed" : ""
              }`}
            >
              {/* Header with title and action icons */}
              <div className="comm-channel-sidebar-header">
                <h2>{!isSidebarCollapsed ? "Chat Management" : ""}</h2>
                <div className="sidebar-header-actions">
                  {!isSidebarCollapsed && (
                    <div className="filter-container" ref={filterRef}>
                      <button
                        className={`header-icon-btn filter-btn ${
                          filterType !== "all" ? "active" : ""
                        }`}
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        title={`Filter: ${getFilterDisplayText()}`}
                      >
                        <i className="fas fa-filter"></i>
                      </button>

                      {isFilterOpen && (
                        <div className="whatsapp-filter-dropdown">
                          <div className="filter-dropdown-header">
                            <span>Filter chats by</span>
                          </div>

                          <div className="filter-options-list">
                            <div
                              className={`whatsapp-filter-option ${
                                filterType === "all" ? "active" : ""
                              }`}
                              onClick={() => handleFilterSelect("all")}
                            >
                              <div className="filter-option-content">
                                <i className="fas fa-comments filter-option-icon"></i>
                                <span className="filter-option-text">All</span>
                              </div>
                              <span className="filter-option-count">
                                {getFilterCount("all")}
                              </span>
                            </div>

                            <div
                              className={`whatsapp-filter-option ${
                                filterType === "assigned" ? "active" : ""
                              }`}
                              onClick={() => handleFilterSelect("assigned")}
                            >
                              <div className="filter-option-content">
                                <i className="fas fa-user-check filter-option-icon"></i>
                                <span className="filter-option-text">
                                  Assigned
                                </span>
                              </div>
                              <span className="filter-option-count">
                                {getFilterCount("assigned")}
                              </span>
                            </div>

                            <div
                              className={`whatsapp-filter-option ${
                                filterType === "unassigned" ? "active" : ""
                              }`}
                              onClick={() => handleFilterSelect("unassigned")}
                            >
                              <div className="filter-option-content">
                                <i className="fas fa-user-clock filter-option-icon"></i>
                                <span className="filter-option-text">
                                  Unassigned
                                </span>
                              </div>
                              <span className="filter-option-count">
                                {getFilterCount("unassigned")}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    className="header-icon-btn collapse-btn"
                    onClick={toggleSidebarCollapse}
                    title={
                      isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                    }
                  >
                    <i
                      className={`fas ${
                        isSidebarCollapsed
                          ? "fa-chevron-right"
                          : "fa-chevron-left"
                      }`}
                    ></i>
                  </button>
                </div>
              </div>

              {isSidebarCollapsed ? (
                /* Collapsed sidebar view */
                <div className="collapsed-conversations">
                  {filteredSessions.slice(0, 10).map((session) => (
                    <div
                      key={session._id}
                      className={`collapsed-conv-item ${
                        currentSession && currentSession._id === session._id
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleSessionClick(session)}
                      title={getTooltipText(session)}
                    >
                      <div className="collapsed-conv-avatar">
                        {getCollapsedDisplay(session)}
                      </div>
                      {isSessionAssigned(session) && (
                        <div className="collapsed-assigned-dot"></div>
                      )}
                    </div>
                  ))}
                  {filteredSessions.length > 10 && (
                    <div
                      className="collapsed-conv-more"
                      title={`+${
                        filteredSessions.length - 10
                      } more conversations`}
                    >
                      +{filteredSessions.length - 10}
                    </div>
                  )}
                </div>
              ) : (
                /* Expanded sidebar view */
                <>
                  <div className="comm-channel-search">
                    <i className="fa fa-search"></i>
                    <input
                      type="text"
                      placeholder="Search contacts"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="comm-channel-fav-header">
                    <span>Conversations</span>
                    {filterType !== "all" && (
                      <span className="active-filter-badge">
                        {getFilterDisplayText()}
                      </span>
                    )}
                  </div>

                  <div className="comm-channel-conv-list">
                    {filteredSessions.length === 0 ? (
                      <div className="no-results">
                        {searchQuery
                          ? "No conversations found"
                          : filterType === "assigned"
                          ? "No assigned conversations"
                          : filterType === "unassigned"
                          ? "No unassigned conversations"
                          : "No conversations found"}
                      </div>
                    ) : (
                      filteredSessions.map((session) => (
                        <div
                          key={session._id}
                          className={`comm-channel-conv-item${
                            currentSession && currentSession._id === session._id
                              ? " active"
                              : ""
                          }`}
                          onClick={() => handleSessionClick(session)}
                        >
                          <img
                            src={MALE_AVATAR}
                            alt={session.name || session.phoneNumber}
                            className="comm-channel-conv-avatar"
                          />
                          <div className="comm-channel-conv-info">
                            <div className="comm-channel-conv-top">
                              <span className="comm-channel-conv-name">
                                {session.name || session.phoneNumber}
                                {isSessionAssigned(session) && (
                                  <i
                                    className="fas fa-user text-travel-purple"
                                    title="Assigned to agent"
                                  ></i>
                                )}
                              </span>
                              <span className="comm-channel-conv-time">
                                {new Date(
                                  session.updatedAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="comm-channel-conv-msg">
                              {session.lastMessage ||
                                "Tap to view conversation"}
                              {/* Only show badge if not current session AND has unread messages */}
                              {session.unreadCount > 0 &&
                                (!currentSession ||
                                  currentSession._id !== session._id) && (
                                  <span className="unread-badge">
                                    {session.unreadCount}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {currentSession ? (
              <div className="comm-channel-chat">
                <div className="comm-channel-chat-header">
                  <div className="comm-channel-user-info">
                    <img
                      src={MALE_AVATAR}
                      alt={
                        currentSession.name ||
                        normalizePhoneNumber(currentSession?.phoneNumber)
                      }
                    />
                    <div className="comm-channel-user-details">
                      <div className="comm-channel-chat-user">
                        {getChatDisplayName()}
                      </div>
                      <div className="comm-channel-chat-status">
                        {currentSession.awaitingName
                          ? "Awaiting name"
                          : currentSession.awaitingAppointment
                          ? "Awaiting appointment"
                          : "Active"}
                        {assignedAgents.length > 0 && (
                          <div className="assigned-agents">
                            • Assigned to:
                            <div className="agent-avatars">
                              {assignedAgents.map((agent) => (
                                <div
                                  key={agent._id}
                                  className="agent-avatar-container"
                                >
                                  <AgentAvatar
                                    agent={agent}
                                    size="small"
                                    showTooltip={true}
                                  />
                                  <button
                                    className="remove-agent-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveAssignedAgent(agent);
                                    }}
                                    title={`Remove ${
                                      agent.fullName || "Agent"
                                    }`}
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="comm-channel-header-right">
                    <div className="comm-channel-user-tabs">
                      <button
                        className="comm-channel-tab-btn"
                        onClick={() => handleTabNavigation("leads")}
                        title={`View leads for ${normalizePhoneNumber(
                          currentSession?.phoneNumber
                        )}`}
                      >
                        <i className="fas fa-users"></i>
                        <span>Leads</span>
                      </button>

                      <AgencyDropdown
                        pendingAgents={pendingAgents}
                        assignedAgents={assignedAgents}
                        onAgentSelect={handleAgentSelect}
                        onAgentAdd={handleAgentAdd}
                        currentSession={currentSession}
                      />

                      <button
                        className="comm-channel-tab-btn"
                        onClick={() => handleTabNavigation("bookings")}
                        title={`View bookings for ${normalizePhoneNumber(
                          currentSession?.phoneNumber
                        )}`}
                      >
                        <i className="fas fa-calendar-alt"></i>
                        <span>Bookings</span>
                      </button>
                    </div>

                    <div className="comm-channel-chat-actions">
                      {/* <i
                      className="fa fa-trash comm-channel-chat-info"
                      onClick={handleClearChat}
                      title="Clear all messages"
                    ></i> */}
                    </div>
                  </div>
                </div>

                <div
                  className="comm-channel-chat-body"
                  ref={chatBodyRef}
                  onScroll={handleScroll}
                >
                  {localMessages?.length === 0 ? (
                    <div className="no-messages">
                      {!socketRef.current?.connected ? (
                        <div className="loading-container">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
                          <span>Connecting...</span>
                        </div>
                      ) : (
                        <div className="loading-container">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
                          <span>Loading messages...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    localMessages.map((msg, index) => {
                      // Generate a stable key that won't cause duplicates
                      const msgKey = msg._id || `msg-${index}-${msg.date}`;

                      return (
                        <div
                          key={msgKey}
                          className={`comm-channel-msg-row ${
                            msg.user ? "recv" : "sent"
                          }`}
                          // onDoubleClick={() => handleDeleteMessage(msg._id)}
                        >
                          {msg.user && (
                            <img
                              src={MALE_AVATAR}
                              alt="User"
                              className="comm-channel-msg-avatar"
                            />
                          )}
                          <div className="comm-channel-msg-bubble">
                            {/* Add reply preview if this message is a reply */}
                            {msg.bot?.replyTo && (
                              <div className="message-reply-preview">
                                <div className="reply-content">
                                  {msg.bot.replyTo.content}
                                </div>
                              </div>
                            )}
                          
                            <div className="comm-channel-msg-text">
                              {msg.user ? (
                                <UserMessage key={msgKey} msg={msg} />
                              ) : (
                                <BotMessage bot={msg.bot} agentName={msg?.agentDetails?.fullName}/>
                              )}
                              <span className="comm-channel-msg-time">
                                {formatMessageTime(msg.date)}
                              </span>

                              {/* Add the message action menu */}
                              <MessageActionMenu
                                message={msg}
                                currentSession={currentSession}
                                onReply={handleReplyToMessage}
                              />
                            </div>
                          </div>
                          {!msg.user && (
                            <img
                              src={FEMALE_AVATAR}
                              alt="Bot"
                              className="comm-channel-msg-avatar"
                            />
                          )}
                        </div>
                      );
                    })
                  )}

                  {!isAtBottom && (
                    <button
                      className={`scroll-to-bottom-btn ${
                        !isAtBottom ? "visible" : ""
                      }`}
                      onClick={() => {
                        scrollToBottom();
                        setShouldAutoScroll(true);
                      }}
                      title={
                        newMessageCount > 0
                          ? `${newMessageCount} new message${
                              newMessageCount > 1 ? "s" : ""
                            }`
                          : "Scroll to bottom"
                      }
                    >
                      <i className="fas fa-arrow-down"></i>
                      {newMessageCount > 0 && (
                        <span className="new-message-count">
                          {newMessageCount}
                        </span>
                      )}
                    </button>
                  )}
                </div>

                <div className="comm-channel-quick-responses">
                  <button
                    onClick={() => sendPredefinedResponse("bookings")}
                    className="hover:bg-travel-purple/10 transition-colors"
                  >
                    📅 Bookings
                  </button>
                  <button
                    onClick={() => sendPredefinedResponse("thankyou")}
                    className="hover:bg-travel-purple/10 transition-colors"
                  >
                    🎉 Thank You
                  </button>
                  <button
                    onClick={() => sendPredefinedResponse("payment")}
                    className="hover:bg-travel-purple/10 transition-colors"
                  >
                    💳 Payment
                  </button>
                </div>

                {/* Add reply preview above the input field */}
                {replyingTo && (
                  <div className="reply-container">
                    <div className="reply-preview">
                      <div className="reply-content">{replyingTo.content}</div>
                      <button className="reply-close-btn" onClick={clearReply}>
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                )}

                <ChatInput
                  messageText={messageText}
                  setMessageText={handleSetMessageText}
                  handleSendMessage={handleSendMessage}
                  loading={loading}
                  isExpired={isConversationExpired}
                  currentSessionId={currentSession?._id}
                  currentSession={currentSession}
                />
              </div>
            ) : (
              <div className="comm-channel-empty-state">
                <div className="empty-state-content">
                  <img
                    src={noChatImage}
                    alt="No chat selected"
                    className="no-chat-image"
                  />
                  <h3>Select a conversation</h3>
                  <p>Choose a conversation from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>

          {/* Only render RightSidebar when it should be open AND has valid activeTab */}
          <RightSidebar
            isOpen={rightSidebarOpen && activeTab !== null}
            onClose={handleSidebarClose}
            activeTab={activeTab}
            currentSession={currentSession}
            selectedAgents={assignedAgents}
          />
        </div>
      </MessageMenuContext.Provider>

     
    </div>
  );
};

export default CommunicationChannel;
