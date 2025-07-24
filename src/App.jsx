import { Routes, Route } from "react-router-dom";
import CommunicationChannel from "./whatsappModule/BotManagement/CommunicationChannel";
import WhatsappSettings from "./facebook/WhatsappSettings";
import Layout from "./components/Layout";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CommunicationChannel />} />
        <Route path="/whatsapp-settings" element={<WhatsappSettings />} />
      </Routes>
    </Layout>
  );
}

export default App;
