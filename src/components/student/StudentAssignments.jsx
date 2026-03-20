import { useEffect, useState } from "react";
import API from "../../api/api";
import { successAlert, errorAlert, confirmAlert } from "../../utils/swal";
import {
  FaTasks, FaClock, FaCheckCircle, FaExclamationTriangle,
  FaEye, FaUpload, FaDownload, FaFileAlt, FaUserGraduate,
  FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown,
  FaChevronLeft, FaChevronRight, FaSync, FaGraduationCap,
  FaBook, FaUserTie, FaCalendarAlt, FaStar, FaAward
} from "react-icons/fa";
import Swal from 'sweetalert2';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // all, pending, submitted, checked, overdue
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionText, setSubmissionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [sortConfig, setSortConfig] = useState({ key: 'dueDate', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [showFilters, setShowFilters] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState("");
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchData();
    fetchSubjects();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let filtered = [...assignments];

    // Apply status filter
    const today = new Date().toISOString().split('T')[0];
    switch (filter) {
      case 'pending':
        filtered = filtered.filter(a => a.submissionStatus === "pending" && a.dueDate >= today);
        break;
      case 'submitted':
        filtered = filtered.filter(a => a.submissionStatus === "submitted");
        break;
      case 'checked':
        filtered = filtered.filter(a => a.submissionStatus === "checked");
        break;
      case 'overdue':
        filtered = filtered.filter(a => a.submissionStatus === "pending" && a.dueDate < today);
        break;
      default:
        break;
    }

    // Apply subject filter
    if (subjectFilter) {
      filtered = filtered.filter(a => a.subjectId?._id === subjectFilter);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.subjectId?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'subject') {
        aValue = a.subjectId?.name || '';
        bValue = b.subjectId?.name || '';
      }
      if (sortConfig.key === 'teacher') {
        aValue = a.teacherId?.name || '';
        bValue = b.teacherId?.name || '';
      }
      if (sortConfig.key === 'dueDate') {
        aValue = new Date(a.dueDate);
        bValue = new Date(b.dueDate);
      }
      if (sortConfig.key === 'status') {
        aValue = a.submissionStatus || '';
        bValue = b.submissionStatus || '';
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredAssignments(filtered);
    setCurrentPage(1);
  }, [assignments, filter, searchTerm, sortConfig, subjectFilter]);

  const fetchData = async () => {
    try {
      const [assignmentsRes, submissionsRes] = await Promise.all([
        API.get("/student/my-assignments"),
        API.get("/student/my-submissions")
      ]);

      setAssignments(assignmentsRes.data.assignments || []);
      setFilteredAssignments(assignmentsRes.data.assignments || []);
      setSubmissions(submissionsRes.data.submissions || []);
    } catch (err) {
      errorAlert("Error", "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await API.get("/student/my-subjects");
      setSubjects(res.data.subjects || []);
    } catch (err) {
      console.error("Failed to load subjects");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    successAlert("Refreshed", "Assignment data updated");
  };

  const getFilteredAssignments = () => {
    if (filter === "all") return filteredAssignments;
    return filteredAssignments;
  };

  // Update the getStatusBadge function to handle both types
  const getStatusBadge = (assignment) => {
    const today = new Date().toISOString().split('T')[0];
    const dueDate = assignment.dueDate;

    if (assignment.submissionStatus === "checked") {
      return {
        text: 'Checked',
        class: 'bg-green-100 text-green-600',
        icon: <FaCheckCircle />
      };
    } else if (assignment.submissionStatus === "submitted") {
      return {
        text: 'Submitted',
        class: 'bg-blue-100 text-blue-600',
        icon: <FaUpload />
      };
    } else if (dueDate < today) {
      return {
        text: 'Overdue',
        class: 'bg-red-100 text-red-600',
        icon: <FaExclamationTriangle />
      };
    } else {
      return {
        text: 'Pending',
        class: 'bg-yellow-100 text-yellow-600',
        icon: <FaClock />
      };
    }
  };

  const getDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();

    if (!submissionText.trim()) {
      return errorAlert("Error", "Please enter your submission");
    }

    try {
      setSubmitting(true);
      await API.post("/student/assignment/submit", {
        assignmentId: selectedAssignment._id,
        submissionText: submissionText.trim()
      });

      await Swal.fire({
        title: 'Success!',
        text: 'Assignment submitted successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      setShowSubmitModal(false);
      setSubmissionText("");
      fetchData();
    } catch (err) {
      errorAlert("Error", err.response?.data?.message || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const viewSubmission = (assignmentId) => {
    const submission = submissions.find(s => s.assignmentId._id === assignmentId);
    if (submission) {
      setSelectedAssignment({
        ...submission.assignmentId,
        submission: submission
      });
      setShowAssignmentModal(true);
    }
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
      <FaSortUp className="text-green-600" /> :
      <FaSortDown className="text-green-600" />;
  };

  const downloadAssignment = (assignment) => {
    const content = `Title: ${assignment.title}\nSubject: ${assignment.subjectId?.name}\nTeacher: ${assignment.teacherId?.name}\nDue Date: ${new Date(assignment.dueDate).toLocaleDateString()}\nTotal Marks: ${assignment.totalMarks || 'N/A'}\n\nDescription:\n${assignment.description}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assignment.title.replace(/\s+/g, '_')}_assignment.txt`;
    a.click();
    successAlert("Downloaded", "Assignment details downloaded");
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

  const filteredAssignmentsList = getFilteredAssignments();

  // Calculate statistics
  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.submissionStatus === "pending" && a.dueDate >= new Date().toISOString().split('T')[0]).length,
    submitted: assignments.filter(a => a.submissionStatus === "submitted").length,
    checked: assignments.filter(a => a.submissionStatus === "checked").length,
    overdue: assignments.filter(a => a.dueDate < new Date().toISOString().split('T')[0] && a.submissionStatus === "pending").length
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssignmentsList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAssignmentsList.length / itemsPerPage);

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
            My Assignments
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Track and submit your assignments
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

          {/* View Toggle */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
            >
              <FaTasks className="text-gray-600" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
            >
              <FaFileAlt className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-4 md:p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <FaGraduationCap className="text-3xl md:text-4xl" />
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-1">Assignment Overview</h2>
              <p className="text-sm md:text-base text-green-100">
                You have <span className="font-bold text-white">{stats.pending + stats.overdue}</span> pending assignments
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs">
              Total: {stats.total} assignments
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <p className="text-gray-500 text-xs">Total</p>
          <p className="text-xl md:text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4">
          <p className="text-gray-500 text-xs">Pending</p>
          <p className="text-xl md:text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4">
          <p className="text-gray-500 text-xs">Submitted</p>
          <p className="text-xl md:text-2xl font-bold text-blue-600">{stats.submitted}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4">
          <p className="text-gray-500 text-xs">Checked</p>
          <p className="text-xl md:text-2xl font-bold text-green-600">{stats.checked}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:col-span-3 lg:col-span-1">
          <p className="text-gray-500 text-xs">Overdue</p>
          <p className="text-xl md:text-2xl font-bold text-red-600">{stats.overdue}</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, description or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaFilter className={showFilters ? 'text-green-600' : ''} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 mt-4 border-t">
            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Subjects</option>
                {subjects.map(s => (
                  <option key={s.subjectId._id} value={s.subjectId._id}>
                    {s.subjectId.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={`${sortConfig.key}-${sortConfig.direction}`}
                onChange={(e) => {
                  const [key, direction] = e.target.value.split('-');
                  setSortConfig({ key, direction });
                }}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="dueDate-asc">Due Date (Earliest)</option>
                <option value="dueDate-desc">Due Date (Latest)</option>
                <option value="subject-asc">Subject (A-Z)</option>
                <option value="subject-desc">Subject (Z-A)</option>
                <option value="status-asc">Status (A-Z)</option>
                <option value="status-desc">Status (Z-A)</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilter('all');
                  setSubjectFilter('');
                  setSearchTerm('');
                  setSortConfig({ key: 'dueDate', direction: 'asc' });
                }}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs - Scrollable on mobile */}
      <div className="bg-white p-2 rounded-xl shadow-lg overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${filter === 'all'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
              }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${filter === 'pending'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
              }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('submitted')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${filter === 'submitted'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
              }`}
          >
            Submitted ({stats.submitted})
          </button>
          <button
            onClick={() => setFilter('checked')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${filter === 'checked'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
              }`}
          >
            Checked ({stats.checked})
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${filter === 'overdue'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
              }`}
          >
            Overdue ({stats.overdue})
          </button>
        </div>
      </div>

      {/* Assignments Grid/List */}
      {filteredAssignmentsList.length > 0 ? (
        <>
          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {currentItems.map((assignment) => {
                const status = getStatusBadge(assignment);

                return (
                  <div key={assignment._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {/* Status Bar */}
                    <div className={`h-1 w-full ${status.text === 'Checked' ? 'bg-green-500' :
                      status.text === 'Submitted' ? 'bg-blue-500' :
                        status.text === 'Overdue' ? 'bg-red-500' :
                          'bg-yellow-500'
                      }`} />

                    <div className="p-4 md:p-6">
                      {/* Header with Type and Status */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-base md:text-lg font-semibold line-clamp-2">{assignment.title}</h3>
                          {/* Type Badge */}
                          <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${assignment.type === 'assignment'
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-blue-100 text-blue-600'
                            }`}>
                            {assignment.type}
                          </span>
                        </div>
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs whitespace-nowrap ml-2 ${status.class}`}>
                          {status.icon}
                          <span className="hidden sm:inline">{status.text}</span>
                        </span>
                      </div>

                      {/* Rest of the card remains the same */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <FaBook className="text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600 truncate">{assignment.subjectId?.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FaUserTie className="text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600 truncate">{assignment.teacherId?.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FaCalendarAlt className="text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600">
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        {assignment.totalMarks && (
                          <div className="flex items-center gap-2 text-sm">
                            <FaStar className="text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600">Marks: {assignment.totalMarks}</span>
                          </div>
                        )}
                      </div>

                      {/* Days Left */}
                      <p className={`text-sm font-medium mb-4 ${getDaysLeft(assignment.dueDate) === 'Overdue' ? 'text-red-600' :
                        getDaysLeft(assignment.dueDate).includes('Due today') ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                        {getDaysLeft(assignment.dueDate)}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setShowAssignmentModal(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <FaEye /> View
                        </button>

                        {assignment.submissionStatus === "pending" && assignment.dueDate >= new Date().toISOString().split('T')[0] && (
                          <button
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowSubmitModal(true);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            <FaUpload /> Submit
                          </button>
                        )}

                        {assignment.submissionStatus !== "pending" && (
                          <button
                            onClick={() => viewSubmission(assignment._id)}
                            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                          >
                            <FaFileAlt /> View
                          </button>
                        )}

                        <button
                          onClick={() => downloadAssignment(assignment)}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Download"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="divide-y">
                {currentItems.map((assignment) => {
                  const status = getStatusBadge(assignment);

                  return (
                    <div key={assignment._id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold">{assignment.title}</h3>
                            {/* Type Badge */}
                            <span className={`px-2 py-1 rounded-full text-xs ${assignment.type === 'assignment'
                              ? 'bg-purple-100 text-purple-600'
                              : 'bg-blue-100 text-blue-600'
                              }`}>
                              {assignment.type}
                            </span>
                            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${status.class}`}>
                              {status.icon}
                              {status.text}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <FaBook className="text-gray-400" />
                              <span>{assignment.subjectId?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaUserTie className="text-gray-400" />
                              <span>{assignment.teacherId?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-gray-400" />
                              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                            </div>
                            {assignment.totalMarks && (
                              <div className="flex items-center gap-2">
                                <FaStar className="text-gray-400" />
                                <span>Marks: {assignment.totalMarks}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowAssignmentModal(true);
                            }}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          >
                            View
                          </button>
                          {assignment.submissionStatus === "pending" && assignment.dueDate >= new Date().toISOString().split('T')[0] && (
                            <button
                              onClick={() => {
                                setSelectedAssignment(assignment);
                                setShowSubmitModal(true);
                              }}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                            >
                              Submit
                            </button>
                          )}
                          {assignment.submissionStatus !== "pending" && (
                            <button
                              onClick={() => viewSubmission(assignment._id)}
                              className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                            >
                              Submission
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg text-center">
          <FaTasks className="text-5xl md:text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">No Assignments Found</h3>
          <p className="text-sm md:text-base text-gray-500">
            {searchTerm || subjectFilter || filter !== 'all'
              ? 'Try adjusting your filters'
              : 'You have no assignments at the moment'}
          </p>
        </div>
      )}
      
      {/* Assignment Details Modal */}
      {showAssignmentModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl md:text-2xl font-bold">{selectedAssignment.title}</h2>
                <button
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setSelectedAssignment(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>

              {/* Status Bar with Type */}
              <div className="mb-6 flex gap-2 flex-wrap">
                {/* Type Badge */}
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${selectedAssignment.type === 'assignment'
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-blue-100 text-blue-600'
                  }`}>
                  {selectedAssignment.type === 'assignment' ? 'Assignment' : 'Homework'}
                </span>

                {(() => {
                  const status = getStatusBadge(selectedAssignment);
                  return (
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${status.class}`}>
                      {status.icon}
                      {status.text}
                    </span>
                  );
                })()}
              </div>

              {/* Rest of the modal remains the same */}
              <div className="space-y-6">
                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-xs text-green-600 mb-1">Subject</p>
                    <p className="font-medium">{selectedAssignment.subjectId?.name}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">Teacher</p>
                    <p className="font-medium">{selectedAssignment.teacherId?.name}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-xs text-purple-600 mb-1">Due Date</p>
                    <p className="font-medium">
                      {new Date(selectedAssignment.dueDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  {selectedAssignment.totalMarks && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-xs text-orange-600 mb-1">Total Marks</p>
                      <p className="font-medium">{selectedAssignment.totalMarks}</p>
                    </div>
                  )}
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-xs text-yellow-600 mb-1">Days Left</p>
                    <p className="font-medium">{getDaysLeft(selectedAssignment.dueDate)}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-700">
                    {selectedAssignment.description}
                  </div>
                </div>

                {/* Submission (if exists) */}
                {selectedAssignment.submission && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Your Submission</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">
                        Submitted on: {new Date(selectedAssignment.submission.submittedAt).toLocaleString()}
                      </p>
                      <div className="bg-white p-3 rounded-lg border">
                        {selectedAssignment.submission.submissionText}
                      </div>
                      {selectedAssignment.submission.marksObtained && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <p className="font-medium text-green-700">
                            Marks Obtained: {selectedAssignment.submission.marksObtained} / {selectedAssignment.totalMarks}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      downloadAssignment(selectedAssignment);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaDownload /> Download
                  </button>
                  <button
                    onClick={() => {
                      setShowAssignmentModal(false);
                      setSelectedAssignment(null);
                    }}
                    className="flex-1 bg-gray-500 text-white px-4 py-2.5 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Submit Assignment Modal */}
      {showSubmitModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl md:text-2xl font-bold">Submit Assignment</h2>
                <button
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSelectedAssignment(null);
                    setSubmissionText("");
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>

              <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                <p className="font-medium">{selectedAssignment.title}</p>
                <p className="text-sm text-gray-600">{selectedAssignment.subjectId?.name}</p>
                <p className="text-sm text-orange-600 mt-2">
                  Due: {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                </p>
              </div>

              <form onSubmit={handleSubmitAssignment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Submission
                  </label>
                  <textarea
                    rows="8"
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Write your assignment submission here..."
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
                  >
                    {submitting ? "Submitting..." : "Submit Assignment"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSubmitModal(false);
                      setSelectedAssignment(null);
                      setSubmissionText("");
                    }}
                    className="flex-1 bg-gray-500 text-white px-4 py-2.5 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}