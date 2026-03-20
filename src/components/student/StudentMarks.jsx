import { useEffect, useState } from "react";
import API from "../../api/api";
import { errorAlert, successAlert } from "../../utils/swal";
import { 
  FaChartBar, FaChartLine, FaAward, 
  FaCheckCircle, FaClock, FaDownload,
  FaFilter, FaSearch, FaEye, FaStar,
  FaGraduationCap, FaBook, FaCalendarAlt,
  FaChevronLeft, FaChevronRight, FaSync,
  FaTrophy, FaMedal, FaCertificate, FaFileAlt
} from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
} from 'recharts';

export default function StudentMarks() {
  const [assignmentMarks, setAssignmentMarks] = useState(null);
  const [testMarks, setTestMarks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' or 'tests'
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    fetchAllMarks();
  }, []);

  const fetchAllMarks = async () => {
    try {
      const [assignmentsRes, testsRes] = await Promise.all([
        API.get("/student/assignment-marks"),
        API.get("/student/test-marks")
      ]);
      
      setAssignmentMarks(assignmentsRes.data);
      setTestMarks(testsRes.data);
    } catch (err) {
      errorAlert("Error", "Failed to load marks");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllMarks();
    setRefreshing(false);
    successAlert("Refreshed", "Marks data updated");
  };

  const getOverallStats = () => {
    const assignmentStats = assignmentMarks?.subjectWise?.length 
      ? {
          total: assignmentMarks.subjectWise.reduce((acc, sub) => acc + sub.totalMarks, 0),
          obtained: assignmentMarks.subjectWise.reduce((acc, sub) => acc + sub.obtainedMarks, 0)
        }
      : { total: 0, obtained: 0 };

    const testStats = testMarks
      ? {
          total: testMarks.totalMarks || 0,
          obtained: testMarks.obtainedMarks || 0
        }
      : { total: 0, obtained: 0 };

    const totalMarks = assignmentStats.total + testStats.total;
    const obtainedMarks = assignmentStats.obtained + testStats.obtained;
    const percentage = totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(1) : 0;

    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';

    return {
      totalMarks,
      obtainedMarks,
      percentage,
      assignments: assignmentMarks?.totalChecked || 0,
      tests: testMarks?.markedTests || 0,
      grade
    };
  };

  const stats = getOverallStats();

  // Data for charts
  const subjectPerformanceData = assignmentMarks?.subjectWise?.map(sub => ({
    name: sub.subjectName,
    percentage: parseFloat(sub.percentage),
    obtained: sub.obtainedMarks,
    total: sub.totalMarks
  })) || [];

  const downloadMarksReport = () => {
    // Implementation for downloading report
  };

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
            My Marks
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Track your academic performance
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
          >
            <FaSync className={`${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={downloadMarksReport}
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
              <h2 className="text-lg md:text-xl font-semibold mb-1">Performance Overview</h2>
              <p className="text-sm md:text-base text-green-100">
                Your overall grade is <span className="font-bold text-white">{stats.grade}</span> with {stats.percentage}% average
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs">
              {assignmentMarks?.subjectWise?.length || 0} Subjects
            </span>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs md:text-sm">Total Marks</p>
              <p className="text-lg md:text-xl lg:text-2xl font-bold">{stats.totalMarks}</p>
            </div>
            <div className="p-2 md:p-3 bg-blue-100 rounded-lg">
              <FaChartBar className="text-blue-500 text-lg md:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs md:text-sm">Marks Obtained</p>
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-green-600">{stats.obtainedMarks}</p>
            </div>
            <div className="p-2 md:p-3 bg-green-100 rounded-lg">
              <FaAward className="text-green-500 text-lg md:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs md:text-sm">Percentage</p>
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-purple-600">{stats.percentage}%</p>
            </div>
            <div className="p-2 md:p-3 bg-purple-100 rounded-lg">
              <FaChartLine className="text-purple-500 text-lg md:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs md:text-sm">Assignments</p>
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-orange-600">{stats.assignments}</p>
            </div>
            <div className="p-2 md:p-3 bg-orange-100 rounded-lg">
              <FaCheckCircle className="text-orange-500 text-lg md:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs md:text-sm">Tests</p>
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-yellow-600">{stats.tests}</p>
            </div>
            <div className="p-2 md:p-3 bg-yellow-100 rounded-lg">
              <FaFileAlt className="text-yellow-500 text-lg md:text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'assignments' 
              ? 'text-green-600 border-b-2 border-green-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Assignment Marks
        </button>
        <button
          onClick={() => setActiveTab('tests')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'tests' 
              ? 'text-green-600 border-b-2 border-green-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Test Marks
        </button>
      </div>

      {/* Assignment Marks View */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {/* Subject-wise Performance Chart */}
          {subjectPerformanceData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold mb-4">Subject-wise Performance</h3>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="percentage" name="Percentage %" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Subject-wise Details */}
          {assignmentMarks?.subjectWise?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {assignmentMarks.subjectWise.map((subject, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                  <h3 className="text-lg font-semibold mb-3">{subject.subjectName}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Marks:</span>
                      <span className="font-medium">{subject.totalMarks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Marks Obtained:</span>
                      <span className="font-medium text-green-600">{subject.obtainedMarks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Percentage:</span>
                      <span className="font-medium text-purple-600">{subject.percentage}%</span>
                    </div>
                    <div className="pt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${subject.percentage}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Test Marks View */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          {/* Test Statistics */}
          {testMarks && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-white rounded-xl shadow-lg p-4">
                <p className="text-xs text-gray-500">Total Tests</p>
                <p className="text-xl font-bold">{testMarks.totalTests}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4">
                <p className="text-xs text-gray-500">Marked Tests</p>
                <p className="text-xl font-bold text-green-600">{testMarks.markedTests}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4">
                <p className="text-xs text-gray-500">Total Marks</p>
                <p className="text-xl font-bold">{testMarks.totalMarks}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4">
                <p className="text-xs text-gray-500">Obtained</p>
                <p className="text-xl font-bold text-purple-600">{testMarks.obtainedMarks}</p>
              </div>
            </div>
          )}

          {/* Tests List */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="text-lg font-semibold">Test Marks</h3>
            </div>

            {testMarks?.tests?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">Test Name</th>
                      <th className="p-3 text-left">Subject</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Max Marks</th>
                      <th className="p-3 text-left">Marks Obtained</th>
                      <th className="p-3 text-left">Percentage</th>
                      <th className="p-3 text-left">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testMarks.tests.map((test, index) => {
                      const percentage = test.marksObtained 
                        ? ((test.marksObtained / test.maxMarks) * 100).toFixed(1)
                        : 0;
                      
                      return (
                        <tr key={index} className="border-t hover:bg-gray-50">
                          <td className="p-3 font-medium">{test.testName}</td>
                          <td className="p-3">{test.subjectId?.name}</td>
                          <td className="p-3">{new Date(test.testDate).toLocaleDateString()}</td>
                          <td className="p-3">{test.maxMarks}</td>
                          <td className="p-3 font-medium text-green-600">
                            {test.marksObtained || '-'}
                          </td>
                          <td className="p-3">
                            {test.marksObtained ? (
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                percentage >= 75 ? 'bg-green-100 text-green-600' :
                                percentage >= 50 ? 'bg-yellow-100 text-yellow-600' :
                                'bg-red-100 text-red-600'
                              }`}>
                                {percentage}%
                              </span>
                            ) : (
                              <span className="text-gray-400">Not graded</span>
                            )}
                          </td>
                          <td className="p-3 text-gray-600">{test.remarks || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <FaFileAlt className="text-5xl text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No test marks found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4">
          <p className="text-xs opacity-90">Highest Score</p>
          <p className="text-xl font-bold">{stats.percentage}%</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4">
          <p className="text-xs opacity-90">Grade</p>
          <p className="text-xl font-bold">{stats.grade}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4">
          <p className="text-xs opacity-90">Assignments</p>
          <p className="text-xl font-bold">{stats.assignments}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-4">
          <p className="text-xs opacity-90">Tests</p>
          <p className="text-xl font-bold">{stats.tests}</p>
        </div>
      </div>
    </div>
  );
}