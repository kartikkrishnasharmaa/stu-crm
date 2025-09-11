import React, { useState } from 'react';
import SAHeader from '../components/Adminheader';
import SASidebar from '../components/Adminsidebar';

const SinfodeAdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex bg-[#F4F9FD] flex-col h-screen">
      {/* Header */}
      <SAHeader toggleSidebar={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SASidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main Content */}
        <main className="flex-1 bg-[#F4F9FD] overflow-auto p-4">
          {children}
        </main>
      </div>

      {/* Overlay for Sidebar on Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default SinfodeAdminLayout;
