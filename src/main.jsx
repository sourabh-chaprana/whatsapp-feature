import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { BrowserRouter } from "react-router-dom";
import { store, persistor } from "./store/store";
import "./index.css";
import App from "./App.jsx";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Set the auth token in localStorage for testing
const testToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJvc2hhbi5rdW1hckB3aGlsdGVyLmFpIiwicm9sZSI6IkFETUlOIiwiZnVsbE5hbWUiOiJSb3NoYW4gdGVzdCIsIm9yZ0lkIjoiM2ZmODljMTItOWVhYS00MWJlLWJlZTMtN2UxODg5NDJmZmRmIiwidXNlcklkIjoiNjg2ZjY4ZDg5MWU1YzAxMTNhYjU4N2U5IiwiaWF0IjoxNzUzMzMyNTYxLCJleHAiOjE3NTMzMzYxNjF9.cEUg59Mq_I8mWaMP3ztvPSG_Q4jdPVMA-ZPjwD-IhHE";
localStorage.setItem("authToken", testToken);
console.log("Auth token set in localStorage:", testToken);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>
);
