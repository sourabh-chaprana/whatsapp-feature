import { Routes, Route } from "react-router-dom";
import CommunicationChannel from "./whatsappModule/BotManagement/CommunicationChannel";
import WhatsappSettings from "./facebook/WhatsappSettings";
import Layout from "./components/Layout";
import TemplatesView from "./campaign/TemplatesView";
import CampaignPage from "./campaign/CampaignPage";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CommunicationChannel />} />
        <Route path="/whatsapp-settings" element={<WhatsappSettings />} />
        <Route path="/campaign" element={<CampaignPage />} />
        <Route path="/campaign/templates" element={<TemplatesView />} />
      </Routes>
    </Layout>
  );
}

export default App;
