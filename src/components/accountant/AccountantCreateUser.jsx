import { useEffect, useState } from "react";
import API from "../../api/api";
import { successAlert, errorAlert } from "../../utils/swal";
import Swal from 'sweetalert2';
import { 
  FaUser, FaEnvelope, FaLock, FaSave, FaTimes,
  FaMale, FaFemale, FaGenderless, FaUserGraduate, FaChalkboardTeacher,
  FaUserCog, FaUserTie, FaBook, FaChalkboard, FaUserPlus
} from "react-icons/fa";

export default function AccountantCreateUser() {
  /* STATE MANAGEMENT */
  const [loading, setLoading] = useState(false);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "student", // Default to student for accountant
    gender: "",
    password: "",
    subject: "",
    assignedClass: "",
    rollNo: "",
    admissionNo: "",
    classId: ""
  });

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fetch available classes
  const fetchAvailableClasses = async () => {
    try {
      const res = await API.get("/admin/available-classes");
      setAvailableClasses(res.data.classes);
    } catch (error) {
      console.error("Failed to fetch classes");
    }
  };

  useEffect(() => {
    fetchAvailableClasses();
  }, []);

  /* INPUT HANDLER */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  /* CREATE USER */
  const createUser = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.name || !form.email || !form.password || !form.role) {
      return errorAlert("Required", "Please fill all required fields");
    }

    if (form.password.length < 6) {
      return errorAlert("Error", "Password must be at least 6 characters");
    }

    // Role-specific validation
    if (form.role === "student") {
      if (!form.classId || !form.rollNo || !form.admissionNo) {
        return errorAlert("Required", "Class, roll number and admission number are required for student");
      }
    }

    try {
      setLoading(true);
      await API.post("/admin/user/create", form);
      
      await Swal.fire({
        title: 'Success!',
        text: 'User created successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      // Reset form
      setForm({
        name: "",
        email: "",
        role: "student",
        gender: "",
        password: "",
        subject: "",
        assignedClass: "",
        rollNo: "",
        admissionNo: "",
        classId: ""
      });

    } catch (err) {
      errorAlert("Error", err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  /* RESET FORM */
  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      role: "student",
      gender: "",
      password: "",
      subject: "",
      assignedClass: "",
      rollNo: "",
      admissionNo: "",
      classId: ""
    });
  };

  /* Get gender icon */
  const getGenderIcon = (gender) => {
    switch(gender?.toLowerCase()) {
      case 'male': return <FaMale className="text-blue-500" />;
      case 'female': return <FaFemale className="text-pink-500" />;
      default: return <FaGenderless className="text-gray-500" />;
    }
  };

  return (
    <div className={`space-y-4 md:space-y-6 px-2 sm:px-4 ${isMobile ? 'pt-16 pb-24' : ''}`}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
            Create New User
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Add new students, teachers or staff members
          </p>
        </div>
      </div>
      
      {/* Create User Form */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
          <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
            <FaUserPlus /> User Registration Form
          </h2>
        </div>
        
        <form onSubmit={createUser} className="p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  minLength="6"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            {/* Gender Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Role Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="accountant">Accountant</option>
              </select>
            </div>

            {/* Teacher Fields */}
            {form.role === "teacher" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaBook className="text-gray-400" />
                    </div>
                    <input
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="e.g., Mathematics"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required={form.role === "teacher"}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned Class <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaChalkboard className="text-gray-400" />
                    </div>
                    <input
                      name="assignedClass"
                      value={form.assignedClass}
                      onChange={handleChange}
                      placeholder="e.g., 10-A"
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required={form.role === "teacher"}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Student Fields */}
            {form.role === "student" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="classId"
                    value={form.classId}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required={form.role === "student"}
                  >
                    <option value="">Select Class</option>
                    {availableClasses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.className} - {c.section}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Roll No <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="rollNo"
                    value={form.rollNo}
                    onChange={handleChange}
                    placeholder="Enter roll number"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required={form.role === "student"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admission No <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="admissionNo"
                    value={form.admissionNo}
                    onChange={handleChange}
                    placeholder="Enter admission number"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required={form.role === "student"}
                  />
                </div>
              </>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FaSave /> {loading ? "Creating..." : "Create User"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 bg-gray-500 text-white px-6 py-2.5 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <FaTimes /> Reset Form
            </button>
          </div>
        </form>
      </div>

      {/* Quick Tips */}
      <div className="bg-purple-50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-purple-800 mb-2">Quick Tips:</h3>
        <ul className="text-xs text-purple-600 space-y-1">
          <li>• Students need class, roll number and admission number</li>
          <li>• Teachers need subject and assigned class</li>
          <li>• Password must be at least 6 characters long</li>
          <li>• Email must be unique for each user</li>
        </ul>
      </div>
    </div>
  );
}