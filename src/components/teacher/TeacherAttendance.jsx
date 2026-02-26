import { useEffect, useState } from "react";
import API from "../../api/api";
import { successAlert, errorAlert } from "../../utils/swal";
import { 
  FaCalendarCheck, FaUsers, FaBook, FaChalkboard,
  FaCheckCircle, FaTimesCircle, FaSave, FaSearch,
  FaFilter, FaDownload, FaEye, FaEdit, FaSync,
  FaChevronLeft, FaChevronRight, FaUserGraduate
} from "react-icons/fa";
import Swal from 'sweetalert2';

export default function TeacherAttendance() {
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState("");
  const [mode, setMode] = useState("mark");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ present: 0, absent: 0, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch teacher's assignments
  useEffect(() => {
    fetchAssignments();
    setDate(new Date().toISOString().split('T')[0]);
  }, []);

  // Filter students based on search
  useEffect(() => {
    if (students.length > 0) {
      const filtered = students.filter(s => 
        s.studentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.rollNo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  // Update summary when records change
  useEffect(() => {
    const present = records.filter(r => r.status === "present").length;
    const absent = records.filter(r => r.status === "absent").length;
    setSummary({ present, absent, total: records.length });
  }, [records]);

  const fetchAssignments = async () => {
    try {
      const res = await API.get("/teacher/assignments");
      setAssignments(res.data.assignments);
    } catch {
      errorAlert("Error", "Failed to load assignments");
    }
  };

  // Fetch students when class changes
  useEffect(() => {
    if (classId) {
      fetchStudents(classId);
    } else {
      setStudents([]);
      setFilteredStudents([]);
      setRecords([]);
    }
  }, [classId]);

  const fetchStudents = async (clsId) => {
    try {
      setLoading(true);
      const res = await API.get(`/teacher/class/${clsId}/students`);
      setStudents(res.data.students);
      setFilteredStudents(res.data.students);
      
      const initial = res.data.students.map(s => ({
        studentId: s.studentId._id,
        status: "present"
      }));
      setRecords(initial);
    } catch {
      errorAlert("Error", "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  // View attendance for selected date
  const fetchAttendance = async () => {
    if (!classId || !subjectId || !date) {
      return errorAlert("Required", "Please select class, subject and date");
    }

    try {
      setLoading(true);
      const formattedDate = new Date(date).toISOString().split("T")[0];
      const res = await API.get("/teacher/attendance", {
        params: {
          classId,
          subjectId,
          date: formattedDate
        }
      });

      if (res.data.attendance.length > 0) {
        const attendanceRecords = res.data.attendance.map(a => ({
          studentId: a.studentId._id,
          status: a.status
        }));
        setRecords(attendanceRecords);
        successAlert("Loaded", "Attendance loaded successfully");
        setMode("view");
      } else {
        const initial = students.map(s => ({
          studentId: s.studentId._id,
          status: "present"
        }));
        setRecords(initial);
        setMode("mark");
      }
    } catch {
      errorAlert("Error", "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = (studentId, status) => {
    setRecords(prev =>
      prev.map(r =>
        r.studentId === studentId ? { ...r, status } : r
      )
    );
  };

  const markAll = (status) => {
    setRecords(prev =>
      prev.map(r => ({ ...r, status }))
    );
  };

  const submitAttendance = async () => {
    if (!classId || !subjectId || !date) {
      return errorAlert("Required", "All fields are required");
    }

    if (records.length === 0) {
      return errorAlert("Error", "No attendance records to save");
    }

    const result = await Swal.fire({
      title: 'Confirm Save',
      text: `Save attendance for ${records.length} students?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, save'
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await API.post("/teacher/attendance/mark", {
        classId,
        subjectId,
        date: new Date(date),
        records
      });

      await Swal.fire({
        title: 'Success!',
        text: 'Attendance saved successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      setMode("view");
    } catch (err) {
      errorAlert("Error", err.response?.data?.message || "Failed to save attendance");
    } finally {
      setLoading(false);
    }
  };

  const downloadAttendance = () => {
    const csvContent = [
      ['Student Name', 'Roll No', 'Status'].join(','),
      ...filteredStudents.map(s => {
        const record = records.find(r => r.studentId === s.studentId._id);
        return [
          s.studentId.name,
          s.studentId.rollNo || 'N/A',
          record?.status || 'N/A'
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${classId}-${date}.csv`;
    a.click();
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
            Attendance Management
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Mark and manage student attendance
          </p>
        </div>
      </div>

      {/* Selection Panel - Responsive Grid */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Class Select */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">Class</label>
            <select 
              onChange={e => setClassId(e.target.value)} 
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500"
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
              onChange={e => setSubjectId(e.target.value)} 
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500"
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

          {/* Date Input */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">Date</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500" 
              onChange={e => setDate(e.target.value)}
              value={date}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500 opacity-0">Action</label>
            <button 
              onClick={fetchAttendance} 
              className="w-full bg-gray-600 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              disabled={!classId || !subjectId || !date || loading}
            >
              <FaEye /> View
            </button>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500 opacity-0">Action</label>
            <button 
              onClick={() => {
                setMode("mark");
                const initial = students.map(s => ({
                  studentId: s.studentId._id,
                  status: "present"
                }));
                setRecords(initial);
              }} 
              className="w-full bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              disabled={!classId || !subjectId}
            >
              <FaEdit /> New
            </button>
          </div>
        </div>

        {/* Quick Actions for selected class */}
        {classId && subjectId && students.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3 border-t">
            <button
              onClick={() => markAll("present")}
              className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors text-sm flex items-center gap-2"
            >
              <FaCheckCircle /> Mark All Present
            </button>
            <button
              onClick={() => markAll("absent")}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center gap-2"
            >
              <FaTimesCircle /> Mark All Absent
            </button>
            <button
              onClick={downloadAttendance}
              className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center gap-2"
            >
              <FaDownload /> Download CSV
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {students.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4">
            <p className="text-sm opacity-90">Total Students</p>
            <p className="text-2xl font-bold">{summary.total}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4">
            <p className="text-sm opacity-90">Present</p>
            <p className="text-2xl font-bold">{summary.present}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-4">
            <p className="text-sm opacity-90">Absent</p>
            <p className="text-2xl font-bold">{summary.absent}</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {students.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      )}

      {/* Attendance Table - Desktop */}
      {students.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Mobile View - Cards */}
          <div className="block md:hidden divide-y">
            {currentItems.map(s => {
              const record = records.find(r => r.studentId === s.studentId._id);
              return (
                <div key={s.studentId._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                        {s.studentId.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium">{s.studentId.name}</h3>
                        <p className="text-xs text-gray-500">Roll: {s.studentId.rollNo || '-'}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      record?.status === 'present' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {record?.status || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => changeStatus(s.studentId._id, "present")}
                      disabled={mode === "view"}
                      className={`flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-1 ${
                        record?.status === 'present'
                          ? 'bg-green-600 text-white'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                    >
                      <FaCheckCircle /> Present
                    </button>
                    <button
                      onClick={() => changeStatus(s.studentId._id, "absent")}
                      disabled={mode === "view"}
                      className={`flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-1 ${
                        record?.status === 'absent'
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      <FaTimesCircle /> Absent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Student Name</th>
                  <th className="p-3 text-left">Roll No</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(s => {
                  const record = records.find(r => r.studentId === s.studentId._id);
                  return (
                    <tr key={s.studentId._id} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {s.studentId.name.charAt(0)}
                          </div>
                          <span className="font-medium">{s.studentId.name}</span>
                        </div>
                      </td>
                      <td className="p-3">{s.studentId.rollNo || "-"}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-4">
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`att-${s.studentId._id}`}
                              checked={record?.status === "present"}
                              onChange={() => changeStatus(s.studentId._id, "present")}
                              className="w-4 h-4 text-green-600"
                              disabled={mode === "view"}
                            />
                            <span className={`text-sm ${record?.status === 'present' ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                              Present
                            </span>
                          </label>
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`att-${s.studentId._id}`}
                              checked={record?.status === "absent"}
                              onChange={() => changeStatus(s.studentId._id, "absent")}
                              className="w-4 h-4 text-red-600"
                              disabled={mode === "view"}
                            />
                            <span className={`text-sm ${record?.status === 'absent' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                              Absent
                            </span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredStudents.length > itemsPerPage && (
            <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} students
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronLeft />
                </button>
                <span className="px-4 py-2 bg-green-600 text-white rounded-lg">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}

          {/* Save Button */}
          {mode !== "view" && (
            <div className="p-4 bg-gray-50 border-t">
              <button
                onClick={submitAttendance}
                disabled={loading}
                className="w-full sm:w-auto bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mx-auto text-lg font-medium"
              >
                <FaSave /> {loading ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* No Students Message */}
      {classId && students.length === 0 && !loading && (
        <div className="bg-yellow-50 rounded-xl p-8 text-center">
          <FaUsers className="text-5xl text-yellow-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-yellow-700 mb-2">No Students Found</h3>
          <p className="text-yellow-600">No students are assigned to this class yet.</p>
        </div>
      )}
    </div>
  );
}