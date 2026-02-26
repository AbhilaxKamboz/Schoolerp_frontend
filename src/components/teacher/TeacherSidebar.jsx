import { FaHome, FaCalendarCheck, FaBook, FaTasks, FaUsers, FaUserCircle, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaTimes,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function TeacherSidebar({ active, setActive, isMobile, sidebarOpen, onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Check if sidebar should be collapsed based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && window.innerWidth < 1280) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1280) {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <FaHome />, color: "blue" },
    { id: "attendance", label: "Attendance", icon: <FaCalendarCheck />, color: "green" },
    { id: "assignments", label: "Assignments/Homework", icon: <FaTasks />, color: "orange" },
    { id: "marks", label: "Marks", icon: <FaBook />, color: "purple" },
    { id: "students", label: "My Students", icon: <FaUsers />, color: "pink" },
    { id: "profile", label: "Profile", icon: <FaUserCircle />, color: "indigo" },
  ];

  const handleMenuItemClick = (id) => {
    setActive(id);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleLogout = async () => {
      Swal.fire({
        icon: "warning",
        title: "Are You sure want to Logout",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "Cancel"
      }).then((result) => {
        if (result.isConfirmed) {
          logout();
          navigate("/");
        }
      })
    };

  const getColorClasses = (color, isActive) => {
    const colors = {
      blue: {
        active: "bg-blue-50 text-blue-600 border-blue-600",
        hover: "hover:bg-blue-50 hover:text-blue-600",
        icon: "text-blue-500"
      },
      green: {
        active: "bg-green-50 text-green-600 border-green-600",
        hover: "hover:bg-green-50 hover:text-green-600",
        icon: "text-green-500"
      },
      purple: {
        active: "bg-purple-50 text-purple-600 border-purple-600",
        hover: "hover:bg-purple-50 hover:text-purple-600",
        icon: "text-purple-500"
      },
      orange: {
        active: "bg-orange-50 text-orange-600 border-orange-600",
        hover: "hover:bg-orange-50 hover:text-orange-600",
        icon: "text-orange-500"
      },
      pink: {
        active: "bg-pink-50 text-pink-600 border-pink-600",
        hover: "hover:bg-pink-50 hover:text-pink-600",
        icon: "text-pink-500"
      },
      indigo: {
        active: "bg-indigo-50 text-indigo-600 border-indigo-600",
        hover: "hover:bg-indigo-50 hover:text-indigo-600",
        icon: "text-indigo-500"
      },
      yellow: {
        active: "bg-yellow-50 text-yellow-600 border-yellow-600",
        hover: "hover:bg-yellow-50 hover:text-yellow-600",
        icon: "text-yellow-500"
      },
      gray: {
        active: "bg-gray-50 text-gray-600 border-gray-600",
        hover: "hover:bg-gray-50 hover:text-gray-600",
        icon: "text-gray-500"
      },
      teal: {
        active: "bg-teal-50 text-teal-600 border-teal-600",
        hover: "hover:bg-teal-50 hover:text-teal-600",
        icon: "text-teal-500"
      }
    };
    return colors[color] || colors.blue;
  };

  const sidebarWidth = isCollapsed && !isHovered ? 'w-20' : 'w-64';
  const showLabels = !(isCollapsed && !isHovered);

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          ${sidebarWidth} 
          h-full bg-white shadow-xl transition-all duration-300 ease-in-out
          flex flex-col overflow-hidden
          ${isMobile
            ? `fixed top-0 left-0 h-full z-50 transform transition-transform duration-300
               ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} rounded-r-2xl`
            : "static"}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Sidebar Header */}
        <div className={`
          p-4 border-b flex items-center justify-between
          ${isCollapsed && !isHovered ? 'flex-col' : ''}
          bg-gradient-to-r from-green-600 to-green-800
        `}>
          {showLabels ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">T</span>
                </div>
                <h2 className="text-lg font-bold text-white">Teacher Panel</h2>
              </div>
              {/* Collapse Toggle - Desktop only */}
              {!isMobile && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-1 hover:bg-white/20 rounded transition-colors text-white"
                  aria-label="Toggle sidebar"
                >
                  {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">T</span>
              </div>
            </div>
          )}

          {/* Mobile Close Button */}
          {isMobile && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-white/20 rounded transition-colors text-white"
            >
              <FaTimes size={20} />
            </button>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
            const colors = getColorClasses(item.color, active === item.id);
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => handleMenuItemClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200
                    ${active === item.id 
                      ? colors.active + ' shadow-md' 
                      : `text-gray-700 ${colors.hover}`
                    }
                    ${!showLabels && 'justify-center'}
                    group
                  `}
                  onMouseEnter={() => setShowTooltip(item.id)}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <span className={`text-xl ${active === item.id ? colors.icon : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                  
                  {/* Label with animation */}
                  <span className={`
                    transition-all duration-300 whitespace-nowrap
                    ${showLabels ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}
                  `}>
                    {item.label}
                  </span>

                  {/* Active Indicator */}
                  {active === item.id && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-600 rounded-r-full" />
                  )}

                  {/* Tooltip for collapsed mode */}
                  {!showLabels && showTooltip === item.id && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap z-50 shadow-lg">
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 border-8 border-transparent border-r-gray-800" />
                    </div>
                  )}
                </button>

              </div>
            );
          })}
        </nav>

        {/* Bottom Navigation Section */}
        <div className="p-3 border-t space-y-1">
          {/* Logout Button */}
          <div className="relative pt-2 mt-2 border-t">
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200 text-red-600 hover:bg-red-50
                ${!showLabels && 'justify-center'}
                group
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

              {!showLabels && showTooltip === 'logout' && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap z-50 shadow-lg">
                  Logout
                  <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 border-8 border-transparent border-r-gray-800" />
                </div>
              )}
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}