import { useEffect, useState } from "react";
import API from "../../api/api";
import { errorAlert } from "../../utils/swal";
import { 
  FaSearch, FaEye, FaChartBar, FaUserGraduate,
  FaEnvelope, FaIdCard, FaCalendarCheck, FaBook,
  FaCheckCircle, FaTimesCircle, FaClock,
  FaChevronLeft, FaChevronRight, FaDownload,
  FaFilter, FaSort, FaSortUp, FaSortDown,
  FaGraduationCap, FaAward, FaChartLine
} from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';

export default function TeacherStudents() {
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list"); // list, details, performance
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [attendanceChartData, setAttendanceChartData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

  useEffect(() => {
    fetchTeacherAssignments();
  }, []);

  useEffect(() => {
    if (classId) {
      fetchStudents(classId);
    }
  }, [classId]);

  useEffect(() => {
    let filtered = [...students];
    
    // Apply search filter
    if (search) {
      filtered = filtered.filter(s =>
        s.studentId.name.toLowerCase().includes(search.toLowerCase()) ||
        s.studentId.rollNo?.toLowerCase().includes(search.toLowerCase()) ||
        s.studentId.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a.studentId[sortConfig.key];
        let bValue = b.studentId[sortConfig.key];
        
        if (sortConfig.key === 'attendance') {
          aValue = getAttendancePercentage(a.studentId._id);
          bValue = getAttendancePercentage(b.studentId._id);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [search, students, sortConfig]);

  const fetchTeacherAssignments = async () => {
    try {
      const res = await API.get("/teacher/assignments");
      setAssignments(res.data.assignments);
    } catch {
      errorAlert("Error", "Failed to load assignments");
    }
  };

  const fetchStudents = async (clsId) => {
    try {
      setLoading(true);
      const res = await API.get(`/teacher/class/${clsId}/students`);
      setStudents(res.data.students);
      setFilteredStudents(res.data.students);
    } catch {
      errorAlert("Error", "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    try {
      setLoading(true);
      const [attendanceRes, submissionsRes] = await Promise.all([
        API.get("/teacher/student/attendance", { params: { studentId, classId } }),
        API.get("/teacher/student/submissions", { params: { studentId, classId } })
      ]);

      // Prepare chart data
      const attendanceData = attendanceRes.data.attendance || [];
      const monthlyData = processAttendanceForChart(attendanceData);
      setAttendanceChartData(monthlyData);

      const performanceStats = calculatePerformanceStats(submissionsRes.data.submissions || []);
      setPerformanceData(performanceStats);

      setStudentDetails({
        attendance: attendanceRes.data,
        submissions: submissionsRes.data
      });
      setView("details");
    } catch {
      errorAlert("Error", "Failed to load student details");
    } finally {
      setLoading(false);
    }
  };

  const processAttendanceForChart = (attendance) => {
    const monthly = {};
    attendance.forEach(a => {
      const month = new Date(a.date).toLocaleString('default', { month: 'short' });
      if (!monthly[month]) {
        monthly[month] = { month, present: 0, absent: 0, total: 0 };
      }
      if (a.status === 'present') {
        monthly[month].present++;
      } else {
        monthly[month].absent++;
      }
      monthly[month].total++;
    });
    return Object.values(monthly);
  };

  const calculatePerformanceStats = (submissions) => {
    const subjectWise = {};
    submissions.forEach(s => {
      const subject = s.assignmentId?.subjectId?.name || 'Unknown';
      if (!subjectWise[subject]) {
        subjectWise[subject] = { subject, obtained: 0, total: 0, count: 0 };
      }
      if (s.marksObtained) {
        subjectWise[subject].obtained += s.marksObtained;
        subjectWise[subject].total += s.assignmentId?.totalMarks || 0;
        subjectWise[subject].count++;
      }
    });
    return Object.values(subjectWise).map(s => ({
      ...s,
      percentage: s.total > 0 ? ((s.obtained / s.total) * 100).toFixed(1) : 0
    }));
  };

  const getAttendancePercentage = (studentId) => {
    // This would be calculated from actual attendance data
    // For now, returning mock data
    return Math.floor(Math.random() * 30) + 70; // 70-100%
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-gray-400" />;
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="text-blue-600" /> : 
      <FaSortDown className="text-blue-600" />;
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const downloadStudentList = () => {
    const csvContent = [
      ['Roll No', 'Name', 'Email', 'Attendance %'].join(','),
      ...filteredStudents.map(s => [
        s.studentId.rollNo || 'N/A',
        s.studentId.name,
        s.studentId.email,
        getAttendancePercentage(s.studentId._id)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-class-${classId}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
            My Students
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            View and manage your students
          </p>
        </div>
      </div>

      {/* Class Selection Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 md:p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <FaUserGraduate className="text-2xl" />
            <h2 className="text-lg font-semibold">Select Class</h2>
          </div>
          <select
            className="flex-1 border-none bg-white text-gray-800 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400"
            onChange={e => setClassId(e.target.value)}
            value={classId}
          >
            <option value="">Choose a class...</option>
            {assignments.map(a => (
              <option key={a._id} value={a.classId._id}>
                {a.classId.className}-{a.classId.section}
              </option>
            ))}
          </select>
        </div>
      </div>

      {classId && (
        <>
          {/* Search and Actions Bar */}
          <div className="bg-white rounded-xl shadow-lg p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, roll number or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-gray-300 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Download Button */}
              <button
                onClick={downloadStudentList}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaDownload /> Download List
              </button>
            </div>

            {/* Sort Options */}
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-gray-500 mr-2">Sort by:</span>
              <button
                onClick={() => requestSort('name')}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
              >
                Name {getSortIcon('name')}
              </button>
              <button
                onClick={() => requestSort('rollNo')}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
              >
                Roll No {getSortIcon('rollNo')}
              </button>
              <button
                onClick={() => requestSort('attendance')}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
              >
                Attendance {getSortIcon('attendance')}
              </button>
            </div>
          </div>

          {/* Students List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : view === "list" ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-left cursor-pointer hover:bg-gray-200" onClick={() => requestSort('rollNo')}>
                          <div className="flex items-center gap-2">
                            <FaIdCard className="text-gray-500" />
                            Roll No {getSortIcon('rollNo')}
                          </div>
                        </th>
                        <th className="p-3 text-left cursor-pointer hover:bg-gray-200" onClick={() => requestSort('name')}>
                          <div className="flex items-center gap-2">
                            <FaUserGraduate className="text-gray-500" />
                            Student Name {getSortIcon('name')}
                          </div>
                        </th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-center cursor-pointer hover:bg-gray-200" onClick={() => requestSort('attendance')}>
                          <div className="flex items-center justify-center gap-2">
                            <FaCalendarCheck className="text-gray-500" />
                            Attendance % {getSortIcon('attendance')}
                          </div>
                        </th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map(s => {
                        const attendancePercent = getAttendancePercentage(s.studentId._id);
                        return (
                          <tr key={s.studentId._id} className="border-t hover:bg-gray-50 transition-colors">
                            <td className="p-3 font-medium">{s.studentId.rollNo || '-'}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {s.studentId.name.charAt(0)}
                                </div>
                                <span className="font-medium">{s.studentId.name}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <FaEnvelope className="text-gray-400" />
                                <span>{s.studentId.email}</span>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      attendancePercent >= 75 ? 'bg-green-500' :
                                      attendancePercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${attendancePercent}%` }}
                                  ></div>
                                </div>
                                <span className={`text-sm font-medium ${
                                  attendancePercent >= 75 ? 'text-green-600' :
                                  attendancePercent >= 50 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {attendancePercent}%
                                </span>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedStudent(s.studentId);
                                    fetchStudentDetails(s.studentId._id);
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <FaEye />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedStudent(s.studentId);
                                    setView("performance");
                                  }}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Performance"
                                >
                                  <FaChartBar />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="p-4 border-t flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} students
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      >
                        <FaChevronLeft />
                      </button>
                      <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      >
                        <FaChevronRight />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {currentItems.map(s => {
                  const attendancePercent = getAttendancePercentage(s.studentId._id);
                  return (
                    <div key={s.studentId._id} className="bg-white rounded-xl shadow-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {s.studentId.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{s.studentId.name}</h3>
                            <p className="text-sm text-gray-500">Roll: {s.studentId.rollNo || '-'}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          attendancePercent >= 75 ? 'bg-green-100 text-green-600' :
                          attendancePercent >= 50 ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {attendancePercent}%
                        </span>
                      </div>

                      <div className="space-y-2 mb-3">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <FaEnvelope className="text-gray-400" />
                          {s.studentId.email}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              attendancePercent >= 75 ? 'bg-green-500' :
                              attendancePercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${attendancePercent}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(s.studentId);
                            fetchStudentDetails(s.studentId._id);
                          }}
                          className="flex-1 bg-blue-100 text-blue-600 py-2 rounded-lg text-sm hover:bg-blue-200 flex items-center justify-center gap-1"
                        >
                          <FaEye /> Details
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(s.studentId);
                            setView("performance");
                          }}
                          className="flex-1 bg-green-100 text-green-600 py-2 rounded-lg text-sm hover:bg-green-200 flex items-center justify-center gap-1"
                        >
                          <FaChartBar /> Performance
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Mobile Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 border rounded-lg disabled:opacity-50"
                    >
                      <FaChevronLeft />
                    </button>
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                      {currentPage}/{totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 border rounded-lg disabled:opacity-50"
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : view === "details" && studentDetails ? (
            /* Student Details View */
            <div className="space-y-6">
              {/* Header with Back Button */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView("list")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaChevronLeft />
                </button>
                <h2 className="text-xl font-semibold">Student Details</h2>
              </div>

              {/* Student Profile Card */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {selectedStudent?.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedStudent?.name}</h3>
                    <p className="text-blue-100">Roll No: {selectedStudent?.rollNo || 'N/A'}</p>
                    <p className="text-blue-100">{selectedStudent?.email}</p>
                  </div>
                </div>
              </div>

              {/* Attendance Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaCalendarCheck className="text-blue-500" />
                  Attendance Overview
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="present" name="Present" fill="#10b981" />
                      <Bar dataKey="absent" name="Absent" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Attendance Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Total Days</p>
                  <p className="text-2xl font-bold">{studentDetails.attendance?.attendance?.length || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-green-600">
                    {studentDetails.attendance?.attendance?.filter(a => a.status === "present").length || 0}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-red-600">
                    {studentDetails.attendance?.attendance?.filter(a => a.status === "absent").length || 0}
                  </p>
                </div>
              </div>

              {/* Recent Submissions */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FaBook className="text-purple-500" />
                    Recent Submissions
                  </h3>
                </div>

                {studentDetails.submissions?.submissions?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-3 text-left">Assignment</th>
                          <th className="p-3 text-left hidden md:table-cell">Subject</th>
                          <th className="p-3 text-left">Submitted On</th>
                          <th className="p-3 text-left">Marks</th>
                          <th className="p-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentDetails.submissions.submissions.map(s => (
                          <tr key={s._id} className="border-t hover:bg-gray-50">
                            <td className="p-3 font-medium">{s.assignmentId?.title}</td>
                            <td className="p-3 hidden md:table-cell">{s.assignmentId?.subjectId?.name}</td>
                            <td className="p-3">
                              <div>
                                <p>{new Date(s.submittedAt).toLocaleDateString()}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(s.submittedAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="font-medium">
                                {s.marksObtained || '-'} / {s.assignmentId?.totalMarks || '-'}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                s.status === 'checked' 
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-yellow-100 text-yellow-600'
                              }`}>
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <FaBook className="text-4xl mx-auto mb-3 text-gray-300" />
                    <p>No submissions yet</p>
                  </div>
                )}
              </div>
            </div>
          ) : view === "performance" && selectedStudent ? (
            /* Performance View */
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView("list")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaChevronLeft />
                </button>
                <h2 className="text-xl font-semibold">Performance Analytics</h2>
              </div>

              {/* Student Info Card */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-4 text-white">
                <div className="flex items-center gap-3">
                  <FaGraduationCap className="text-3xl" />
                  <div>
                    <h3 className="text-lg font-semibold">{selectedStudent.name}</h3>
                    <p className="text-purple-100">Academic Performance Overview</p>
                  </div>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaChartLine className="text-purple-500" />
                  Subject-wise Performance
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="percentage" name="Percentage %" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <p className="text-xs text-gray-500">Total Submissions</p>
                  <p className="text-xl font-bold">
                    {studentDetails?.submissions?.submissions?.length || 0}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <p className="text-xs text-gray-500">Average Score</p>
                  <p className="text-xl font-bold text-green-600">
                    {performanceData.length > 0 
                      ? (performanceData.reduce((acc, curr) => acc + parseFloat(curr.percentage), 0) / performanceData.length).toFixed(1)
                      : 0}%
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <p className="text-xs text-gray-500">Highest Score</p>
                  <p className="text-xl font-bold text-blue-600">
                    {Math.max(...performanceData.map(d => parseFloat(d.percentage)), 0)}%
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <p className="text-xs text-gray-500">Subjects</p>
                  <p className="text-xl font-bold text-purple-600">
                    {performanceData.length}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {filteredStudents.length === 0 && !loading && (
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <FaUserGraduate className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No students found</p>
              <p className="text-sm text-gray-400 mt-1">
                {search ? 'Try adjusting your search' : 'No students in this class'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}