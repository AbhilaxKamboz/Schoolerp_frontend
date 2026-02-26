import { 
  FaHome, 
  FaUserCircle, 
  FaMoneyBillWave, 
  FaHandHoldingUsd,
  FaCreditCard,
  FaUsers,
  FaHistory,
  FaExclamationTriangle,
  FaFileInvoiceDollar,
  FaTimes
} from "react-icons/fa";

export default function AccountantSidebar({ active, setActive, setMobileMenuOpen }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <FaHome /> },
    { id: "profile", label: "My Profile", icon: <FaUserCircle /> },
    { id: "fee-structures", label: "Fee Structures", icon: <FaMoneyBillWave /> },
    { id: "assign-fee", label: "Assign Fee", icon: <FaHandHoldingUsd /> },
    { id: "receive-payment", label: "Receive Payment", icon: <FaCreditCard /> },
    { id: "student-fees", label: "Student Fees", icon: <FaUsers /> },
    { id: "payment-history", label: "Payment History", icon: <FaHistory /> },
    { id: "due-fees", label: "Due Fees", icon: <FaExclamationTriangle /> },
    { id: "reports", label: "Reports", icon: <FaFileInvoiceDollar /> },
  ];

  const handleItemClick = (id) => {
    setActive(id);
    if (setMobileMenuOpen) {
      setMobileMenuOpen(false); // Close mobile menu after selection
    }
  };

  return (
    <aside className="w-64 bg-white shadow-lg h-full md:h-screen overflow-y-auto fixed md:static">
      {/* Header with close button on mobile */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Accountant Panel</h2>
        <button 
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={20} />
        </button>
      </div>
      
      <nav className="p-2 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm md:text-base
              ${active === item.id 
                ? "bg-purple-50 text-purple-600 font-medium" 
                : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            <span className="text-lg md:text-xl">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer with user info - optional */}
      <div className="absolute bottom-0 w-full p-4 border-t hidden md:block">
        <p className="text-xs text-gray-500 text-center">School ERP v1.0</p>
      </div>
    </aside>
  );
}