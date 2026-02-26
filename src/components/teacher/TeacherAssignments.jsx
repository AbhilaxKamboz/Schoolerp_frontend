import { useEffect, useState } from "react";
import API from "../../api/api";
import { successAlert, errorAlert, confirmAlert } from "../../utils/swal";
import { 
  FaPlus, FaEdit, FaTrash, FaCheck, FaEye,
  FaBook, FaCalendarAlt, FaClock, FaExclamationTriangle,
  FaChevronDown, FaChevronUp, FaSearch, FaFilter,
  FaDownload, FaShare, FaCopy, FaFileAlt,
  FaGraduationCap, FaUsers, FaStar, FaAward
} from "react-icons/fa";
import Swal from 'sweetalert2';

export default function TeacherAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [filteredAssignments, setFilteredAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [classId, setClassId] = useState("");
    const [subjectId, setSubjectId] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [showSubmissions, setShowSubmissions] = useState(false);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [viewMode, setViewMode] = useState("list"); // list, grid
    const [expandedId, setExpandedId] = useState(null);
    const [submissionSearch, setSubmissionSearch] = useState("");

    const [form, setForm] = useState({
        title: "",
        description: "",
        dueDate: "",
        totalMarks: "",
        type: "assignment"
    });

    // Fetch teacher's assigned classes/subjects
    const [teacherAssignments, setTeacherAssignments] = useState([]);

    useEffect(() => {
        fetchTeacherAssignments();
    }, []);

    useEffect(() => {
        // Filter assignments based on search and status
        let filtered = [...assignments];
        
        if (searchTerm) {
            filtered = filtered.filter(a => 
                a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        const today = new Date().toISOString().split('T')[0];
        if (filterStatus === 'active') {
            filtered = filtered.filter(a => a.dueDate >= today);
        } else if (filterStatus === 'overdue') {
            filtered = filtered.filter(a => a.dueDate < today);
        }

        setFilteredAssignments(filtered);
    }, [assignments, searchTerm, filterStatus]);

    useEffect(() => {
        // Filter submissions based on search
        if (submissions.length > 0 && submissionSearch) {
            const filtered = submissions.filter(s => 
                s.studentId?.name.toLowerCase().includes(submissionSearch.toLowerCase())
            );
            setFilteredSubmissions(filtered);
        } else {
            setFilteredSubmissions(submissions);
        }
    }, [submissions, submissionSearch]);

    const fetchTeacherAssignments = async () => {
        try {
            const res = await API.get("/teacher/assignments");
            setTeacherAssignments(res.data.assignments);
        } catch {
            errorAlert("Error", "Failed to load assignments");
        }
    };

    const fetchAssignments = async () => {
        if (!classId || !subjectId) return;

        try {
            setLoading(true);
            const res = await API.get("/teacher/assignment/list", {
                params: { classId, subjectId }
            });
            setAssignments(res.data.assignments || []);
            setFilteredAssignments(res.data.assignments || []);
        } catch {
            errorAlert("Error", "Failed to load assignments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, [classId, subjectId]);

    const fetchSubmissions = async (assignmentId) => {
        try {
            setLoading(true);
            const res = await API.get("/teacher/assignment/submissions", {
                params: { assignmentId }
            });
            setSubmissions(res.data.submissions || []);
            setFilteredSubmissions(res.data.submissions || []);
            setSelectedAssignment(assignmentId);
            setShowSubmissions(true);
        } catch {
            errorAlert("Error", "Failed to load submissions");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const saveAssignment = async (e) => {
        e.preventDefault();

        if (!classId || !subjectId) {
            return errorAlert("Required", "Please select class and subject");
        }

        if (!form.title || !form.description || !form.dueDate) {
            return errorAlert("Required", "All fields are required");
        }

        if (form.type === "assignment" && !form.totalMarks) {
            return errorAlert("Required", "Total marks required for assignment");
        }

        try {
            setLoading(true);
            if (editId) {
                await API.put(`/teacher/assignment/${editId}`, {
                    title: form.title,
                    description: form.description,
                    dueDate: form.dueDate,
                    totalMarks: form.type === "assignment" ? form.totalMarks : null,
                    type: form.type
                });
                successAlert("Updated", "Assignment updated successfully");
            } else {
                await API.post("/teacher/assignment/create", {
                    classId,
                    subjectId,
                    ...form,
                    totalMarks: form.type === "assignment" ? form.totalMarks : null
                });
                successAlert("Created", "Assignment created successfully");
            }

            resetForm();
            fetchAssignments();
        } catch (err) {
            errorAlert("Error", err.response?.data?.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const checkSubmission = async (submissionId, marks) => {
        const { value: marksValue } = await Swal.fire({
            title: 'Enter Marks',
            input: 'number',
            inputLabel: 'Marks Obtained',
            inputValue: marks || '',
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return 'Marks are required';
                }
                if (value < 0) {
                    return 'Marks cannot be negative';
                }
            }
        });

        if (marksValue) {
            try {
                await API.put("/teacher/assignment/check", {
                    submissionId,
                    marksObtained: parseInt(marksValue)
                });
                
                await Swal.fire({
                    title: 'Success!',
                    text: 'Submission checked successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                fetchSubmissions(selectedAssignment);
            } catch {
                errorAlert("Error", "Failed to check submission");
            }
        }
    };

    const deleteAssignment = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Assignment',
            text: "Are you sure you want to delete this assignment?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it'
        });

        if (!result.isConfirmed) return;

        try {
            await API.delete(`/teacher/assignment/${id}`);
            
            await Swal.fire({
                title: 'Deleted!',
                text: 'Assignment deleted successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            
            fetchAssignments();
        } catch {
            errorAlert("Error", "Failed to delete assignment");
        }
    };

    const resetForm = () => {
        setForm({
            title: "",
            description: "",
            dueDate: "",
            totalMarks: "",
            type: "assignment"
        });
        setEditId(null);
    };

    const getDueStatus = (dueDate) => {
        const today = new Date().toISOString().split('T')[0];
        const due = new Date(dueDate);
        const now = new Date();
        const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

        if (dueDate < today) {
            return {
                label: 'Overdue',
                color: 'bg-red-100 text-red-600',
                icon: <FaExclamationTriangle />
            };
        } else if (daysLeft <= 2) {
            return {
                label: 'Due Soon',
                color: 'bg-orange-100 text-orange-600',
                icon: <FaClock />
            };
        } else {
            return {
                label: 'Active',
                color: 'bg-green-100 text-green-600',
                icon: <FaCalendarAlt />
            };
        }
    };

    const downloadAssignment = (assignment) => {
        const content = `Title: ${assignment.title}\nType: ${assignment.type}\nDescription: ${assignment.description}\nDue Date: ${new Date(assignment.dueDate).toLocaleDateString()}\nTotal Marks: ${assignment.totalMarks || 'N/A'}`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${assignment.title.replace(/\s+/g, '_')}_assignment.txt`;
        a.click();
    };

    const copyAssignment = (assignment) => {
        const content = `Title: ${assignment.title}\nDescription: ${assignment.description}\nDue Date: ${new Date(assignment.dueDate).toLocaleDateString()}`;
        navigator.clipboard.writeText(content);
        successAlert("Copied!", "Assignment details copied to clipboard");
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="space-y-4 md:space-y-6 px-2 sm:px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
                        Assignments Management
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1">
                        Create and manage assignments, check submissions
                    </p>
                </div>

                {/* View Toggle for Mobile */}
                <div className="flex gap-2 sm:hidden">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1 rounded-lg text-sm ${
                            viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-100'
                        }`}
                    >
                        List
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1 rounded-lg text-sm ${
                            viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-gray-100'
                        }`}
                    >
                        Grid
                    </button>
                </div>
            </div>

            {/* Selection Panel - Responsive Grid */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Class Select */}
                    <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-500">Class</label>
                        <select
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                            onChange={e => setClassId(e.target.value)}
                            value={classId}
                        >
                            <option value="">Select Class</option>
                            {teacherAssignments.map(a => (
                                <option key={a._id} value={a.classId._id}>
                                    {a.classId.className}-{a.classId.section}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Subject Select */}
                    <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-500">Subject</label>
                        <select
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                            onChange={e => setSubjectId(e.target.value)}
                            value={subjectId}
                            disabled={!classId}
                        >
                            <option value="">Select Subject</option>
                            {teacherAssignments
                                .filter(a => a.classId._id === classId)
                                .map(a => (
                                    <option key={a.subjectId._id} value={a.subjectId._id}>
                                        {a.subjectId.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* New Assignment Button */}
                    <div className="space-y-1 lg:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 opacity-0">Action</label>
                        <button
                            onClick={() => {
                                if (!classId || !subjectId) {
                                    return errorAlert("Required", "Select class and subject first");
                                }
                                resetForm();
                                setShowForm(!showForm);
                            }}
                            className="w-full bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                        >
                            {showForm ? <FaPlus className="rotate-45" /> : <FaPlus />}
                            {showForm ? "Close" : "New Assignment"}
                        </button>
                    </div>

                    {/* View All Button */}
                    <div className="space-y-1 lg:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 opacity-0">Action</label>
                        <button
                            onClick={() => setShowSubmissions(false)}
                            className="w-full bg-gray-600 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <FaEye /> View All
                        </button>
                    </div>

                    {/* Stats Button */}
                    <div className="space-y-1 lg:col-span-1">
                        <label className="block text-xs font-medium text-gray-500 opacity-0">Stats</label>
                        <div className="bg-purple-50 p-2.5 rounded-lg text-center">
                            <span className="text-sm font-medium text-purple-600">
                                {assignments.length} Total
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filters - Only show when class and subject selected */}
                {classId && subjectId && !showSubmissions && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                                filterStatus === 'all' 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            All ({assignments.length})
                        </button>
                        <button
                            onClick={() => setFilterStatus('active')}
                            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                                filterStatus === 'active' 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            Active ({assignments.filter(a => a.dueDate >= new Date().toISOString().split('T')[0]).length})
                        </button>
                        <button
                            onClick={() => setFilterStatus('overdue')}
                            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                                filterStatus === 'overdue' 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            Overdue ({assignments.filter(a => a.dueDate < new Date().toISOString().split('T')[0]).length})
                        </button>
                    </div>
                )}
            </div>

            {/* Search Bar - Assignments View */}
            {classId && subjectId && !showSubmissions && (
                <div className="bg-white p-4 rounded-xl shadow-lg">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search assignments by title or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>
            )}

            {/* Create/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
                        <h2 className="text-lg font-semibold">
                            {editId ? 'Edit Assignment' : 'Create New Assignment'}
                        </h2>
                    </div>
                    
                    <form onSubmit={saveAssignment} className="p-4 md:p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Title Input */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="title"
                                    placeholder="Enter assignment title"
                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Type Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="type"
                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    value={form.type}
                                    onChange={handleChange}
                                >
                                    <option value="assignment">Assignment</option>
                                    <option value="homework">Homework</option>
                                </select>
                            </div>

                            {/* Due Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Due Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    value={form.dueDate}
                                    onChange={handleChange}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            {/* Total Marks (for assignments) */}
                            {form.type === "assignment" && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Total Marks <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="totalMarks"
                                        type="number"
                                        placeholder="Enter total marks"
                                        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        value={form.totalMarks}
                                        onChange={handleChange}
                                        min="1"
                                        required
                                    />
                                </div>
                            )}

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    placeholder="Enter assignment description"
                                    rows="5"
                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    value={form.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? "Saving..." : (editId ? "Update Assignment" : "Create Assignment")}
                            </button>
                            {editId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 bg-gray-500 text-white px-6 py-2.5 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* Assignments List View */}
            {!showSubmissions && classId && subjectId && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Assignments List</h2>
                        <span className="text-sm text-gray-500">
                            {filteredAssignments.length} item{filteredAssignments.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                        </div>
                    ) : filteredAssignments.length > 0 ? (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 text-left">Title</th>
                                            <th className="p-3 text-left">Type</th>
                                            <th className="p-3 text-left">Due Date</th>
                                            <th className="p-3 text-left">Total Marks</th>
                                            <th className="p-3 text-center">Status</th>
                                            <th className="p-3 text-center">Submissions</th>
                                            <th className="p-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAssignments.map(a => {
                                            const status = getDueStatus(a.dueDate);
                                            return (
                                                <tr key={a._id} className="border-t hover:bg-gray-50 transition-colors">
                                                    <td className="p-3 font-medium">{a.title}</td>
                                                    <td className="p-3 capitalize">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            a.type === 'assignment' 
                                                                ? 'bg-purple-100 text-purple-600' 
                                                                : 'bg-blue-100 text-blue-600'
                                                        }`}>
                                                            {a.type}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            <FaCalendarAlt className="text-gray-400" />
                                                            <span>{new Date(a.dueDate).toLocaleDateString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 font-medium">{a.totalMarks || '-'}</td>
                                                    <td className="p-3 text-center">
                                                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs w-fit mx-auto ${status.color}`}>
                                                            {status.icon}
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <button
                                                            onClick={() => fetchSubmissions(a._id)}
                                                            className="text-purple-600 hover:text-purple-800 flex items-center gap-1 mx-auto"
                                                        >
                                                            <FaEye /> View
                                                        </button>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditId(a._id);
                                                                    setForm({
                                                                        title: a.title,
                                                                        description: a.description,
                                                                        dueDate: a.dueDate.split('T')[0],
                                                                        totalMarks: a.totalMarks || "",
                                                                        type: a.type
                                                                    });
                                                                    setShowForm(true);
                                                                }}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <button
                                                                onClick={() => copyAssignment(a)}
                                                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                                title="Copy"
                                                            >
                                                                <FaCopy />
                                                            </button>
                                                            <button
                                                                onClick={() => downloadAssignment(a)}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Download"
                                                            >
                                                                <FaDownload />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteAssignment(a._id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile View */}
                            <div className="md:hidden p-4">
                                <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                                    {filteredAssignments.map(a => {
                                        const status = getDueStatus(a.dueDate);
                                        
                                        if (viewMode === 'grid') {
                                            // Grid View
                                            return (
                                                <div key={a._id} className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            a.type === 'assignment' 
                                                                ? 'bg-purple-100 text-purple-600' 
                                                                : 'bg-blue-100 text-blue-600'
                                                        }`}>
                                                            {a.type}
                                                        </span>
                                                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${status.color}`}>
                                                            {status.icon}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{a.title}</h3>
                                                    <p className="text-xs text-gray-500 mb-2">
                                                        Due: {new Date(a.dueDate).toLocaleDateString()}
                                                    </p>
                                                    {a.totalMarks && (
                                                        <p className="text-xs font-medium text-purple-600 mb-2">
                                                            Marks: {a.totalMarks}
                                                        </p>
                                                    )}
                                                    <div className="flex gap-1 mt-2">
                                                        <button
                                                            onClick={() => fetchSubmissions(a._id)}
                                                            className="flex-1 p-1.5 bg-purple-100 text-purple-600 rounded text-xs hover:bg-purple-200"
                                                        >
                                                            <FaEye className="inline mr-1" /> View
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditId(a._id);
                                                                setForm({
                                                                    title: a.title,
                                                                    description: a.description,
                                                                    dueDate: a.dueDate.split('T')[0],
                                                                    totalMarks: a.totalMarks || "",
                                                                    type: a.type
                                                                });
                                                                setShowForm(true);
                                                            }}
                                                            className="flex-1 p-1.5 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200"
                                                        >
                                                            <FaEdit className="inline mr-1" /> Edit
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            // List View with Expand
                                            return (
                                                <div key={a._id} className="bg-white border rounded-lg overflow-hidden">
                                                    <div 
                                                        className="p-4 flex items-center justify-between cursor-pointer"
                                                        onClick={() => toggleExpand(a._id)}
                                                    >
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                                    a.type === 'assignment' 
                                                                        ? 'bg-purple-100 text-purple-600' 
                                                                        : 'bg-blue-100 text-blue-600'
                                                                }`}>
                                                                    {a.type}
                                                                </span>
                                                                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${status.color}`}>
                                                                    {status.icon}
                                                                    {status.label}
                                                                </span>
                                                            </div>
                                                            <h3 className="font-semibold">{a.title}</h3>
                                                            <p className="text-sm text-gray-500">
                                                                Due: {new Date(a.dueDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        {expandedId === a._id ? <FaChevronUp /> : <FaChevronDown />}
                                                    </div>

                                                    {expandedId === a._id && (
                                                        <div className="p-4 bg-gray-50 border-t space-y-3">
                                                            <p className="text-sm text-gray-700">{a.description}</p>
                                                            {a.totalMarks && (
                                                                <p className="text-sm font-medium text-purple-600">
                                                                    Total Marks: {a.totalMarks}
                                                                </p>
                                                            )}
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => fetchSubmissions(a._id)}
                                                                    className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm hover:bg-purple-700"
                                                                >
                                                                    <FaEye className="inline mr-1" /> Submissions
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditId(a._id);
                                                                        setForm({
                                                                            title: a.title,
                                                                            description: a.description,
                                                                            dueDate: a.dueDate.split('T')[0],
                                                                            totalMarks: a.totalMarks || "",
                                                                            type: a.type
                                                                        });
                                                                        setShowForm(true);
                                                                    }}
                                                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700"
                                                                >
                                                                    <FaEdit className="inline mr-1" /> Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteAssignment(a._id)}
                                                                    className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700"
                                                                >
                                                                    <FaTrash className="inline mr-1" /> Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-8 text-center">
                            <FaBook className="text-5xl text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No assignments found</p>
                            <p className="text-sm text-gray-400 mt-1">
                                {searchTerm ? 'Try adjusting your search' : 'Create your first assignment using the form above'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Submissions View */}
            {showSubmissions && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-lg font-semibold">Student Submissions</h2>
                            <button
                                onClick={() => setShowSubmissions(false)}
                                className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
                            >
                                ← Back to Assignments
                            </button>
                        </div>
                    </div>

                    {/* Submissions Search */}
                    <div className="p-4 border-b">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by student name..."
                                value={submissionSearch}
                                onChange={(e) => setSubmissionSearch(e.target.value)}
                                className="w-full border border-gray-300 p-2 pl-10 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                        </div>
                    ) : filteredSubmissions.length > 0 ? (
                        <>
                            {/* Desktop Submissions Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 text-left">Student</th>
                                            <th className="p-3 text-left">Roll No</th>
                                            <th className="p-3 text-left">Submitted On</th>
                                            <th className="p-3 text-left">Submission</th>
                                            <th className="p-3 text-left">Marks</th>
                                            <th className="p-3 text-center">Status</th>
                                            <th className="p-3 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSubmissions.map(s => (
                                            <tr key={s._id} className="border-t hover:bg-gray-50 transition-colors">
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                            {s.studentId?.name?.charAt(0)}
                                                        </div>
                                                        <span className="font-medium">{s.studentId?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3">{s.studentId?.rollNo || '-'}</td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <FaCalendarAlt className="text-gray-400" />
                                                        <span>{new Date(s.submittedAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(s.submittedAt).toLocaleTimeString()}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <button 
                                                        onClick={() => {
                                                            Swal.fire({
                                                                title: 'Submission',
                                                                text: s.submissionText,
                                                                icon: 'info',
                                                                confirmButtonColor: '#8b5cf6'
                                                            });
                                                        }}
                                                        className="text-purple-600 hover:underline flex items-center gap-1"
                                                    >
                                                        <FaFileAlt /> View
                                                    </button>
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
                                                <td className="p-3 text-center">
                                                    {s.status !== 'checked' && (
                                                        <button
                                                            onClick={() => checkSubmission(s._id, s.marksObtained)}
                                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto text-sm"
                                                        >
                                                            <FaCheck /> Check
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Submissions Cards */}
                            <div className="md:hidden p-4 space-y-3">
                                {filteredSubmissions.map(s => (
                                    <div key={s._id} className="bg-white border rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {s.studentId?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">{s.studentId?.name}</h3>
                                                    <p className="text-xs text-gray-500">Roll: {s.studentId?.rollNo || '-'}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                s.status === 'checked' 
                                                    ? 'bg-green-100 text-green-600' 
                                                    : 'bg-yellow-100 text-yellow-600'
                                            }`}>
                                                {s.status}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm mb-3">
                                            <p className="text-gray-600">
                                                <span className="font-medium">Submitted:</span>{' '}
                                                {new Date(s.submittedAt).toLocaleDateString()} at{' '}
                                                {new Date(s.submittedAt).toLocaleTimeString()}
                                            </p>
                                            <p className="text-gray-600">
                                                <span className="font-medium">Marks:</span>{' '}
                                                {s.marksObtained || '-'} / {s.assignmentId?.totalMarks || '-'}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    Swal.fire({
                                                        title: 'Submission',
                                                        text: s.submissionText,
                                                        icon: 'info',
                                                        confirmButtonColor: '#8b5cf6'
                                                    });
                                                }}
                                                className="flex-1 bg-purple-100 text-purple-600 py-2 rounded-lg text-sm hover:bg-purple-200"
                                            >
                                                <FaFileAlt className="inline mr-1" /> View
                                            </button>
                                            {s.status !== 'checked' && (
                                                <button
                                                    onClick={() => checkSubmission(s._id, s.marksObtained)}
                                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700"
                                                >
                                                    <FaCheck className="inline mr-1" /> Check
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="p-8 text-center">
                            <FaUsers className="text-5xl text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No submissions yet</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Students haven't submitted this assignment
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Summary Stats */}
            {classId && subjectId && assignments.length > 0 && !showSubmissions && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-xl font-bold">{assignments.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                        <p className="text-xs text-gray-500">Assignments</p>
                        <p className="text-xl font-bold text-purple-600">
                            {assignments.filter(a => a.type === 'assignment').length}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                        <p className="text-xs text-gray-500">Homework</p>
                        <p className="text-xl font-bold text-blue-600">
                            {assignments.filter(a => a.type === 'homework').length}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                        <p className="text-xs text-gray-500">Active</p>
                        <p className="text-xl font-bold text-green-600">
                            {assignments.filter(a => a.dueDate >= new Date().toISOString().split('T')[0]).length}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}