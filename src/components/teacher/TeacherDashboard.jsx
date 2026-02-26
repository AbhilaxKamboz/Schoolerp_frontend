import { useState, useEffect } from "react";
import TeacherSidebar from "./TeacherSidebar";
import TeacherAttendance from "./TeacherAttendance";
import TeacherMarks from "./TeacherMarks";
import TeacherAssignments from "./TeacherAssignments";
import TeacherStudents from "./TeacherStudents";
import TeacherDashboardHome from "./TeacherDashboardHome";
import TeacherProfile from "./TeacherProfile";
import { FaBars, FaTimes, FaHome, FaCalendarCheck, FaBook, FaTasks, FaUsers, FaChevronLeft, FaChevronRight
} from "react-icons/fa";

export default function TeacherDashboard() {
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [active, isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Menu items for bottom navigation (mobile)
  const bottomNavItems = [
    { id: "dashboard", icon: <FaHome />, label: "Home" },
    { id: "attendance", icon: <FaCalendarCheck />, label: "Attendance" },
    { id: "assignments", icon: <FaTasks />, label: "Assign" },
    { id: "marks", icon: <FaBook />, label: "marks" },
    { id: "students", icon: <FaUsers />, label: "Students" },
  ];

  const handleBottomNavClick = (id) => {
    setActive(id);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
            <h1 className="text-lg font-bold text-gray-800">Teacher Dashboard</h1>
          </div>
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
            T
          </div>
        </header>
      )}

      {/* Tablet Header - Minimal */}
      {isTablet && !sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed left-0 top-1/2 transform -translate-y-1/2 bg-green-600 text-white p-2 rounded-r-lg shadow-lg z-40"
        >
          <FaChevronRight />
        </button>
      )}

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <TeacherSidebar
          active={active}
          setActive={setActive}
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main
          className={`
            flex-1 w-full transition-all duration-300
            ${isMobile ? 'pt-16 pb-20' : 'pt-0 pb-0'}
            ${isTablet && !sidebarOpen ? 'ml-0' : ''}
          `}
        >
          {/* Content Area with proper padding */}
          <div className="p-4 md:p-6 lg:p-8 w-full">
            <div className="max-w-7xl mx-auto w-full">
              {active === "dashboard" && <TeacherDashboardHome setActive={setActive} />}
              {active === "attendance" && <TeacherAttendance />}
              {active === "assignments" && <TeacherAssignments />}
              {active === "marks" && <TeacherMarks />}
              {active === "students" && <TeacherStudents />}
              {active === "profile" && <TeacherProfile />}
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-30 px-2 py-1">
          <div className="flex justify-around items-center">
            {bottomNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleBottomNavClick(item.id)}
                className={`
                  flex flex-col items-center p-2 rounded-lg transition-colors relative
                  ${active === item.id 
                    ? 'text-green-600' 
                    : 'text-gray-600 hover:text-green-600'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs mt-1">{item.label}</span>
                {active === item.id && (
                  <span className="absolute -top-1 w-12 h-0.5 bg-green-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}