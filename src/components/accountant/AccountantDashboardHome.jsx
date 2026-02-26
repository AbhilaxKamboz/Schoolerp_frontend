import { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  FaMoneyBillWave, FaUsers, FaCheckCircle, 
  FaExclamationTriangle, FaCalendarAlt, FaChartLine,
  FaDownload, FaHistory, FaCreditCard, FaHandHoldingUsd
} from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export default function AccountantDashboardHome({ setActive }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month"); // week, month, year
  
  const navigate = useNavigate();
  const { logout } = useAuth();

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  useEffect(() => {
    fetchDashboardData();
    // Add resize listener for responsive charts
    const handleResize = () => {
      // Force re-render on resize
      setData(prev => ({ ...prev }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      const res = await API.get(`/accountant/dashboard?range=${dateRange}`);
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const downloadReport = async () => {
    try {
      const res = await API.get("/accountant/fee-report", {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fee-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download report:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, color, bgColor, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-4 md:p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-gray-500 text-xs md:text-sm truncate">{title}</p>
          <p className="text-lg md:text-2xl font-bold mt-1 truncate">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1 hidden md:block">{subtitle}</p>}
        </div>
        <div className={`p-2 md:p-3 rounded-full flex-shrink-0 ${bgColor} ml-2`}>
          <Icon className={`text-white text-lg md:text-xl`} />
        </div>
      </div>
    </div>
  );

  const pieData = [
    { name: 'Paid', value: data?.overview?.paidStudents || 0 },
    { name: 'Partial', value: data?.overview?.partialStudents || 0 },
    { name: 'Unpaid', value: data?.overview?.unpaidStudents || 0 },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with Logout - Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Accountant Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600">Manage all fee-related activities</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={downloadReport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-3 md:px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            <FaDownload className="text-sm" /> 
            <span className="hidden sm:inline">Download Report</span>
            <span className="sm:hidden">Report</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white px-3 md:px-4 py-2 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Date Range Selector - Responsive */}
      <div className="bg-white p-3 md:p-4 rounded-lg shadow overflow-x-auto">
        <div className="flex flex-nowrap md:flex-wrap gap-2 min-w-max md:min-w-0">
          {['week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-sm capitalize whitespace-nowrap
                ${dateRange === range 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard 
          icon={FaMoneyBillWave}
          title="Total Collected"
          value={`₹${(data?.amounts?.totalCollected || 0).toLocaleString()}`}
          subtitle="Overall collections"
          bgColor="bg-green-500"
        />
        
        <StatCard 
          icon={FaExclamationTriangle}
          title="Total Due"
          value={`₹${(data?.amounts?.totalDue || 0).toLocaleString()}`}
          subtitle="Pending amount"
          bgColor="bg-red-500"
        />
        
        <StatCard 
          icon={FaCalendarAlt}
          title="This Month"
          value={`₹${(data?.amounts?.monthlyCollection || 0).toLocaleString()}`}
          subtitle="Monthly collection"
          bgColor="bg-blue-500"
        />
        
        <StatCard 
          icon={FaChartLine}
          title="Collection Rate"
          value={`${data?.overview?.collectionRate || 0}%`}
          subtitle="Overall rate"
          bgColor="bg-purple-500"
        />
      </div>

      {/* Student Status Cards - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div className="min-w-0 flex-1">
              <p className="text-gray-500 text-xs md:text-sm truncate">Paid Students</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">
                {data?.overview?.paidStudents || 0}
              </p>
            </div>
            <FaCheckCircle className="text-green-500 text-xl md:text-3xl flex-shrink-0 ml-2" />
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex justify-between items-center">
            <div className="min-w-0 flex-1">
              <p className="text-gray-500 text-xs md:text-sm truncate">Partial Paid</p>
              <p className="text-xl md:text-2xl font-bold text-yellow-600">
                {data?.overview?.partialStudents || 0}
              </p>
            </div>
            <FaHistory className="text-yellow-500 text-xl md:text-3xl flex-shrink-0 ml-2" />
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow border-l-4 border-red-500 sm:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-center">
            <div className="min-w-0 flex-1">
              <p className="text-gray-500 text-xs md:text-sm truncate">Unpaid Students</p>
              <p className="text-xl md:text-2xl font-bold text-red-600">
                {data?.overview?.unpaidStudents || 0}
              </p>
            </div>
            <FaExclamationTriangle className="text-red-500 text-xl md:text-3xl flex-shrink-0 ml-2" />
          </div>
        </div>
      </div>

      {/* Charts Section - Stack on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          <h3 className="text-base md:text-lg font-semibold mb-4">Student Fee Status</h3>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => 
                    window.innerWidth < 768 ? '' : `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={window.innerWidth < 768 ? 60 : 80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Mobile Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-4 md:hidden">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-xs">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          <h3 className="text-base md:text-lg font-semibold mb-4">Class-wise Collection</h3>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.classWise || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="_id.className" 
                  tick={{ fontSize: window.innerWidth < 768 ? 10 : 12 }}
                  interval={window.innerWidth < 768 ? 1 : 0}
                />
                <YAxis tick={{ fontSize: window.innerWidth < 768 ? 10 : 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: window.innerWidth < 768 ? 10 : 12 }} />
                <Bar dataKey="collected" name="Collected" fill="#10b981" />
                <Bar dataKey="due" name="Due" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Payments - Horizontal scroll on mobile */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h3 className="text-base md:text-lg font-semibold">Recent Payments</h3>
          <button
            onClick={() => setActive("payment-history")}
            className="text-purple-600 hover:text-purple-800 text-sm"
          >
            View All →
          </button>
        </div>
        
        {/* Mobile: Horizontal scroll, Desktop: Normal table */}
        <div className="overflow-x-auto">
          {data?.recentPayments?.length > 0 ? (
            <table className="w-full min-w-[500px] md:min-w-0">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 md:p-3 text-left text-xs md:text-sm">Student</th>
                  <th className="p-2 md:p-3 text-left text-xs md:text-sm">Amount</th>
                  <th className="p-2 md:p-3 text-left text-xs md:text-sm hidden sm:table-cell">Mode</th>
                  <th className="p-2 md:p-3 text-left text-xs md:text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPayments.slice(0, 5).map((payment, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="p-2 md:p-3 text-xs md:text-sm">
                      {payment.studentFeeId?.studentId?.name || 'N/A'}
                    </td>
                    <td className="p-2 md:p-3 text-xs md:text-sm font-medium text-green-600">
                      ₹{payment.amountPaid}
                    </td>
                    <td className="p-2 md:p-3 text-xs md:text-sm hidden sm:table-cell capitalize">
                      {payment.paymentMode}
                    </td>
                    <td className="p-2 md:p-3 text-xs md:text-sm">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-4 md:p-8 text-center text-gray-500 text-sm">
              No recent payments found
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions - Responsive Grid */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <button
            onClick={() => setActive("receive-payment")}
            className="p-3 md:p-4 border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
          >
            <FaCreditCard className="text-purple-500 text-xl md:text-2xl mx-auto mb-1 md:mb-2" />
            <span className="text-xs md:text-sm block">Receive Payment</span>
          </button>
          
          <button
            onClick={() => setActive("assign-fee")}
            className="p-3 md:p-4 border rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
          >
            <FaHandHoldingUsd className="text-green-500 text-xl md:text-2xl mx-auto mb-1 md:mb-2" />
            <span className="text-xs md:text-sm block">Assign Fee</span>
          </button>
          
          <button
            onClick={() => setActive("fee-structures")}
            className="p-3 md:p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <FaMoneyBillWave className="text-blue-500 text-xl md:text-2xl mx-auto mb-1 md:mb-2" />
            <span className="text-xs md:text-sm block">Fee Structures</span>
          </button>
          
          <button
            onClick={() => setActive("due-fees")}
            className="p-3 md:p-4 border rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors"
          >
            <FaExclamationTriangle className="text-orange-500 text-xl md:text-2xl mx-auto mb-1 md:mb-2" />
            <span className="text-xs md:text-sm block">Due Fees</span>
          </button>
        </div>
      </div>
    </div>
  );
}