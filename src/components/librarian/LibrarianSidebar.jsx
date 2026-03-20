import { FaHome, FaBook, FaPlus, FaUndo, FaList, FaHistory, FaCog, FaUserCircle, FaSignOutAlt,
 FaChevronLeft, FaChevronRight, FaTimes
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function LibrarianSidebar({ active, setActive, isMobile, sidebarOpen, onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Screen size ke hisaab se sidebar collapse/expand hota hai
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

  // Menu items - Har item ka ek unique ID, label, icon aur color hai
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <FaHome />, color: "purple" },
    { id: "books", label: "Books Management", icon: <FaBook />, color: "blue" },
    { id: "BookTransactions", label: "Book-Transactions", icon: <FaPlus />, color: "green" },
    { id: "StudentLibraryHistory", label: "Student-Library-History", icon: <FaHistory />, color: "indigo" },
    { id: "settings", label: "Library Settings", icon: <FaCog />, color: "orange" },
    { id: "profile", label: "My Profile", icon: <FaUserCircle />, color: "gray" },
  ];

  const handleMenuItemClick = (id) => {
    setActive(id);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "You want to logout?",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel"
    });
    
    if (result.isConfirmed) {
      logout();
      navigate("/");
    }
  };

  // Colors for different menu items (active/hover states)
  const getColorClasses = (color, isActive) => {
    const colors = {
      purple: {
        active: "bg-purple-50 text-purple-600",
        hover: "hover:bg-purple-50 hover:text-purple-600",
        icon: "text-purple-500"
      },
      blue: {
        active: "bg-blue-50 text-blue-600",
        hover: "hover:bg-blue-50 hover:text-blue-600",
        icon: "text-blue-500"
      },
      green: {
        active: "bg-green-50 text-green-600",
        hover: "hover:bg-green-50 hover:text-green-600",
        icon: "text-green-500"
      },
      orange: {
        active: "bg-orange-50 text-orange-600",
        hover: "hover:bg-orange-50 hover:text-orange-600",
        icon: "text-orange-500"
      },
      gray: {
        active: "bg-gray-50 text-gray-600",
        hover: "hover:bg-gray-50 hover:text-gray-600",
        icon: "text-gray-500"
      }
    };
    return colors[color] || colors.purple;
  };

  // Sidebar width - Collapsed or expanded
  const sidebarWidth = isCollapsed && !isHovered ? 'w-20' : 'w-64';
  const showLabels = !(isCollapsed && !isHovered);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          ${sidebarWidth} 
          fixed inset-y-0 left-0 h-full bg-white shadow-xl transition-all duration-300 ease-in-out
          flex flex-col overflow-hidden z-50
          ${isMobile
            ? `transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} rounded-r-2xl`
            : ""
          }
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Sidebar Header - Gradient background */}
        <div className={`
          p-4 border-b flex items-center justify-between
          ${isCollapsed && !isHovered ? 'flex-col' : ''}
          bg-gradient-to-r from-purple-600 to-purple-800
        `}>
          {showLabels ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-lg">📚</span>
                </div>
                <h2 className="text-lg font-bold text-white">Library Panel</h2>
              </div>
              {/* Collapse Toggle - Sirf desktop par */}
              {!isMobile && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-1 hover:bg-white/20 rounded transition-colors text-white"
                >
                  {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">📚</span>
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

        {/* Librarian Info Card - Librarian ka naam aur role */}
        <div className={`
          p-4 border-b bg-gray-50
          ${isCollapsed && !isHovered ? 'text-center' : ''}
        `}>
          <div className={`flex ${isCollapsed && !isHovered ? 'flex-col' : 'items-center'} gap-3`}>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full flex items-center justify-center text-white font-bold text-lg">
              L
            </div>
            {showLabels && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">Librarian</p>
                <p className="text-xs text-gray-500 truncate">library@school.com</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation Menu - Saare options yahan hain */}
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
                  {/* Icon */}
                  <span className={`text-xl ${active === item.id ? colors.icon : 'text-gray-500'}`}>
                    {item.icon}
                  </span>

                  {/* Label - Collapsed mode mein hidden */}
                  <span className={`
                    transition-all duration-300 whitespace-nowrap
                    ${showLabels ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}
                  `}>
                    {item.label}
                  </span>

                  {/* Active Indicator - Left side blue line */}
                  {active === item.id && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-purple-600 rounded-r-full" />
                  )}

                  {/* Tooltip - Collapsed mode mein dikhta hai */}
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

        {/* Logout Button - Sidebar ke bottom mein */}
        <div className="p-3 border-t">
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

            {/* Tooltip for collapsed mode */}
            {!showLabels && showTooltip === 'logout' && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap z-50 shadow-lg">
                Logout
                <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 border-8 border-transparent border-r-gray-800" />
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}