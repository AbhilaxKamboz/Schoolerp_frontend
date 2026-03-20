import { useEffect, useState } from "react";
import API from "../../api/api";
import { FaBook, FaBookOpen, FaHistory, FaExclamationTriangle, FaUsers, FaChartPie, FaSync, FaCalendarCheck, FaPlus, FaUndo, FaList
} from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export default function LibrarianDashboardHome({ setActive }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  // Dashboard data fetch karte hain
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await API.get("/librarian/dashboard");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Stat Card Component - Reusable card for statistics
  const StatCard = ({ icon: Icon, title, value, bgColor }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-4 rounded-xl ${bgColor} bg-opacity-10`}>
          <Icon className={`text-3xl ${bgColor.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Library Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Manage your library efficiently.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={refreshing}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          <FaSync className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={FaBook} 
          title="Total Books" 
          value={stats?.stats?.totalBooks || 0} 
          bgColor="bg-purple-500"
        />
        <StatCard 
          icon={FaBookOpen} 
          title="Available Books" 
          value={stats?.stats?.availableBooks || 0} 
          bgColor="bg-green-500"
        />
        <StatCard 
          icon={FaUsers} 
          title="Issued Books" 
          value={stats?.stats?.issuedBooks || 0} 
          bgColor="bg-blue-500"
        />
        <StatCard 
          icon={FaExclamationTriangle} 
          title="Overdue Books" 
          value={stats?.stats?.overdueBooks || 0} 
          bgColor="bg-red-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Books by Category Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaChartPie className="text-purple-500" />
            Books by Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.booksByCategory || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => 
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  dataKey="count"
                  nameKey="_id"
                >
                  {(stats?.booksByCategory || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaHistory className="text-blue-500" />
            Recent Activities
          </h3>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {stats?.recentActivities?.length > 0 ? (
              stats.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-2 border-b last:border-0">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.action === 'issued' ? 'bg-green-500' :
                    activity.action === 'returned' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.studentId?.name}</span> {activity.action}{' '}
                      <span className="font-medium">{activity.bookId?.title}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No recent activities</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActive("issue-book")}
            className="p-4 border rounded-lg hover:bg-purple-50 transition-colors"
          >
            <FaPlus className="text-purple-500 text-2xl mx-auto mb-2" />
            <span className="text-sm">Issue Book</span>
          </button>
          <button
            onClick={() => setActive("return-book")}
            className="p-4 border rounded-lg hover:bg-green-50 transition-colors"
          >
            <FaUndo className="text-green-500 text-2xl mx-auto mb-2" />
            <span className="text-sm">Return Book</span>
          </button>
          <button
            onClick={() => setActive("books")}
            className="p-4 border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FaBook className="text-blue-500 text-2xl mx-auto mb-2" />
            <span className="text-sm">Add Book</span>
          </button>
          <button
            onClick={() => setActive("issued-books")}
            className="p-4 border rounded-lg hover:bg-orange-50 transition-colors"
          >
            <FaList className="text-orange-500 text-2xl mx-auto mb-2" />
            <span className="text-sm">View Issued</span>
          </button>
        </div>
      </div>
    </div>
  );
}

