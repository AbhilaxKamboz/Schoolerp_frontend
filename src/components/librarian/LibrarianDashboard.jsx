import { useState, useEffect } from "react";
import LibrarianSidebar from "./LibrarianSidebar";
import LibrarianDashboardHome from "./LibrarianDashboardHome";
import BooksManagement from "./BooksManagement";
import BookTransactions from "./BookTransactions";
import StudentLibraryHistory from "./StudentLibraryHistory";
import LibrarySettings from "./LibrarySettings";
import LibrarianProfile from "./LibrarianProfile";
import { FaBars, FaTimes } from "react-icons/fa";
import AIChat from "../common/AIChat";

export default function LibrarianDashboard() {
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Screen size check
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
            <h1 className="text-lg font-bold text-gray-800">Library Panel</h1>
          </div>
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full flex items-center justify-center text-white font-bold">
            L
          </div>
        </header>
      )}

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <LibrarianSidebar
          active={active}
          setActive={setActive}
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className={`
          flex-1 overflow-auto transition-all duration-300
          ${!isMobile ? 'ml-64' : ''}
          ${isMobile ? 'pt-16 pb-20' : 'pt-0 pb-0'}
        `}>
          <div className="p-4 md:p-6 lg:p-8">
            {active === "dashboard" && <LibrarianDashboardHome setActive={setActive} />}
            {active === "books" && <BooksManagement />}
            {active === "BookTransactions" && <BookTransactions />}
            {active === "StudentLibraryHistory" && <StudentLibraryHistory />}
            {active === "settings" && <LibrarySettings />}
            {active === "profile" && <LibrarianProfile />}
          </div>
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-30 px-2 py-1">
          <div className="flex justify-around items-center">
            {[
              { id: "dashboard", icon: "📊", label: "Home" },
              { id: "books", icon: "📚", label: "Books" },
              { id: "issue-book", icon: "📤", label: "Issue" },
              { id: "issued-books", icon: "📋", label: "Issued" },
              { id: "profile", icon: "👤", label: "Profile" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors
                  ${active === item.id ? 'text-purple-600' : 'text-gray-600'}
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* AI Floating Button */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className=" fixed bottom-24 md:bottom-6 right-4 md:right-6 w-14 h-14 md:w-16 md:h-16 rounded-full bg-green-600 text-white shadow-xl z-50 flex items-center justify-center text-2xl hover:scale-110 transition-all "
            >
              AI Chat
            </button>
      
            {chatOpen && (<div className=" fixed bottom-44 md:bottom-24 right-4 md:right-6 w-[92vw] sm:w-[380px] h-[65vh] sm:h-[500px] bg-white rounded-2xl shadow-2xl z-[100] flex flex-col overflow-hidden "
            >
              {/* Header */}
              <div className=" bg-green-600 text-white px-4 py-3 flex justify-between items-center "
              >
                <div className="font-semibold">
                  AI Assistant
                </div>
                <button
                  onClick={() => setChatOpen(false)} className=" hover:bg-green-700 px-2 py-1 rounded "
                >
                  <FaTimes />
                </button>
              </div>
      
              {/* Chat Body */}
              <div className="flex-1 overflow-hidden">
                <AIChat />
              </div>
      
            </div>
            
            )}

    </div>
  );
}