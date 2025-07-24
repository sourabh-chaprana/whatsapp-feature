import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-[#1e2738] transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        {/* Logo area */}
        <div className="flex items-center h-16 bg-blue-600 px-4">
          {!collapsed && <span className="text-white text-lg font-semibold">WhatsApp Feature</span>}
          {collapsed && <span className="text-white text-lg font-semibold mx-auto">WF</span>}
        </div>
        
        {/* Navigation */}
        <nav className="mt-4 px-2">
          <Link 
            to="/" 
            className={`flex items-center py-3 px-4 rounded-lg mb-2 ${
              location.pathname === '/' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-comment-dots text-lg"></i>
            {!collapsed && <span className="ml-3">WhatsApp Chat</span>}
          </Link>
          
          <Link 
            to="/whatsapp-settings" 
            className={`flex items-center py-3 px-4 rounded-lg ${
              location.pathname === '/whatsapp-settings' 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-cog text-lg"></i>
            {!collapsed && <span className="ml-3">Facebook Settings</span>}
          </Link>
        </nav>
        
        {/* Collapse button at bottom */}
        <div className="absolute bottom-4 w-full flex justify-center">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600"
          >
            <i className={`fas fa-chevron-${collapsed ? 'right' : 'left'}`}></i>
          </button>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-6">
          <h1 className="text-xl font-medium">
            {location.pathname === '/' ? 'Chat Management' : 'Facebook Settings'}
          </h1>
          <div className="flex items-center">
            <div className="relative">
              <button className="p-2 relative">
                <i className="fas fa-bell text-gray-600"></i>
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-300 ml-4"></div>
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 