import { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {FaUserGraduate, FaChalkboard, FaBook, FaTasks, FaCalendarCheck, FaChartLine, FaCheckCircle, FaArrowRight, FaSync, FaGraduationCap, FaAward } from "react-icons/fa";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, } from 'recharts';
import Swal from "sweetalert2";

export default function StudentDashboardHome({ setActive }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState('overview'); // overview, attendance
  const [studentName, setStudentName] = useState("Student");

  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

  useEffect(() => {
    if (user?.name) {
      setStudentName(user.name.split(' ')[0]);
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/student/dashboard");
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
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

  // Prepare data for pie chart
  const attendanceData = data?.stats?.attendance ? [
    { name: 'Present', value: data.stats.attendance.present || 0 },
    { name: 'Absent', value: data.stats.attendance.absent || 0 },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-green-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 md:w-20 md:h-20 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, bgColor, trend }) => (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-gray-500 text-xs md:text-sm truncate">{title}</p>
          <p className="text-xl md:text-2xl lg:text-3xl font-bold mt-1 truncate">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1 truncate">{subtitle}</p>}
          {trend !== undefined && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}% from last week</span>
            </p>
          )}
        </div>
        <div className={`p-2 md:p-3 rounded-full flex-shrink-0 ml-2 ${bgColor} bg-opacity-10`}>
          <Icon className={`text-xl md:text-2xl ${bgColor.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
            Welcome Back, {studentName}!
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Class: {data?.classInfo?.className} - {data?.classInfo?.section}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
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

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-4 md:p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <FaGraduationCap className="text-3xl md:text-4xl" />
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-1">Your Academic Overview</h2>
              <p className="text-sm md:text-base text-green-100">
                Keep track of your attendance, homework, and assignments
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile View Tabs */}
      <div className="sm:hidden flex border-b">
        {['overview', 'attendance'].map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`flex-1 py-3 text-center font-medium capitalize transition-colors ${
              selectedView === view 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {view}
          </button>
        ))}
      </div>

      {/* Stats Grid - Responsive */}
      <div className={`
        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4
        ${selectedView !== 'overview' && 'hidden sm:grid'}
      `}>
        <StatCard 
          icon={FaUserGraduate}
          title="Attendance"
          value={`${data?.stats?.attendance?.percentage || 0}%`}
          subtitle={`${data?.stats?.attendance?.present || 0} Present, ${data?.stats?.attendance?.absent || 0} Absent`}
          bgColor="bg-green-500"
          trend={5}
        />
        
        <StatCard 
          icon={FaChalkboard}
          title="Subjects"
          value={data?.stats?.totalSubjects || 0}
          subtitle="Enrolled subjects"
          bgColor="bg-blue-500"
          trend={0}
        />
        
        <StatCard 
          icon={FaBook}
          title="Pending Homework"
          value={data?.stats?.pendingHomework || 0}
          subtitle="Need to complete"
          bgColor="bg-orange-500"
          trend={-2}
        />
        
        <StatCard 
          icon={FaTasks}
          title="Assignments"
          value={`${data?.stats?.submittedAssignments || 0}/${data?.stats?.totalAssignments || 0}`}
          subtitle={`${data?.stats?.checkedAssignments || 0} checked`}
          bgColor="bg-purple-500"
          trend={8}
        />
      </div>

      {/* Analytics Section - Shows on mobile when selected, always on desktop */}
      <div className={`
        grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6
        ${selectedView !== 'attendance' && 'hidden sm:grid'}
      `}>
        {/* Attendance Chart */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
            <FaChartLine className="text-green-500" />
            Attendance Overview
          </h3>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => 
                    window.innerWidth < 640 ? '' : `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={window.innerWidth < 640 ? 60 : 80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Mobile Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-4 md:hidden">
            {attendanceData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-xs">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
            <FaAward className="text-purple-500" />
            Performance Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Attendance Rate</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-green-600">
                  {data?.stats?.attendance?.percentage || 0}%
                </span>
                <FaCheckCircle className="text-green-500" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${data?.stats?.attendance?.percentage || 0}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-600">Assignment Completion</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-purple-600">
                  {data?.stats?.totalAssignments ? 
                    ((data.stats.checkedAssignments / data.stats.totalAssignments) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                style={{ 
                  width: data?.stats?.totalAssignments ? 
                    `${(data.stats.checkedAssignments / data.stats.totalAssignments) * 100}%` : '0%'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Responsive Grid */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <button
            onClick={() => setActive("attendance")}
            className="p-3 md:p-4 border rounded-xl hover:bg-green-50 hover:border-green-300 transition-all group"
          >
            <FaCalendarCheck className="text-green-500 text-xl md:text-2xl mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs md:text-sm text-center block">View Attendance</span>
          </button>
          
          <button
            onClick={() => setActive("homework")}
            className="p-3 md:p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all group"
          >
            <FaBook className="text-blue-500 text-xl md:text-2xl mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs md:text-sm text-center block">Homework</span>
          </button>
          
          <button
            onClick={() => setActive("assignments")}
            className="p-3 md:p-4 border rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all group"
          >
            <FaTasks className="text-purple-500 text-xl md:text-2xl mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs md:text-sm text-center block">Assignments</span>
          </button>
          
          <button
            onClick={() => setActive("marks")}
            className="p-3 md:p-4 border rounded-xl hover:bg-orange-50 hover:border-orange-300 transition-all group"
          >
            <FaChartLine className="text-orange-500 text-xl md:text-2xl mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs md:text-sm text-center block">Check Marks</span>
          </button>
        </div>
      </div>

      {/* Recent Activity - Responsive */}
      <div className={`
        grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6
        ${selectedView !== 'hidden lg:grid'}
      `}>
        {/* Recent Attendance */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
            <FaCalendarCheck className="text-green-500" />
            Recent Attendance
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data?.recentAttendance?.length > 0 ? (
              data.recentAttendance.map((att, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{att.subjectId?.name || 'Unknown Subject'}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(att.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    att.status === 'present' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {att.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No recent attendance records</p>
            )}
          </div>
          <button 
            onClick={() => setActive("attendance")}
            className="mt-4 text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
          >
            View All Attendance <FaArrowRight />
          </button>
        </div>
      </div>

      {/* Mobile View for (when selected) */}
      {selectedView === (
        <div className="lg:hidden space-y-4">
          {/* Recent Attendance Mobile */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <FaCalendarCheck className="text-green-500" />
              Recent Attendance
            </h3>
            <div className="space-y-2">
              {data?.recentAttendance?.slice(0, 3).map((att, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{att.subjectId?.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    att.status === 'present' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {att.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4">
          <p className="text-xs opacity-90">Present Days</p>
          <p className="text-xl font-bold">{data?.stats?.attendance?.present || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-4">
          <p className="text-xs opacity-90">Absent Days</p>
          <p className="text-xl font-bold">{data?.stats?.attendance?.absent || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4">
          <p className="text-xs opacity-90">Completed</p>
          <p className="text-xl font-bold">{data?.stats?.submittedAssignments || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4">
          <p className="text-xs opacity-90">Pending</p>
          <p className="text-xl font-bold">
            {(data?.stats?.totalAssignments || 0) - (data?.stats?.submittedAssignments || 0)}
          </p>
        </div>
      </div>
    </div>
  );
}