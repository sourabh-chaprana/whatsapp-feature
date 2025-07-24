import { Routes, Route } from "react-router-dom";
import CommunicationChannel from "./whatsappModule/BotManagement/CommunicationChannel";
import WhatsappSettings from "./facebook/WhatsappSettings";

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<CommunicationChannel />} />
        <Route path="/whatsapp-settings" element={<WhatsappSettings />} />
      </Routes>
    </div>
  );
}

export default App;
