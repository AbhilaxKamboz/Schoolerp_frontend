import { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaUsers, FaUserTie, FaUserGraduate, FaUserCog, FaChalkboard, FaBook, FaCalendarCheck, FaTasks, FaClock, FaChartBar, FaUserCheck, FaUserTimes, FaBars, FaDownload, FaSync, FaBell } from "react-icons/fa";
import {Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

import Swal from "sweetalert2";

export default function DashboardHome({ setActive }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    fetchDashboardData();
    
    // Auto refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await API.get(`/admin/dashboard-data?range=${timeRange}`);
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

 const handleLogout = async () => {
     Swal.fire({
       icon: "warning",
       title: "Are You sure want to Logout",
       showCancelButton: true,
       confirmButtonText: "Yes",
       cancelButtonText: "Cancel"
     }).then((result) => {
       if (result.isConfirmed) {
         logout();
         navigate("/");
       }
     })
   };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-blue-200 rounded-full"></div>
          {/* Inner spinning ring */}
          <div className="absolute top-0 left-0 w-16 h-16 md:w-20 md:h-20 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-gray-500 text-xs md:text-sm truncate">{title}</p>
          <p className="text-xl md:text-2xl lg:text-3xl font-bold mt-1 truncate">{value}</p>
        </div>
        <div className={`p-2 md:p-3 rounded-full flex-shrink-0 ml-2 ${bgColor} hover:scale-110 transition-transform`}>
          <Icon className="text-white text-lg md:text-xl lg:text-2xl" />
        </div>
      </div>
    </div>
  );

  // Prepare data for pie chart
  const userRoleData = data ? [
    { name: 'Admins', value: data.totalAdmins || 0 },
    { name: 'Teachers', value: data.totalTeachers || 0 },
    { name: 'Students', value: data.totalStudents || 0 },
  ] : [];

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Mobile Menu Button - Hidden on desktop */}
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaBars className="text-xl text-gray-600" />
          </button>
          
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              Welcome back! Here's what's happening today.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="flex-1 lg:flex-none border border-gray-300 bg-white px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
          >
            <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex-1 lg:flex-none bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Menu - Collapsible */}
      {showMobileMenu && (
        <div className="lg:hidden bg-white rounded-lg shadow-lg p-4 space-y-2">
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">Dashboard</button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">Analytics</button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">Reports</button>
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded">Settings</button>
        </div>
      )}

      {/* Welcome Banner - Responsive */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 md:p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-2">
              📊 System Overview
            </h2>
            <p className="text-sm md:text-base text-blue-100">
              Total Users: <span className="font-bold text-white">{data?.totalUsers || 0}</span> | 
              Active Today: <span className="font-bold text-white">{data?.activeUsers || 0}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* User Statistics - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard 
          icon={FaUsers} 
          title="Total Users" 
          value={data?.totalUsers?.toLocaleString() || 0} 
          bgColor="bg-blue-500"
        />
        <StatCard 
          icon={FaUserTie} 
          title="Admins" 
          value={data?.totalAdmins || 0} 
          bgColor="bg-purple-500"
        />
        <StatCard 
          icon={FaUserGraduate} 
          title="Students" 
          value={data?.totalStudents || 0} 
          bgColor="bg-green-500"
        />
        <StatCard 
          icon={FaUserCog} 
          title="Teachers" 
          value={data?.totalTeachers || 0} 
          bgColor="bg-orange-500"
        />
      </div>

      {/* Academic Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard 
          icon={FaChalkboard} 
          title="Active Classes" 
          value={data?.totalClasses || 0} 
          bgColor="bg-indigo-500"
        />
        <StatCard 
          icon={FaBook} 
          title="Subjects" 
          value={data?.totalSubjects || 0} 
          bgColor="bg-pink-500"
        />
        <StatCard 
          icon={FaCalendarCheck} 
          title="Today's Attendance" 
          value={data?.todayAttendance || 0} 
          bgColor="bg-teal-500"
        />
        <StatCard 
          icon={FaTasks} 
          title="Active Assignments" 
          value={data?.activeAssignments || 0} 
          bgColor="bg-cyan-500"
        />
      </div>

      {/* Charts Section - Stack on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* User Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
            <FaChartBar className="text-blue-500" />
            User Distribution
          </h3>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRoleData}
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
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Mobile Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-4 md:hidden">
            {userRoleData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-xs">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Timeline - Replace with your chart */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
            <FaBell className="text-purple-500" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {data?.recentUsers?.slice(0, 4).map((user, index) => (
              <div key={user._id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                  user.role === 'teacher' ? 'bg-blue-100 text-blue-600' :
                  user.role === 'student' ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <FaUserCheck className="text-2xl md:text-3xl opacity-80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded">+12%</span>
          </div>
          <p className="text-sm opacity-90">Active Users</p>
          <p className="text-2xl md:text-3xl font-bold">{data?.activeUsers || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <FaUserTimes className="text-2xl md:text-3xl opacity-80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded">-3%</span>
          </div>
          <p className="text-sm opacity-90">Inactive Users</p>
          <p className="text-2xl md:text-3xl font-bold">{data?.inactiveUsers || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <FaClock className="text-2xl md:text-3xl opacity-80" />
            <span className="text-xs bg-white/20 px-2 py-1 rounded">5 pending</span>
          </div>
          <p className="text-sm opacity-90">Pending Homework</p>
          <p className="text-2xl md:text-3xl font-bold">{data?.pendingHomework || 0}</p>
        </div>
      </div>

      {/* Class Distribution - Responsive */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
          <FaChartBar className="text-green-500" />
          Class Distribution
        </h3>
        
        {/* Desktop View */}
        <div className="hidden md:block space-y-4">
          {data?.classDistribution?.map((item) => {
            const maxCount = Math.max(...(data.classDistribution?.map(d => d.count) || [0]));
            return (
              <div key={item._id?._id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item._id?.className} - {item._id?.section}</span>
                  <span className="text-gray-600">{item.count} students</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-3">
          {data?.classDistribution?.map((item) => (
            <div key={item._id?._id} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{item._id?.className} - {item._id?.section}</span>
                <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded">
                  {item.count} students
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(item.count / 50) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {(!data?.classDistribution || data.classDistribution.length === 0) && (
          <p className="text-center text-gray-500 py-4">No class data available</p>
        )}
      </div>

      {/* Quick Actions - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <button onClick={()=>setActive("users")} className="bg-white p-3 md:p-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:bg-blue-50 group">
          <FaUsers className="text-blue-500 text-xl md:text-2xl mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs md:text-sm block text-center">Manage Users</span>
        </button>
        <button onClick={()=>setActive("classes")} className="bg-white p-3 md:p-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:bg-green-50 group">
          <FaChalkboard className="text-green-500 text-xl md:text-2xl mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs md:text-sm block text-center">Classes</span>
        </button>
        <button onClick={()=>setActive("subjects")} className="bg-white p-3 md:p-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:bg-purple-50 group">
          <FaBook className="text-purple-500 text-xl md:text-2xl mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs md:text-sm block text-center">Subjects</span>
        </button>
        <button className="bg-white p-3 md:p-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:bg-orange-50 group">
          <FaTasks className="text-orange-500 text-xl md:text-2xl mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-xs md:text-sm block text-center">Reports</span>
        </button>
      </div>
    </div>
  );
}