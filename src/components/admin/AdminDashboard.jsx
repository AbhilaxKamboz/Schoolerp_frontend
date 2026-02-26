import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import DashboardHome from "./DashboardHome";
import AdminUsers from "./AdminUsers";
import AdminClasses from "./AdminClasses";
import AdminSubjects from "./AdminSubjects";
import AdminClassSubject from "./AdminClassSubject";
import AdminProfile from "./AdminProfile";

export default function AdminDashboard() {
  const [active, setActive] = useState("dashboard");

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar active={active} setActive={setActive} />

      <main className="flex-1 p-6">
        {active === "dashboard" && <DashboardHome setActive={setActive} />}
        {active === "users" && <AdminUsers />}
        {active === "classes" && <AdminClasses />}
        {active === "subjects" && <AdminSubjects />}
        {active === "classes_subjects" && <AdminClassSubject />}
        {active === "profile" && <AdminProfile />}
      </main>
    </div>
  );
}

