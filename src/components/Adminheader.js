import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { HiMenu, HiX, HiBell, HiChevronDown } from "react-icons/hi";
import { Link } from "react-router-dom";

const Adminheader = ({ toggleSidebar, isSidebarOpen, isMobile }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedBranch = useSelector((state) => state.branch.selectedBranch);

  const getBranchLink = (baseLink) => {
    return selectedBranch ? `${baseLink}?branchId=${selectedBranch}` : baseLink;
  };

  const handleOutsideClick = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsProfileOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Auto-close mobile menu when sidebar is toggled
  useEffect(() => {
    if (isSidebarOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isSidebarOpen]);

  return (
    <header className="bg-[#F4F9FD] border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        {/* Left Section - Menu Button and Logo/Brand */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-white transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>

          {/* Brand Name - Visible on mobile */}
          <div className="lg:hidden">
            <h1 className="text-xl font-bold text-gray-800">Sinfode Admin</h1>
          </div>
        </div>

        {/* Right Section - Navigation Items */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell - Always visible */}
          <Link
            to={getBranchLink("/sinfodeadmin/communication")}
            className="p-3 rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-sm"
            title="Notifications"
          >
            <HiBell size={20} className="text-gray-600" />
          </Link>

          {/* Profile Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              {/* Profile Image */}
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200">
                <img
                  src="https://sipl.ind.in/wp-content/uploads/2022/07/dummy-user.png"
                  alt="Admin Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Admin Name - Hidden on mobile */}
              <span className="hidden sm:block text-gray-700 font-medium">Admin</span>
              
              <HiChevronDown 
                size={16} 
                className={`text-gray-500 transition-transform ${
                  isProfileOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-fadeIn">
                <Link 
                  to="/sinfodeadmin/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  👤 Profile Settings
                </Link>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/";
                  }}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          {/* <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-white transition-colors lg:hidden"
            aria-label="Quick actions"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button> */}
        </div>
      </div>

      {/* Mobile Quick Actions Menu */}
      {isMobileMenuOpen && isMobile && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="grid grid-cols-3 gap-2 p-4">
            <Link
              to={getBranchLink("/sinfodeadmin/dashboard")}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaTachometerAlt className="text-blue-600 mb-1" size={18} />
              <span className="text-xs text-gray-600">Dashboard</span>
            </Link>
            <Link
              to={getBranchLink("/sinfodeadmin/students")}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaUsers className="text-green-600 mb-1" size={18} />
              <span className="text-xs text-gray-600">Students</span>
            </Link>
            <Link
              to={getBranchLink("/sinfodeadmin/attendance")}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaUserFriends className="text-purple-600 mb-1" size={18} />
              <span className="text-xs text-gray-600">Attendance</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

// Add these icons for the mobile menu
const FaTachometerAlt = ({ size, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8z"/>
    <path d="M12 6a1 1 0 00-1 1v5a1 1 0 002 0V7a1 1 0 00-1-1z"/>
    <path d="M16.5 8.5a1 1 0 00-1.37.37l-2 3.5a1 1 0 00.37 1.37 1 1 0 001.36-.37l2-3.5A1 1 0 0016.5 8.5z"/>
  </svg>
);

const FaUsers = ({ size, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12a5 5 0 115-5 5 5 0 01-5 5zm0-8a3 3 0 103 3 3 3 0 00-3-3zm9 11a1 1 0 00-1-1h-2a3 3 0 00-3-3H9a3 3 0 00-3 3H4a1 1 0 00-1 1v2a3 3 0 003 3h12a3 3 0 003-3z"/>
  </svg>
);

const FaUserFriends = ({ size, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12a5 5 0 115-5 5 5 0 01-5 5zm0-8a3 3 0 103 3 3 3 0 00-3-3zm9 11a1 1 0 00-1-1h-2a3 3 0 00-3-3H9a3 3 0 00-3 3H4a1 1 0 00-1 1v2a3 3 0 003 3h12a3 3 0 003-3z"/>
  </svg>
);

export default Adminheader;
