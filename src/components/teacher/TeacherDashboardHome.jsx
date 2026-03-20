import { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaChalkboardTeacher, FaBook, FaUsers, FaCalendarCheck, FaTasks, FaSync } from "react-icons/fa";
import Swal from "sweetalert2";

export default function TeacherDashboardHome({ setActive }) {
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalSubjects: 0,
    totalStudents: 0,
    todayAttendance: 0,
    pendingHomework: 0,
    pendingAssignments: 0,
    attendanceRate: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teacherName, setTeacherName] = useState("Teacher");

  const navigate = useNavigate();
  const { logout, user } = useAuth();

  useEffect(() => {
    if (user?.name) {
      setTeacherName(user.name.split(' ')[0]);
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get teacher's assignments
      const assignmentsRes = await API.get("/teacher/assignments");
      const assignments = assignmentsRes.data.assignments || [];

      // Get unique classes
      const uniqueClasses = [...new Set(assignments.map(a => a.classId?._id).filter(Boolean))];

      // Get total students
      let totalStudents = 0;
      if (uniqueClasses.length > 0) {
        try {
          const studentsRes = await API.get(`/teacher/class/${uniqueClasses[0]}/students`);
          totalStudents = studentsRes.data.total || 0;
        } catch (error) {
          console.error("Failed to fetch students:", error);
        }
      }

      // Get today's attendance
      const today = new Date().toISOString().split('T')[0];
      let todayAttendance = 0;
      if (assignments.length > 0) {
        try {
          const attendanceRes = await API.get("/teacher/attendance", {
            params: {
              classId: assignments[0].classId?._id,
              subjectId: assignments[0].subjectId?._id,
              date: today
            }
          });
          todayAttendance = attendanceRes.data.total || 0;
        } catch (error) {
          todayAttendance = 0;
        }
      }

      // Set stats with proper values
      setStats({
        totalClasses: uniqueClasses.length,
        totalSubjects: assignments.length,
        totalStudents: totalStudents,
        todayAttendance: todayAttendance,
        attendanceRate: totalStudents > 0 ? Math.round((todayAttendance / totalStudents) * 100) : 0
      });

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

  const StatCard = ({ icon: Icon, label, value, trend, bgColor }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {trend !== undefined && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}% from last week</span>
            </p>
          )}
        </div>
        <div className={`p-4 rounded-xl ${bgColor} bg-opacity-10`}>
          <Icon className={`text-3xl ${bgColor.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            Welcome Back, {teacherName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your classes today.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Today's Schedule Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <FaCalendarCheck className="text-2xl" />
          <h2 className="text-xl font-semibold">Today's Schedule</h2>
        </div>
        <p className="text-green-100">
          You have <span className="font-bold text-white">{stats.totalClasses} class{stats.totalClasses !== 1 ? 'es' : ''}</span> today across{' '}
          <span className="font-bold text-white">{stats.totalSubjects} subject{stats.totalSubjects !== 1 ? 's' : ''}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          icon={FaChalkboardTeacher} 
          label="My Classes" 
          value={stats.totalClasses} 
          trend={5}
          bgColor="bg-blue-500"
        />
        <StatCard 
          icon={FaBook} 
          label="Subjects" 
          value={stats.totalSubjects} 
          trend={0}
          bgColor="bg-green-500"
        />
        <StatCard 
          icon={FaUsers} 
          label="Students" 
          value={stats.totalStudents} 
          trend={8}
          bgColor="bg-purple-500"
        />
        <StatCard 
          icon={FaCalendarCheck} 
          label="Today's Attendance" 
          value={stats.todayAttendance} 
          trend={-2}
          bgColor="bg-yellow-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActive("attendance")}
            className="p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all group"
          >
            <FaCalendarCheck className="text-blue-500 text-2xl mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm text-center block">Mark Attendance</span>
          </button>
          
          <button
            onClick={() => setActive("homework")}
            className="p-4 border rounded-xl hover:bg-green-50 hover:border-green-300 transition-all group"
          >
            <FaBook className="text-green-500 text-2xl mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm text-center block">Add Homework</span>
          </button>
          
          <button
            onClick={() => setActive("assignments")}
            className="p-4 border rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all group"
          >
            <FaTasks className="text-purple-500 text-2xl mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm text-center block">Create Assignment</span>
          </button>
          
          <button
            onClick={() => setActive("students")}
            className="p-4 border rounded-xl hover:bg-orange-50 hover:border-orange-300 transition-all group"
          >
            <FaUsers className="text-orange-500 text-2xl mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm text-center block">View Students</span>
          </button>
        </div>
      </div>

    </div>
  );
}