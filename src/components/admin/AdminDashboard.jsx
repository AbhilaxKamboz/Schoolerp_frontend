import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import DashboardHome from "./DashboardHome";
import AdminUsers from "./AdminUsers";
import AdminClasses from "./AdminClasses";
import AdminSubjects from "./AdminSubjects";
import AdminClassSubject from "./AdminClassSubject";
import AdminProfile from "./AdminProfile";

export default function AdminDashboard() {
  const [active, setActive] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);

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

      {/* Add top and bottom padding for mobile */}
      <main className={`flex-1 overflow-auto ${isMobile ? 'pt-16 pb-20' : ''}`}>
        <div className="p-6">
          {active === "dashboard" && <DashboardHome setActive={setActive} />}
          {active === "users" && <AdminUsers />}
          {active === "classes" && <AdminClasses />}
          {active === "subjects" && <AdminSubjects />}
          {active === "classes_subjects" && <AdminClassSubject />}
          {active === "profile" && <AdminProfile />}
        </div>
      </main>
    </div>
  );
}