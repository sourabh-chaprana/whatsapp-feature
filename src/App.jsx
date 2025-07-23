import { Routes, Route } from "react-router-dom";
import CommunicationChannel from "./whatsappModule/BotManagement/CommunicationChannel";

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<CommunicationChannel />} />
      </Routes>
    </div>
  );
}

export default App;
