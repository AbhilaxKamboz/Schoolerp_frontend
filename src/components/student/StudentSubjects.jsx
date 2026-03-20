import { useEffect, useState } from "react";
import API from "../../api/api";
import { errorAlert } from "../../utils/swal";
import { 
  FaBook, FaUserTie, FaEnvelope, 
  FaChalkboardTeacher, FaCode, FaUserGraduate
} from "react-icons/fa";

export default function StudentSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsRes, classRes] = await Promise.all([
        API.get("/student/my-subjects"),
        API.get("/student/my-class")
      ]);
      
      setSubjects(subjectsRes.data.subjects);
      setClassInfo(classRes.data.class);
    } catch (err) {
      errorAlert("Error", "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold">My Subjects & Teachers</h1>

      {/* Class Information */}
      {classInfo && (
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <FaUserGraduate className="text-4xl" />
            <div>
              <h2 className="text-xl font-semibold">
                Class {classInfo.className} - Section {classInfo.section}
              </h2>
              {classInfo.classTeacher && (
                <p className="text-green-100">
                  Class Teacher: {classInfo.classTeacher.name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subjects Grid */}
      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
              {/* Subject Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{item.subjectId.name}</h3>
                  <span className="bg-white text-blue-600 px-2 py-1 rounded text-xs font-bold">
                    {item.subjectId.code}
                  </span>
                </div>
              </div>

              {/* Teacher Information */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaUserTie className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Subject Teacher</p>
                    <p className="font-semibold">{item.teacherId.name}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" />
                    <span>{item.teacherId.email}</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2 text-center">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-xs text-gray-500">Subject Code</p>
                    <p className="font-semibold text-blue-600">{item.subjectId.code}</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-xs text-gray-500">Teacher ID</p>
                    <p className="font-semibold text-green-600">
                      {item.teacherId._id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          <FaBook className="text-5xl mx-auto mb-3 text-gray-400" />
          <p>No subjects assigned yet</p>
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded">
            <p className="text-3xl font-bold text-blue-600">{subjects.length}</p>
            <p className="text-sm text-gray-600">Total Subjects</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded">
            <p className="text-3xl font-bold text-green-600">
              {subjects.filter(s => s.teacherId).length}
            </p>
            <p className="text-sm text-gray-600">Teachers Assigned</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded">
            <p className="text-3xl font-bold text-purple-600">
              {classInfo?.className || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">Current Class</p>
          </div>
        </div>
      </div>
    </div>
  );
}