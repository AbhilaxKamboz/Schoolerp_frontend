import { useState, useEffect } from "react";
import AccountantSidebar from "./AccountantSidebar";
import AccountantDashboardHome from "./AccountantDashboardHome";
import AccountantCreateUser from "./AccountantCreateUser";
import AccountantProfile from "./AccountantProfile";
import FeeStructure from "./FeeStructure";
import AssignFee from "./AssignFee";
import ReceivePayment from "./ReceivePayment";
import StudentFees from "./StudentFees";
import PaymentHistory from "./PaymentHistory";
import DueFees from "./DueFees";
import FeeReports from "./FeeReports";
import AIChat from "../common/AIChat";
import {FaTimes} from "react-icons/fa";

export default function AccountantDashboard() {
  const [active, setActive] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Menu Button - Visible only on small screens */}
      {isMobile && (
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed top-4 left-4 z-50 bg-purple-600 text-white p-2 rounded-lg shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        {/* Sidebar - Fixed on desktop, slide-out on mobile */}
        <div className={`
          ${isMobile ? (mobileMenuOpen ? 'block' : 'hidden') : 'block'}
          fixed md:static inset-y-0 left-0 z-50
        `}>
          <AccountantSidebar
            active={active}
            setActive={setActive}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        </div>

        {/* Main content area */}
        <main className={`
          flex-1 overflow-auto transition-all duration-300
          ${!isMobile ? 'ml-64' : ''}
          ${isMobile ? 'pt-16 pb-20' : 'pt-0 pb-0'}
        `}>
          <div className="p-4 md:p-6">
            {active === "dashboard" && <AccountantDashboardHome setActive={setActive} />}
            {active === "create-user" && <AccountantCreateUser />}
            {active === "fee-structures" && <FeeStructure />}
            {active === "assign-fee" && <AssignFee />}
            {active === "receive-payment" && <ReceivePayment />}
            {active === "student-fees" && <StudentFees />}
            {active === "payment-history" && <PaymentHistory />}
            {active === "due-fees" && <DueFees />}
            {active === "reports" && <FeeReports />}
            {active === "profile" && <AccountantProfile />}
          </div>
        </main>
      </div>

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