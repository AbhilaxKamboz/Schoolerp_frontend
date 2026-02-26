import { useEffect, useState } from "react";
import API from "../../api/api";
import { errorAlert, successAlert } from "../../utils/swal";
import { FaCalendarCheck, FaChartPie, FaCheckCircle, FaTimesCircle, FaDownload, FaFilter, FaSearch, FaChartLine, FaEye, FaChevronLeft, FaChevronRight, FaSync, FaGraduationCap, FaBookOpen } from "react-icons/fa";
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState('table'); // table, chart, calendar
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [trendData, setTrendData] = useState([]);

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

  useEffect(() => {
    fetchAttendance();
    fetchSummary();
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth, selectedSubject]);

  useEffect(() => {
    // Filter attendance based on search
    if (attendance.length > 0) {
      let filtered = [...attendance];
      
      if (searchTerm) {
        filtered = filtered.filter(a => 
          a.subjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.teacherId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (dateRange.start) {
        filtered = filtered.filter(a => new Date(a.date) >= new Date(dateRange.start));
      }
      if (dateRange.end) {
        filtered = filtered.filter(a => new Date(a.date) <= new Date(dateRange.end));
      }

      setFilteredAttendance(filtered);
    }
  }, [attendance, searchTerm, dateRange]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      let url = "/student/my-attendance?";
      if (selectedMonth) url += `month=${selectedMonth}&`;
      if (selectedSubject) url += `subjectId=${selectedSubject}`;
      
      const res = await API.get(url);
      setAttendance(res.data.attendance || []);
      setFilteredAttendance(res.data.attendance || []);
      
      // Prepare trend data
      prepareTrendData(res.data.attendance || []);
    } catch (err) {
      errorAlert("Error", "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const prepareTrendData = (data) => {
    const monthly = {};
    data.forEach(a => {
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
    setTrendData(Object.values(monthly));
  };

  const fetchSummary = async () => {
    try {
      const res = await API.get("/student/attendance-summary");
      setSummary(res.data.summary || []);
    } catch (err) {
      errorAlert("Error", "Failed to load attendance summary");
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await API.get("/student/my-subjects");
      setSubjects(res.data.subjects || []);
    } catch (err) {
      errorAlert("Error", "Failed to load subjects");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAttendance();
    await fetchSummary();
    setRefreshing(false);
    successAlert("Refreshed", "Attendance data updated");
  };

  const getOverallStats = () => {
    if (!filteredAttendance.length) return { present: 0, absent: 0, total: 0, percentage: 0 };
    
    const present = filteredAttendance.filter(a => a.status === "present").length;
    const absent = filteredAttendance.filter(a => a.status === "absent").length;
    const total = filteredAttendance.length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    
    return { present, absent, total, percentage };
  };

  const stats = getOverallStats();

  const pieData = [
    { name: 'Present', value: stats.present },
    { name: 'Absent', value: stats.absent },
  ];

  const downloadReport = () => {
    const csvContent = [
      ['Date', 'Subject', 'Teacher', 'Status'].join(','),
      ...filteredAttendance.map(a => [
        new Date(a.date).toLocaleDateString(),
        a.subjectId?.name || 'N/A',
        a.teacherId?.name || 'N/A',
        a.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    successAlert("Downloaded", "Report downloaded successfully");
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAttendance.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage);

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

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
            My Attendance
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Track your attendance across all subjects
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
          >
            <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Download Button */}
          <button
            onClick={downloadReport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <FaDownload /> Download
          </button>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-4 md:p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <FaGraduationCap className="text-3xl md:text-4xl" />
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-1">Attendance Overview</h2>
              <p className="text-sm md:text-base text-green-100">
                Your overall attendance is <span className="font-bold text-white">{stats.percentage}%</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs">
              {new Date().toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile View Tabs */}
      <div className="sm:hidden flex border-b">
        {['stats', 'charts', 'records'].map((view) => (
          <button
            key={view}
            onClick={() => setViewMode(view)}
            className={`flex-1 py-3 text-center font-medium capitalize transition-colors ${
              viewMode === view 
                ? 'text-green-600 border-b-2 border-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {view}
          </button>
        ))}
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className={`
        grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4
        ${viewMode !== 'stats' && 'hidden sm:grid'}
      `}>
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs md:text-sm">Total Days</p>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="p-2 md:p-3 bg-blue-100 rounded-lg">
              <FaCalendarCheck className="text-blue-500 text-xl md:text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs md:text-sm">Present</p>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-green-600">{stats.present}</p>
            </div>
            <div className="p-2 md:p-3 bg-green-100 rounded-lg">
              <FaCheckCircle className="text-green-500 text-xl md:text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs md:text-sm">Absent</p>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-red-600">{stats.absent}</p>
            </div>
            <div className="p-2 md:p-3 bg-red-100 rounded-lg">
              <FaTimesCircle className="text-red-500 text-xl md:text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs md:text-sm">Percentage</p>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-600">{stats.percentage}%</p>
            </div>
            <div className="p-2 md:p-3 bg-purple-100 rounded-lg">
              <FaChartPie className="text-purple-500 text-xl md:text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section - Collapsible on mobile */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden w-full flex items-center justify-between text-left mb-2"
        >
          <span className="font-medium flex items-center gap-2">
            <FaFilter /> Filters
          </span>
          <span>{showFilters ? '▲' : '▼'}</span>
        </button>

        <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Subjects</option>
                {subjects.map(s => (
                  <option key={s.subjectId._id} value={s.subjectId._id}>
                    {s.subjectId.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Start */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Date Range End */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => {
                setSelectedMonth("");
                setSelectedSubject("");
                setDateRange({ start: "", end: "" });
                setSearchTerm("");
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-lg">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by subject or teacher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Charts Section - Responsive */}
      <div className={`
        grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6
        ${viewMode !== 'charts' && 'hidden lg:grid'}
      `}>
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
            <FaChartPie className="text-green-500" />
            Attendance Distribution
          </h3>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
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

        {/* Trend Chart */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
            <FaChartLine className="text-blue-500" />
            Monthly Trend
          </h3>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }} />
                <YAxis tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: window.innerWidth < 640 ? 10 : 12 }} />
                <Line type="monotone" dataKey="present" stroke="#10b981" name="Present" />
                <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absent" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject-wise Summary */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
            <FaBookOpen className="text-purple-500" />
            Subject-wise Attendance
          </h3>
          <div className="space-y-4">
            {summary.length > 0 ? (
              summary.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-medium text-sm">{item.subjectName}</span>
                    <span className="text-sm">
                      {item.present}/{item.total} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No subject data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className={`
        bg-white rounded-xl shadow-lg overflow-hidden
        ${viewMode !== 'records' && 'hidden sm:block'}
      `}>
        <div className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
            <FaEye className="text-green-500" />
            Attendance Records
          </h3>
          <span className="text-sm text-gray-500">
            {filteredAttendance.length} records found
          </span>
        </div>
        
        {filteredAttendance.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Subject</th>
                    <th className="p-3 text-left">Teacher</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((record, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <FaBookOpen className="text-gray-400" />
                          <span>{record.subjectId?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-3">{record.teacherId?.name || 'N/A'}</td>
                      <td className="p-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.status === 'present'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {record.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden p-4 space-y-3">
              {currentItems.map((record, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{record.subjectId?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      record.status === 'present'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Teacher: {record.teacherId?.name || 'N/A'}
                  </p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAttendance.length)} of {filteredAttendance.length} records
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <FaChevronLeft />
                  </button>
                  <span className="px-4 py-2 bg-green-600 text-white rounded-lg">
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
          </>
        ) : (
          <div className="p-8 text-center">
            <FaCalendarCheck className="text-5xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No attendance records found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4">
          <p className="text-xs opacity-90">Total Days</p>
          <p className="text-xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4">
          <p className="text-xs opacity-90">Present</p>
          <p className="text-xl font-bold">{stats.present}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-4">
          <p className="text-xs opacity-90">Absent</p>
          <p className="text-xl font-bold">{stats.absent}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4">
          <p className="text-xs opacity-90">Rate</p>
          <p className="text-xl font-bold">{stats.percentage}%</p>
        </div>
      </div>
    </div>
  );
}