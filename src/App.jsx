import { Routes, Route } from 'react-router-dom'
import CommunicationChannel from './whatsappModule/BotManagement/CommunicationChannel'

function App() {
  return (
    <div className="app-container bg-red-500 text-white p-4">
      <Routes>
        <Route path="/" element={<CommunicationChannel />} />
      </Routes>
    </div>
  )
}

export default App
