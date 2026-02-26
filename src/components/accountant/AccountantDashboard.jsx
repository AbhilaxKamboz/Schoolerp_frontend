import { useState } from "react";
import AccountantSidebar from "./AccountantSidebar";
import AccountantDashboardHome from "./AccountantDashboardHome";
import AccountantProfile from "./AccountantProfile";
import FeeStructure from "./FeeStructure";
import AssignFee from "./AssignFee";
import ReceivePayment from "./ReceivePayment";
import StudentFees from "./StudentFees";
import PaymentHistory from "./PaymentHistory";
import DueFees from "./DueFees";
import FeeReports from "./FeeReports";

export default function AccountantDashboard() {
  const [active, setActive] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Mobile Menu Button - Visible only on small screens */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-purple-600 text-white p-2 rounded-lg shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar - Hidden on mobile by default, shown when menu is open */}
      <div className={`
        ${mobileMenuOpen ? 'block' : 'hidden'} 
        md:block fixed md:static inset-0 z-40 md:z-auto
      `}>
        <AccountantSidebar 
          active={active} 
          setActive={setActive} 
          setMobileMenuOpen={setMobileMenuOpen}
        />
      </div>

      {/* Main content area - Adjusts padding for mobile */}
      <main className="flex-1 p-4 md:p-6 overflow-auto mt-16 md:mt-0">
        {active === "dashboard" && <AccountantDashboardHome setActive={setActive} />}
        {active === "profile" && <AccountantProfile />}
        {active === "fee-structures" && <FeeStructure />}
        {active === "assign-fee" && <AssignFee />}
        {active === "receive-payment" && <ReceivePayment />}
        {active === "student-fees" && <StudentFees />}
        {active === "payment-history" && <PaymentHistory />}
        {active === "due-fees" && <DueFees />}
        {active === "reports" && <FeeReports />}
      </main>
    </div>
  );
}