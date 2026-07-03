import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import DashboardHome from "./DashboardHome";
import AdminUsers from "./AdminUsers";
import AdminClasses from "./AdminClasses";
import AdminSubjects from "./AdminSubjects";
import AdminClassSubject from "./AdminClassSubject";
import AdminProfile from "./AdminProfile";
import AIChat from "../common/AIChat";

export default function AdminDashboard() {
  const [active, setActive] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar active={active} setActive={setActive} />

      {/* Desktop: left margin for fixed sidebar, Mobile: top/bottom padding */}
      <main className={`
        flex-1 overflow-auto transition-all duration-300
        ${!isMobile ? 'ml-64' : ''}
        ${isMobile ? 'pt-16 pb-20' : ''}
      `}>
        <div className="p-6">
          {active === "dashboard" && <DashboardHome setActive={setActive} />}
          {active === "users" && <AdminUsers />}
          {active === "classes" && <AdminClasses />}
          {active === "subjects" && <AdminSubjects />}
          {active === "classes_subjects" && <AdminClassSubject />}
          {active === "profile" && <AdminProfile />}
        </div>
      </main>

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