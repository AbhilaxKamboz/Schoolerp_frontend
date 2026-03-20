import { FaHome, FaUserCircle, FaMoneyBillWave, FaHandHoldingUsd, FaCreditCard, FaUsers, FaHistory, FaExclamationTriangle, FaFileInvoiceDollar, FaTimes, FaUserPlus, FaChevronLeft, FaChevronRight, FaSignOutAlt } from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function AccountantSidebar({ active, setActive, setMobileMenuOpen }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <FaHome /> },
    { id: "create-user", label: "Create User", icon: <FaUserPlus /> },
    { id: "fee-structures", label: "Fee Structures", icon: <FaMoneyBillWave /> },
    { id: "assign-fee", label: "Assign Fee", icon: <FaHandHoldingUsd /> },
    { id: "receive-payment", label: "Receive Payment", icon: <FaCreditCard /> },
    { id: "student-fees", label: "Student Fees", icon: <FaUsers /> },
    { id: "payment-history", label: "Payment History", icon: <FaHistory /> },
    { id: "due-fees", label: "Due Fees", icon: <FaExclamationTriangle /> },
    { id: "reports", label: "Reports", icon: <FaFileInvoiceDollar /> },
    { id: "profile", label: "My Profile", icon: <FaUserCircle /> },
  ];

  const handleItemClick = (id) => {
    setActive(id);
    if (setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Are You sure want to Logout",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel"
    });
    
    if (result.isConfirmed) {
      logout();
      navigate("/");
    }
  };

  const sidebarWidth = isCollapsed && !isHovered ? 'w-20' : 'w-64';
  const showLabels = !(isCollapsed && !isHovered);

  return (
    <aside 
      className={`
        ${sidebarWidth} 
        fixed inset-y-0 left-0 h-full bg-white shadow-xl transition-all duration-300 ease-in-out
        flex flex-col overflow-hidden z-50
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with close button on mobile */}
      <div className={`
        p-4 border-b flex items-center justify-between
        ${isCollapsed && !isHovered ? 'flex-col' : ''}
        bg-gradient-to-r from-purple-600 to-purple-800
      `}>
        {showLabels ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">A</span>
              </div>
              <h2 className="text-lg font-bold text-white truncate">Accountant Panel</h2>
            </div>
            {/* Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-1 hover:bg-white/20 rounded transition-colors text-white"
              aria-label="Toggle sidebar"
            >
              {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          </>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-bold text-lg">A</span>
            </div>
          </div>
        )}
        
        {/* Mobile Close Button */}
        <button 
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden text-white hover:text-gray-200"
        >
          <FaTimes size={20} />
        </button>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${active === item.id 
                ? "bg-purple-50 text-purple-600 font-medium shadow-sm" 
                : "text-gray-700 hover:bg-gray-100"
              }
              ${!showLabels && 'justify-center'}
              relative group
            `}
            onMouseEnter={() => setShowTooltip(item.id)}
            onMouseLeave={() => setShowTooltip(null)}
            title={!showLabels ? item.label : ''}
          >
            <span className={`text-xl ${active === item.id ? 'text-purple-600' : 'text-gray-500'}`}>
              {item.icon}
            </span>
            
            {/* Label with animation */}
            <span className={`
              transition-all duration-300 whitespace-nowrap
              ${showLabels ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}
            `}>
              {item.label}
            </span>

            {/* Tooltip for collapsed mode */}
            {!showLabels && showTooltip === item.id && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-100 whitespace-nowrap z-50">
                {item.label}
                <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-gray-800" />
              </div>
            )}

            {/* Active Indicator */}
            {active === item.id && showLabels && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-purple-600 rounded-r-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-lg
            transition-all duration-200 text-red-600 hover:bg-red-50
            ${!showLabels && 'justify-center'}
            group
            relative
          `}
          onMouseEnter={() => setShowTooltip('logout')}
          onMouseLeave={() => setShowTooltip(null)}
        >
          <FaSignOutAlt className="text-xl" />
          <span className={`
            transition-all duration-300 whitespace-nowrap
            ${showLabels ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}
          `}>
            Logout
          </span>

          {/* Tooltip for collapsed mode */}
          {!showLabels && showTooltip === 'logout' && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap z-50">
              Logout
              <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-gray-800" />
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}