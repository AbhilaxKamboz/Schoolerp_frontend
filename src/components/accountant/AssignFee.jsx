import { useEffect, useState } from "react";
import API from "../../api/api";
import { successAlert, errorAlert } from "../../utils/swal";
import { FaSearch, FaUserGraduate, FaMoneyBillWave } from "react-icons/fa";

export default function AssignFee() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [assignedFees, setAssignedFees] = useState(new Set());

  useEffect(() => {
    fetchClasses();
    fetchAssignedFees();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    // Filter students based on search
    const filtered = students.filter(s => 
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo?.toLowerCase().includes(search.toLowerCase()) ||
      s.admissionNo?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [search, students]);

  const fetchClasses = async () => {
    try {
      const res = await API.get("/accountant/classes");
      setClasses(res.data.classes);
    } catch (err) {
      errorAlert("Error", "Failed to load classes");
    }
  };

  const fetchStudents = async (classId) => {
    try {
      setLoading(true);
      const res = await API.get(`/accountant/class/${classId}/students`);
      setStudents(res.data.students);
      setFilteredStudents(res.data.students);
    } catch (err) {
      errorAlert("Error", "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedFees = async () => {
    try {
      const res = await API.get("/accountant/student-fees");
      const assigned = new Set(res.data.fees.map(f => f.studentId._id));
      setAssignedFees(assigned);
    } catch (err) {
      console.error("Failed to fetch assigned fees");
    }
  };

  const assignFee = async (studentId) => {
    try {
      await API.post("/accountant/student-fee/assign", {
        studentId,
        classId: selectedClass
      });
      successAlert("Success", "Fee assigned successfully");
      fetchAssignedFees(); // Refresh assigned fees list
    } catch (err) {
      errorAlert("Error", err.response?.data?.message || "Failed to assign fee");
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">Assign Fee to Students</h1>

      {/* Class Selection */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Class
        </label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full md:w-1/2 border p-2 rounded"
        >
          <option value="">Choose a class</option>
          {classes.map(c => (
            <option key={c._id} value={c._id}>
              {c.className} - {c.section}
            </option>
          ))}
        </select>
      </div>

      {selectedClass && (
        <>
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, roll number or admission number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border p-2 pl-10 rounded"
              />
            </div>
          </div>

          {/* Students List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="text-lg font-semibold">
                Students ({filteredStudents.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              </div>
            ) : filteredStudents.length > 0 ? (
              <div className="divide-y">
                {filteredStudents.map((student) => (
                  <div key={student._id} className="p-4 hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Student Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <FaUserGraduate className="text-gray-400 text-xl" />
                          <div>
                            <h4 className="font-medium">{student.name}</h4>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                              <span>Roll: {student.rollNo || 'N/A'}</span>
                              <span>Admission: {student.admissionNo || 'N/A'}</span>
                              <span>{student.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex justify-end">
                        {assignedFees.has(student._id) ? (
                          <span className="inline-flex items-center gap-2 bg-green-100 text-green-600 px-4 py-2 rounded">
                            <FaMoneyBillWave /> Fee Assigned
                          </span>
                        ) : (
                          <button
                            onClick={() => assignFee(student._id)}
                            className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                          >
                            Assign Fee
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No students found
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}