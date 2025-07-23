import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/auth/authSlice";
import leadReducer from "./slices/leads/leadSlice";
import crmReducer from "./slices/crmSlice";
import organizationsReducer from "./slices/organizations/organizationsSlice";
import subAdminReducer from "./slices/subAdmin/subAdminSlice";
import chatReducer from "./slices/chats/chatSlice";
import whatsappReducer from "./slices/whatsapp/whatsappSlice";
import bookingReducer from "./slices/bookings/bookingSlice";
// import dashboardReducer from "./slices/dashboard/dashboardSlice";
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["isAuthenticated", "token"],
};

// WhatsApp persist config to keep connection state
const whatsappPersistConfig = {
  key: "whatsapp",
  storage,
  whitelist: [
    "isConnected",
    "accessToken",
    "businessAccountId",
    "phoneNumberId",
    "wabaId",
    "verificationStatus",
  ],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedWhatsappReducer = persistReducer(
  whatsappPersistConfig,
  whatsappReducer
);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    leads: leadReducer,
    crm: crmReducer,
    organizations: organizationsReducer,
    subAdmins: subAdminReducer,
    chat: chatReducer,
    whatsapp: persistedWhatsappReducer,
    bookings: bookingReducer,
    // dashboard: dashboardReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export default store;
