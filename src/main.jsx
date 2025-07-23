import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { BrowserRouter } from 'react-router-dom'
import { store, persistor } from './store/store'
import './index.css'
import App from './App.jsx'

// Set the auth token in localStorage for testing
const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJvc2hhbi5rdW1hckB3aGlsdGVyLmFpIiwicm9sZSI6IkFETUlOIiwiZnVsbE5hbWUiOiJSb3NoYW4gdGVzdCIsIm9yZ0lkIjoiM2ZmODljMTItOWVhYS00MWJlLWJlZTMtN2UxODg5NDJmZmRmIiwidXNlcklkIjoiNjg2ZjY4ZDg5MWU1YzAxMTNhYjU4N2U5IiwiaWF0IjoxNzUzMTgxNjgwLCJleHAiOjE3NTMxODUyODB9.qb24LTcwBg68_o4FIt2Pn9IKxLt81a-USLASTO9dBVA";
localStorage.setItem("authToken", testToken);
console.log("Auth token set in localStorage:", testToken);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
