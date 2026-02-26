import { 
  FaUsers, FaChalkboard, FaBook, FaHome, FaUserShield, FaCog,
  FaBars, FaTimes, FaSignOutAlt, FaBell, FaSearch, FaChevronDown
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

export default function AdminSidebar({ active, setActive }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { logout } = useAuth();

  // Close mobile menu on window resize (if screen becomes large)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Menu items configuration
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <FaHome /> },
    { id: "users", label: "Users", icon: <FaUsers /> },
    { id: "classes", label: "Classes", icon: <FaChalkboard /> },
    { id: "subjects", label: "Subjects", icon: <FaBook /> },
    { id: "classes_subjects", label: "Class-Subject", icon: <FaCog />, shortLabel: "Mapping" },
    { id: "profile", label: "My Profile", icon: <FaUserShield /> },
  ];

  const handleMenuItemClick = (id) => {
    setActive(id);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
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

  // Determine sidebar width based on state
  const sidebarWidth = isCollapsed && !isHovered ? 'w-20' : 'w-64';
  const showLabels = !(isCollapsed && !isHovered);

  return (
    <>
      {/* Mobile Header - Visible only on small screens */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-30 px-4 py-3 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop (always visible) + Mobile (conditional) */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          transform transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarWidth} bg-white shadow-xl lg:shadow-md
          flex flex-col h-full
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Sidebar Header */}
        <div className={`p-4 border-b flex items-center justify-between ${isCollapsed && !isHovered ? 'flex-col' : ''}`}>
          {showLabels ? (
            <>
              <h2 className="text-xl font-bold text-gray-800 truncate">Admin Panel</h2>
              {/* Collapse Toggle - Desktop only */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:block p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Toggle sidebar"
              >
                <FaChevronDown className={`transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
              </button>
            </>
          ) : (
            <h2 className="text-2xl font-bold text-gray-800 mx-auto">A</h2>
          )}
        </div>

        {/* Search Bar - Optional */}
        {showLabels && (
          <div className="p-4 hidden lg:block">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuItemClick(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${active === item.id 
                  ? 'bg-blue-50 text-blue-600 shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
                ${!showLabels && 'justify-center'}
                relative group
              `}
              title={!showLabels ? item.label : ''}
            >
              <span className={`text-xl ${active === item.id ? 'text-blue-600' : 'text-gray-500'}`}>
                {item.icon}
              </span>
              
              {/* Label with animation */}
              <span className={`
                transition-all duration-300 whitespace-nowrap
                ${showLabels ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}
              `}>
                {item.shortLabel || item.label}
              </span>

              {/* Tooltip for collapsed mode */}
              {!showLabels && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}

              {/* Active Indicator */}
              {active === item.id && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className={`p-4 border-t ${!showLabels ? 'text-center' : ''}`}>
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg
              text-red-600 hover:bg-red-50 transition-colors
              ${!showLabels && 'justify-center'}
              group
            `}
            title={!showLabels ? 'Logout' : ''}
          >
            <FaSignOutAlt className="text-xl" />
            {showLabels && <span>Logout</span>}
            
            {/* Tooltip for collapsed mode */}
            {!showLabels && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                Logout
              </div>
            )}
          </button>
        </div>

        {/* User Info - Optional */}
        {showLabels && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@school.com</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation - For very small screens */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-30 px-2 py-2 flex justify-around">
        {menuItems.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuItemClick(item.id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors
              ${active === item.id ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}
            `}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs mt-1">{item.shortLabel || item.label}</span>
          </button>
        ))}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600"
        >
          <FaBars className="text-xl" />
          <span className="text-xs mt-1">More</span>
        </button>
      </div>
    </>
  );
}