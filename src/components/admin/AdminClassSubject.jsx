import { useEffect, useState } from "react";
import API from "../../api/api";
import { successAlert, errorAlert, confirmAlert } from "../../utils/swal";
import { 
  FaChalkboard, FaBook, FaUserTie, FaUserGraduate,
  FaPlus, FaSearch, FaFilter, FaTimes, FaCheck,
  FaArrowRight, FaUsers, FaGraduationCap, FaLink,
  FaUnlink, FaEye, FaChevronDown, FaChevronUp,
  FaEdit, FaTrash, FaSave, FaExchangeAlt
} from "react-icons/fa";
import Swal from 'sweetalert2';

export default function AdminClassSubject() {
    /* STATES */
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    
    const [classId, setClassId] = useState("");
    const [subjectId, setSubjectId] = useState("");
    const [teacherId, setTeacherId] = useState("");
    const [studentId, setStudentId] = useState("");
    
    const [assigned, setAssigned] = useState([]);
    const [assignedStudents, setAssignedStudents] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('subjects'); // 'subjects' or 'students'
    const [searchSubject, setSearchSubject] = useState("");
    const [searchStudent, setSearchStudent] = useState("");
    const [expandedSection, setExpandedSection] = useState('all');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null); // For teacher change

    /* INITIAL DATA LOAD */
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchClasses(),
                fetchSubjects(),
                fetchTeachers(),
                fetchStudents()
            ]);
        } catch (error) {
            errorAlert("Error", "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    /* FETCH METHODS */
    const fetchClasses = async () => {
        const res = await API.get("/admin/classes");
        setClasses(res.data.classes);
    };

    const fetchSubjects = async () => {
        const res = await API.get("/admin/subjects");
        setSubjects(res.data.subjects);
    };

    const fetchTeachers = async () => {
        const res = await API.get("/admin/teachers"); // Use the new endpoint
        setTeachers(res.data.teachers);
    };

    const fetchAssignedSubjects = async (clsId) => {
        if (!clsId) return;
        const res = await API.get(`/admin/class/${clsId}/subjects`);
        setAssigned(res.data.subjects);
    };

    const fetchStudents = async () => {
        const res = await API.get("/admin/users?role=student&isActive=true");
        setStudents(res.data.users);
    };

    const fetchAssignedStudents = async (clsId) => {
        if (!clsId) return;
        const res = await API.get(`/admin/class/${clsId}/students`);
        setAssignedStudents(res.data.students);
    };

    /* HANDLE CLASS CHANGE */
    const handleClassChange = async (e) => {
        const newClassId = e.target.value;
        setClassId(newClassId);
        if (newClassId) {
            await Promise.all([
                fetchAssignedSubjects(newClassId),
                fetchAssignedStudents(newClassId)
            ]);
        } else {
            setAssigned([]);
            setAssignedStudents([]);
        }
    };

    /* ASSIGN SUBJECT */
    const assignSubject = async (e) => {
        e.preventDefault();

        if (!classId || !subjectId || !teacherId) {
            return errorAlert("Required", "All fields are mandatory");
        }

        try {
            await API.post("/admin/class-subject/assign", {
                classId,
                subjectId,
                teacherId
            });

            await Swal.fire({
                title: 'Success!',
                text: 'Subject assigned successfully',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            setSubjectId("");
            setTeacherId("");
            fetchAssignedSubjects(classId);

        } catch (err) {
            errorAlert("Error", err.response?.data?.message || "Assignment failed");
        }
    };

    /* UPDATE TEACHER FOR ASSIGNMENT */
    const updateTeacher = async () => {
        if (!editingAssignment || !editingAssignment.newTeacherId) {
            return errorAlert("Required", "Please select a teacher");
        }

        try {
            await API.put(`/admin/class-subject/${editingAssignment.id}`, {
                teacherId: editingAssignment.newTeacherId
            });

            await Swal.fire({
                title: 'Success!',
                text: 'Teacher updated successfully',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            setEditingAssignment(null);
            fetchAssignedSubjects(classId);

        } catch (err) {
            errorAlert("Error", err.response?.data?.message || "Failed to update teacher");
        }
    };

    /* DELETE ASSIGNMENT (when teacher leaves) */
    const deleteAssignment = async (assignmentId, subjectName) => {
        const result = await Swal.fire({
            title: 'Remove Assignment',
            html: `<p>Are you sure you want to remove <strong>${subjectName}</strong> from this class?</p>
                   <p class="text-sm text-gray-500 mt-2">This will unassign the subject and teacher.</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, remove',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) return;

        try {
            await API.delete(`/admin/class-subject/${assignmentId}`);

            await Swal.fire({
                title: 'Removed!',
                text: 'Assignment removed successfully',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            fetchAssignedSubjects(classId);

        } catch (err) {
            errorAlert("Error", err.response?.data?.message || "Failed to remove assignment");
        }
    };

    /* ASSIGN STUDENT */
    const assignStudent = async (e) => {
        e.preventDefault();

        if (!classId || !studentId) {
            return errorAlert("Required", "Class & student are required");
        }

        try {
            await API.post("/admin/class-student/assign", {
                classId,
                studentId
            });

            await Swal.fire({
                title: 'Success!',
                text: 'Student assigned successfully',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            setStudentId("");
            fetchAssignedStudents(classId);

        } catch (err) {
            errorAlert("Error", err.response?.data?.message || "Student mapping failed");
        }
    };

    /* FILTER SUBJECTS */
    const filteredSubjects = subjects.filter(s => 
        s.name.toLowerCase().includes(searchSubject.toLowerCase()) ||
        s.code?.toLowerCase().includes(searchSubject.toLowerCase())
    );

    /* FILTER STUDENTS */
    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
        s.email.toLowerCase().includes(searchStudent.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 md:w-20 md:h-20 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
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
                        Class Management
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1">
                        Assign subjects and students to classes
                    </p>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="sm:hidden w-full bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                    {mobileMenuOpen ? <FaTimes /> : <FaLink />}
                    {mobileMenuOpen ? "Close Menu" : "Quick Actions"}
                </button>
            </div>

            {/* Class Selection Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 md:p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <FaChalkboard className="text-2xl" />
                        <h2 className="text-lg font-semibold">Select Class</h2>
                    </div>
                    <select
                        className="flex-1 border-none bg-white text-gray-800 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400"
                        value={classId}
                        onChange={handleClassChange}
                    >
                        <option value="">Choose a class...</option>
                        {classes.map((c) => (
                            <option key={c._id} value={c._id}>
                                {c.className} - {c.section} {c.classTeacher ? `(Teacher: ${c.classTeacher.name})` : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {classId ? (
                <>
                    {/* Mobile Tab Navigation */}
                    <div className="sm:hidden flex border-b">
                        <button
                            onClick={() => setActiveTab('subjects')}
                            className={`flex-1 py-3 text-center font-medium ${
                                activeTab === 'subjects' 
                                    ? 'text-blue-600 border-b-2 border-blue-600' 
                                    : 'text-gray-500'
                            }`}
                        >
                            <FaBook className="inline mr-2" />
                            Subjects
                        </button>
                        <button
                            onClick={() => setActiveTab('students')}
                            className={`flex-1 py-3 text-center font-medium ${
                                activeTab === 'students' 
                                    ? 'text-blue-600 border-b-2 border-blue-600' 
                                    : 'text-gray-500'
                            }`}
                        >
                            <FaUsers className="inline mr-2" />
                            Students
                        </button>
                    </div>

                    {/* Mobile Quick Actions Menu */}
                    {mobileMenuOpen && (
                        <div className="sm:hidden bg-white rounded-xl shadow-lg p-4 space-y-2">
                            <button
                                onClick={() => {
                                    setExpandedSection(expandedSection === 'subjects' ? 'all' : 'subjects');
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-3"
                            >
                                <FaBook className="text-blue-600" />
                                <span>Assign Subject</span>
                            </button>
                            <button
                                onClick={() => {
                                    setExpandedSection(expandedSection === 'students' ? 'all' : 'students');
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg flex items-center gap-3"
                            >
                                <FaUsers className="text-green-600" />
                                <span>Assign Student</span>
                            </button>
                        </div>
                    )}

                    {/* Teacher Edit Modal */}
                    {editingAssignment && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl max-w-md w-full">
                                <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-xl">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <FaExchangeAlt /> Change Teacher
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm text-gray-600 mb-4">
                                        <span className="font-medium">Subject:</span> {editingAssignment.subjectName}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-4">
                                        <span className="font-medium">Current Teacher:</span> {editingAssignment.currentTeacher}
                                    </p>
                                    
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select New Teacher
                                    </label>
                                    <select
                                        value={editingAssignment.newTeacherId || ''}
                                        onChange={(e) => setEditingAssignment({
                                            ...editingAssignment,
                                            newTeacherId: e.target.value
                                        })}
                                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 mb-6"
                                    >
                                        <option value="">Choose a teacher...</option>
                                        {teachers.map((t) => (
                                            <option key={t._id} value={t._id}>
                                                {t.name} - {t.subject || 'No subject'}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={updateTeacher}
                                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                        >
                                            Update Teacher
                                        </button>
                                        <button
                                            onClick={() => setEditingAssignment(null)}
                                            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Subject Assignment Section */}
                    {(activeTab === 'subjects' || window.innerWidth >= 640) && (
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div 
                                className="p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white flex justify-between items-center cursor-pointer sm:cursor-default"
                                onClick={() => window.innerWidth < 640 && setExpandedSection(
                                    expandedSection === 'subjects' ? 'all' : 'subjects'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <FaBook className="text-xl" />
                                    <h2 className="text-lg font-semibold">Subject-Teacher Assignment</h2>
                                </div>
                                <button className="sm:hidden">
                                    {expandedSection === 'subjects' ? <FaChevronUp /> : <FaChevronDown />}
                                </button>
                            </div>

                            {(expandedSection === 'subjects' || expandedSection === 'all' || window.innerWidth >= 640) && (
                                <div className="p-4 md:p-6 space-y-4">
                                    {/* Assignment Form */}
                                    <form onSubmit={assignSubject} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {/* Subject Search and Select */}
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Select Subject
                                                </label>
                                                <div className="relative">
                                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search subjects..."
                                                        value={searchSubject}
                                                        onChange={(e) => setSearchSubject(e.target.value)}
                                                        className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <select
                                                    value={subjectId}
                                                    onChange={(e) => setSubjectId(e.target.value)}
                                                    className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    size="3"
                                                >
                                                    <option value="">Select a subject</option>
                                                    {filteredSubjects.map((s) => (
                                                        <option key={s._id} value={s._id}>
                                                            {s.name} ({s.code})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Teacher Select */}
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Select Teacher
                                                </label>
                                                <select
                                                    value={teacherId}
                                                    onChange={(e) => setTeacherId(e.target.value)}
                                                    className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    size="3"
                                                >
                                                    <option value="">Select a teacher</option>
                                                    {teachers.map((t) => (
                                                        <option key={t._id} value={t._id}>
                                                            {t.name} - {t.subject || 'No subject'}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Assign Button */}
                                            <div className="flex items-end">
                                                <button
                                                    type="submit"
                                                    className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <FaLink /> Assign Subject
                                                </button>
                                            </div>
                                        </div>
                                    </form>

                                    {/* Assigned Subjects List with Actions */}
                                    {assigned.length > 0 && (
                                        <div className="mt-6">
                                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                                <FaBook className="text-blue-600" />
                                                Assigned Subjects ({assigned.length})
                                            </h3>
                                            <div className="grid grid-cols-1 gap-3">
                                                {assigned.map((a) => (
                                                    <div key={a._id} className="bg-gray-50 p-4 rounded-lg">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                            <div>
                                                                <p className="font-medium text-lg">{a.subjectId.name}</p>
                                                                <p className="text-sm text-gray-600">
                                                                    Teacher: <span className="font-medium">{a.teacherId.name}</span>
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    Subject Code: {a.subjectId.code}
                                                                </p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => setEditingAssignment({
                                                                        id: a._id,
                                                                        subjectName: a.subjectId.name,
                                                                        currentTeacher: a.teacherId.name,
                                                                        newTeacherId: ''
                                                                    })}
                                                                    className="flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                                                                    title="Change Teacher"
                                                                >
                                                                    <FaExchangeAlt /> Change Teacher
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteAssignment(a._id, a.subjectId.name)}
                                                                    className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                                                                    title="Remove Assignment"
                                                                >
                                                                    <FaTrash /> Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Student Assignment Section (unchanged) */}
                    {(activeTab === 'students' || window.innerWidth >= 640) && (
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {/* ... keep existing student assignment code ... */}
                        </div>
                    )}
                </>
            ) : (
                /* No Class Selected State */
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <FaChalkboard className="text-6xl mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Class Selected</h3>
                    <p className="text-gray-500">Please select a class to manage subject and student assignments</p>
                </div>
            )}

            {/* Summary Cards */}
            {classId && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                        <p className="text-xs text-gray-500">Subjects</p>
                        <p className="text-xl font-bold text-blue-600">{assigned.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                        <p className="text-xs text-gray-500">Students</p>
                        <p className="text-xl font-bold text-green-600">{assignedStudents.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                        <p className="text-xs text-gray-500">Teachers</p>
                        <p className="text-xl font-bold text-purple-600">
                            {new Set(assigned.map(a => a.teacherId?._id)).size}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                        <p className="text-xs text-gray-500">Available</p>
                        <p className="text-xl font-bold text-orange-600">
                            {subjects.length - assigned.length}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}