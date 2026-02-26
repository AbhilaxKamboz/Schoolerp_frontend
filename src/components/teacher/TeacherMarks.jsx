import { useEffect, useState } from "react";
import API from "../../api/api";
import { successAlert, errorAlert } from "../../utils/swal";
import {
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes,
  FaSearch, FaCalendarAlt, FaBook, FaUsers,
  FaChevronDown, FaChevronUp, FaDownload, FaEye,
  FaFilter
} from "react-icons/fa";
import Swal from 'sweetalert2';

export default function TeacherMarks() {
  const [assignments, setAssignments] = useState([]);
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");

  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showMarksEntry, setShowMarksEntry] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [editId, setEditId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [viewMode, setViewMode] = useState("list");

  const [form, setForm] = useState({
    testName: "",
    description: "",
    testDate: new Date().toISOString().split('T')[0],
    maxMarks: ""
  });

  const [marksForm, setMarksForm] = useState({
    studentMarks: []
  });

  // Load teacher's assignments
  useEffect(() => {
    fetchAssignments();
  }, []);

  // Filter tests based on search
  useEffect(() => {
    let filtered = [...tests];
    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.testName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredTests(filtered);
  }, [tests, searchTerm]);

  // Filter students based on search
  useEffect(() => {
    if (students.length > 0) {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
        (student.rollNo && student.rollNo.toLowerCase().includes(studentSearchTerm.toLowerCase()))
      );
      setFilteredStudents(filtered);
    }
  }, [students, studentSearchTerm]);

  const fetchAssignments = async () => {
    try {
      const res = await API.get("/teacher/classes-subjects");
      setAssignments(res.data.assignments);
    } catch {
      errorAlert("Error", "Failed to load assignments");
    }
  };

  // Load tests list
  const fetchTests = async () => {
    if (!classId || !subjectId) return;

    try {
      setLoading(true);
      const res = await API.get("/teacher/tests", {
        params: { classId, subjectId }
      });
      setTests(res.data.tests || []);
      setFilteredTests(res.data.tests || []);
    } catch {
      errorAlert("Error", "Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [classId, subjectId]);

  // Load students for marks entry - FIXED VERSION
  const fetchStudents = async () => {
    if (!classId) return [];
    
    try {
      const res = await API.get(`/teacher/class/${classId}/students`);
      // Extract studentId from the response
      const studentList = res.data.students.map(item => item.studentId);
      setStudents(studentList);
      setFilteredStudents(studentList);
      return studentList;
    } catch (error) {
      errorAlert("Error", "Failed to load students");
      return [];
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleMarksChange = (studentId, value) => {
    setMarksForm(prev => ({
      ...prev,
      studentMarks: prev.studentMarks.map(m =>
        m.studentId === studentId ? { ...m, marksObtained: value } : m
      )
    }));
  };

  const handleRemarksChange = (studentId, value) => {
    setMarksForm(prev => ({
      ...prev,
      studentMarks: prev.studentMarks.map(m =>
        m.studentId === studentId ? { ...m, remarks: value } : m
      )
    }));
  };

  const saveTest = async (e) => {
    e.preventDefault();

    if (!classId || !subjectId) {
      return errorAlert("Required", "Please select class and subject");
    }

    if (!form.testName || !form.maxMarks) {
      return errorAlert("Required", "Test name and max marks are required");
    }

    try {
      setLoading(true);
      if (editId) {
        await API.put(`/teacher/test/${editId}`, form);
        successAlert("Updated", "Test updated successfully");
      } else {
        await API.post("/teacher/test/create", {
          classId,
          subjectId,
          ...form
        });
        successAlert("Created", "Test created successfully");
      }

      resetForm();
      fetchTests();
    } catch (err) {
      errorAlert("Error", err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const saveMarks = async () => {
    if (!selectedTest) return;

    // Validate marks
    for (const mark of marksForm.studentMarks) {
      if (mark.marksObtained === "" || mark.marksObtained === null) {
        return errorAlert("Error", "Please enter marks for all students");
      }
      if (mark.marksObtained < 0 || mark.marksObtained > selectedTest.maxMarks) {
        return errorAlert("Error", `Marks should be between 0 and ${selectedTest.maxMarks}`);
      }
    }

    try {
      setLoading(true);
      await API.post("/teacher/marks/save", {
        testId: selectedTest._id,
        marks: marksForm.studentMarks
      });

      successAlert("Success", "Marks saved successfully");
      setShowMarksEntry(false);
      setSelectedTest(null);
    } catch (err) {
      errorAlert("Error", err.response?.data?.message || "Failed to save marks");
    } finally {
      setLoading(false);
    }
  };

  // FIXED: loadTestMarks function
  const loadTestMarks = async (test) => {
    try {
      setLoading(true);
      
      // First fetch students and wait for them
      const studentsData = await fetchStudents();
      
      // Then fetch existing marks
      const marksRes = await API.get(`/teacher/test/${test._id}/marks`);
      
      // Initialize marks form with all students
      const studentMarks = studentsData.map(s => {
        const existing = marksRes.data.marks.find(m => m.studentId?._id === s._id);
        return {
          studentId: s._id,
          marksObtained: existing?.marksObtained || "",
          remarks: existing?.remarks || ""
        };
      });

      setMarksForm({ studentMarks });
      setSelectedTest(test);
      setShowMarksEntry(true);
      setStudentSearchTerm(""); // Reset search when entering marks
    } catch (error) {
      console.error("Error loading marks:", error);
      errorAlert("Error", "Failed to load marks");
    } finally {
      setLoading(false);
    }
  };

  const editTest = (test) => {
    setEditId(test._id);
    setForm({
      testName: test.testName,
      description: test.description || "",
      testDate: test.testDate.split('T')[0],
      maxMarks: test.maxMarks
    });
    setShowForm(true);
  };

  const deleteTest = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Test',
      text: "Are you sure you want to delete this test? All marks will be removed.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it'
    });

    if (!result.isConfirmed) return;

    try {
      await API.delete(`/teacher/test/${id}`);
      successAlert("Deleted", "Test deleted successfully");
      fetchTests();
    } catch {
      errorAlert("Error", "Failed to delete test");
    }
  };

  const resetForm = () => {
    setForm({
      testName: "",
      description: "",
      testDate: new Date().toISOString().split('T')[0],
      maxMarks: ""
    });
    setEditId(null);
    setShowForm(false);
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
            Marks Management
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Create tests and enter student marks
          </p>
        </div>
      </div>

      {/* Selection Panel */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Class Select */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">Class</label>
            <select
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
              onChange={e => setClassId(e.target.value)}
              value={classId}
            >
              <option value="">Select Class</option>
              {assignments.map(a => (
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
              {assignments
                .filter(a => a.classId._id === classId)
                .map(a => (
                  <option key={a.subjectId._id} value={a.subjectId._id}>
                    {a.subjectId.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Create Test Button */}
          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
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
              {showForm ? <FaTimes /> : <FaPlus />}
              {showForm ? "Cancel" : "Create Test"}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar for Tests */}
      {classId && subjectId && !showMarksEntry && (
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      )}

      {/* Create/Edit Test Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
            <h2 className="text-lg font-semibold">
              {editId ? 'Edit Test' : 'Create New Test'}
            </h2>
          </div>

          <form onSubmit={saveTest} className="p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="testName"
                  placeholder="e.g., Unit Test 1, Mid Term Exam"
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                  value={form.testName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Date
                </label>
                <input
                  type="date"
                  name="testDate"
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                  value={form.testDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Marks <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="maxMarks"
                  placeholder="e.g., 100"
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                  value={form.maxMarks}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Additional details about the test..."
                  rows="3"
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : (editId ? "Update Test" : "Create Test")}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-500 text-white px-6 py-2.5 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Marks Entry Form - With Student Search */}
      {showMarksEntry && selectedTest && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-green-600 to-green-800 text-white flex justify-between items-center">
            <h2 className="text-lg font-semibold">Enter Marks: {selectedTest.testName}</h2>
            <button
              onClick={() => {
                setShowMarksEntry(false);
                setSelectedTest(null);
              }}
              className="text-white hover:text-gray-200"
            >
              <FaTimes />
            </button>
          </div>

          <div className="p-4 md:p-6">
            <div className="mb-4 p-4 bg-yellow-50 rounded-lg flex justify-between items-center">
              <p className="text-sm text-yellow-700">
                <span className="font-bold">Max Marks:</span> {selectedTest.maxMarks}
              </p>
              <p className="text-sm text-yellow-700">
                <span className="font-bold">Total Students:</span> {filteredStudents.length}
              </p>
            </div>

            {/* Student Search Bar */}
            <div className="mb-4 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name or roll number..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                className="w-full border border-gray-300 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Roll No</th>
                    <th className="p-3 text-left">Student Name</th>
                    <th className="p-3 text-left">Marks Obtained</th>
                    <th className="p-3 text-left">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => {
                      const mark = marksForm.studentMarks.find(m => m.studentId === student._id);
                      return (
                        <tr key={student._id} className="border-t hover:bg-gray-50">
                          <td className="p-3 font-medium">{student.rollNo || '-'}</td>
                          <td className="p-3 font-medium">{student.name}</td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={mark?.marksObtained || ''}
                              onChange={(e) => handleMarksChange(student._id, e.target.value)}
                              className="w-24 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500"
                              min="0"
                              max={selectedTest.maxMarks}
                              placeholder="Marks"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={mark?.remarks || ''}
                              onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder="Optional remarks"
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-500">
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={saveMarks}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <FaSave /> {loading ? "Saving..." : "Save All Marks"}
              </button>
              <button
                onClick={() => {
                  setShowMarksEntry(false);
                  setSelectedTest(null);
                }}
                className="bg-gray-500 text-white px-6 py-2.5 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tests List */}
      {classId && subjectId && !showMarksEntry && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Tests List</h2>
            <span className="text-sm text-gray-500">
              {filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : filteredTests.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">Test Name</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Max Marks</th>
                      <th className="p-3 text-left">Description</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTests.map(test => (
                      <tr key={test._id} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium">{test.testName}</td>
                        <td className="p-3">
                          {new Date(test.testDate).toLocaleDateString()}
                        </td>
                        <td className="p-3">{test.maxMarks}</td>
                        <td className="p-3 max-w-xs truncate">{test.description || '-'}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => loadTestMarks(test)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Enter Marks"
                            >
                              <FaSave />
                            </button>
                            <button
                              onClick={() => editTest(test)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => deleteTest(test._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden p-4 space-y-3">
                {filteredTests.map(test => (
                  <div key={test._id} className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{test.testName}</h3>
                      <span className="text-sm text-purple-600 font-medium">
                        Max: {test.maxMarks}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Date: {new Date(test.testDate).toLocaleDateString()}
                    </p>
                    {test.description && (
                      <p className="text-xs text-gray-500 mb-3">{test.description}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadTestMarks(test)}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700"
                      >
                        Enter Marks
                      </button>
                      <button
                        onClick={() => editTest(test)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTest(test._id)}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <FaBook className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No tests found</p>
              <p className="text-sm text-gray-400 mt-1">
                Create your first test using the form above
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}