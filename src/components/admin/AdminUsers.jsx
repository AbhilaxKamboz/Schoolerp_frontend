import { useEffect, useState } from "react";
import API from "../../api/api";
import { successAlert, confirmAlert, errorAlert } from "../../utils/swal";
import Swal from 'sweetalert2';
import { 
  FaUser, FaEnvelope, FaUserTag, FaToggleOn, FaToggleOff,
  FaEdit, FaKey, FaSearch, FaPlus, FaTimes, FaSave,
  FaMale, FaFemale, FaGenderless, FaUserGraduate, FaChalkboardTeacher,
  FaUserCog, FaUserTie, FaIdCard, FaBook, FaChalkboard,
  FaEye, FaTimesCircle, FaCalendar, FaPhone, FaMapMarker,
  FaGraduationCap, FaSchool, FaUserCircle
} from "react-icons/fa";

export default function AdminUsers() {
  /* STATE MANAGEMENT */
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // View User Modal State
  const [viewUser, setViewUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewUserLoading, setViewUserLoading] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Shared form state for create + edit
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "teacher",
    gender: "",
    password: "",
    subject: "",
    assignedClass: "",
    className: "",
    section: "",
    rollNo: "",
    admissionNo: "",
    classId: ""
  });

  /* FETCH USERS */
  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

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
    fetchUsers();
    fetchAvailableClasses();
  }, []);

  // Filter logic 
  const filteredUsers = users.filter((u) => 
    `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(search.toLowerCase())
  );

  /* INPUT HANDLER */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  /* CREATE / UPDATE USER */
  const saveUser = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await API.put(`/admin/user/profile/${editId}`, form);
        successAlert("Updated", "User updated successfully");
      } else {
        await API.post("/admin/user/create", form);
        successAlert("Created", "User created successfully");
      }

      resetForm();
      fetchUsers();
    } catch (err) {
      errorAlert("Error", err.response?.data?.message || "Operation failed");
    }
  };

  /* EDIT USER */
  const editUser = (user) => {
    setEditId(user._id);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender || "",
      password: "",
      subject: user.subject || "",
      assignedClass: user.assignedClass || "",
      className: user.className || "",
      section: user.section || "",
      rollNo: user.rollNo || "",
      admissionNo: user.admissionNo || "",
      classId: ""
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* VIEW USER DETAILS */
  const viewUserDetails = async (userId) => {
    try {
      setViewUserLoading(true);
      const res = await API.get(`/admin/user/${userId}`);
      setViewUser(res.data);
      setShowViewModal(true);
    } catch (err) {
      errorAlert("Error", "Failed to load user details");
    } finally {
      setViewUserLoading(false);
    }
  };

  /* ACTIVATE / DEACTIVATE USER */
  const toggleStatus = async (id, current) => {
    const result = await Swal.fire({
      title: 'Confirm Status Change',
      text: `Do you want to ${current ? 'deactivate' : 'activate'} this user?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: current ? '#ef4444' : '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: current ? 'Yes, deactivate' : 'Yes, activate',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      await API.put(`/admin/user/status/${id}`, {
        isActive: !current
      });
      
      await Swal.fire({
        title: 'Updated!',
        text: `User ${current ? 'deactivated' : 'activated'} successfully`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      fetchUsers();
    } catch (err) {
      errorAlert("Error", "Failed to update status");
    }
  };

  /* CHANGE PASSWORD WITH SWEETALERT */
  const changePassword = async (id) => {
    const { value: formValues } = await Swal.fire({
      title: 'Change Password',
      html: `
        <div class="space-y-4">
          <div class="text-left">
            <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input 
              type="password" 
              id="password" 
              class="swal2-input w-full p-2 border rounded" 
              placeholder="Enter new password"
              minlength="6"
              required
            />
          </div>
          <div class="text-left">
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              class="swal2-input w-full p-2 border rounded" 
              placeholder="Confirm new password"
              minlength="6"
              required
            />
          </div>
          <div class="text-left text-sm text-gray-500">
            <p>Password must be at least 6 characters long</p>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update Password',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!password || password.length < 6) {
          Swal.showValidationMessage('Password must be at least 6 characters');
          return false;
        }
        
        if (password !== confirmPassword) {
          Swal.showValidationMessage('Passwords do not match');
          return false;
        }
        
        return { password };
      }
    });

    if (formValues) {
      try {
        await API.put(`/admin/user/change-password/${id}`, { password: formValues.password });
        
        await Swal.fire({
          title: 'Success!',
          text: 'Password updated successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (err) {
        errorAlert("Error", err.response?.data?.message || "Failed to update password");
      }
    }
  };

  /* RESET FORM */
  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      role: "teacher",
      gender: "",
      password: "",
      subject: "",
      assignedClass: "",
      className: "",
      section: "",
      rollNo: "",
      admissionNo: "",
      classId: ""
    });
    setEditId(null);
    setShowForm(false);
  };

  /* Get role icon */
  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <FaUserCog className="text-purple-600" />;
      case 'teacher': return <FaChalkboardTeacher className="text-blue-600" />;
      case 'student': return <FaUserGraduate className="text-green-600" />;
      case 'accountant': return <FaUserTie className="text-orange-600" />;
      default: return <FaUser className="text-gray-600" />;
    }
  };

  /* Get gender icon */
  const getGenderIcon = (gender) => {
    switch(gender?.toLowerCase()) {
      case 'male': return <FaMale className="text-blue-500" />;
      case 'female': return <FaFemale className="text-pink-500" />;
      default: return <FaGenderless className="text-gray-500" />;
    }
  };

  /* Format date */
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
    // Add top and bottom padding for mobile
    <div className={`space-y-4 md:space-y-6 px-2 sm:px-4 ${isMobile ? 'pt-16 pb-24' : ''}`}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
            User Management
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Manage all users in the system
          </p>
        </div>
        
        {/* Create User Button */}
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
        >
          {showForm ? <FaTimes /> : <FaPlus />}
          {showForm ? "Close Form" : "Create User"}
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* CREATE / EDIT FORM - Responsive */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <h2 className="text-lg md:text-xl font-semibold">
              {editId ? 'Edit User' : 'Create New User'}
            </h2>
          </div>
          
          <form onSubmit={saveUser} className="p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  placeholder="Enter full name"
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={!!editId}
                />
              </div>

              {/* Password Input - Only for new users */}
              {!editId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="password"
                    type="password"
                    placeholder="Enter password"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                  />
                </div>
              )}

              {/* Gender Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={form.gender}
                  onChange={handleChange}
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
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={form.role}
                  onChange={handleChange}
                  disabled={!!editId}
                >
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
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
                    <input
                      name="subject"
                      placeholder="Enter subject"
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={form.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned Class <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="assignedClass"
                      placeholder="e.g., 10-A"
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={form.assignedClass}
                      onChange={handleChange}
                      required
                    />
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
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
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
                      placeholder="Enter roll number"
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={form.rollNo}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admission No <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="admissionNo"
                      placeholder="Enter admission number"
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={form.admissionNo}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaSave /> {editId ? "Update User" : "Save User"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center justify-center gap-2 bg-gray-500 text-white px-6 py-2.5 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <FaTimes /> Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* USERS TABLE - Responsive */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Desktop Table View (hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          {getGenderIcon(u.gender)}
                          <span>{u.gender || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-gray-400" />
                      <span className="text-sm">{u.email}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(u.role)}
                      <span className="capitalize font-medium">{u.role}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      u.isActive 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      {/* View Button */}
                      <button
                        onClick={() => viewUserDetails(u._id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View User Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => editUser(u)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => toggleStatus(u._id, u.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          u.isActive 
                            ? 'text-orange-600 hover:bg-orange-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {u.isActive ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                      <button
                        onClick={() => changePassword(u._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Change Password"
                      >
                        <FaKey />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y">
          {filteredUsers.map((u) => (
            <div key={u._id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-semibold">{u.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {getRoleIcon(u.role)}
                      <span className="capitalize">{u.role}</span>
                      {getGenderIcon(u.gender)}
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  u.isActive 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {u.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <FaEnvelope className="flex-shrink-0" />
                <span className="truncate">{u.email}</span>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button
                  onClick={() => viewUserDetails(u._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-100 text-green-600 px-3 py-2 rounded-lg text-sm hover:bg-green-200 transition-colors"
                >
                  <FaEye /> View
                </button>
                <button
                  onClick={() => editUser(u)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => toggleStatus(u._id, u.isActive)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    u.isActive 
                      ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                >
                  {u.isActive ? <FaToggleOn /> : <FaToggleOff />}
                  {u.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => changePassword(u._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-200 transition-colors"
                >
                  <FaKey /> Password
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <FaUser className="text-5xl mx-auto mb-3 text-gray-400" />
            <p className="text-lg">No users found</p>
            <p className="text-sm">Try adjusting your search</p>
          </div>
        )}
      </div>

      {/* Summary Stats - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-500">Total Users</p>
          <p className="text-xl font-bold">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-xl font-bold text-green-600">
            {users.filter(u => u.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-500">Inactive</p>
          <p className="text-xl font-bold text-red-600">
            {users.filter(u => !u.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-500">Roles</p>
          <p className="text-xl font-bold text-purple-600">
            {new Set(users.map(u => u.role)).size}
          </p>
        </div>
      </div>

      {/* View User Modal */}
      {showViewModal && viewUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-xl sticky top-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <FaUserCircle className="text-3xl" />
                  <div>
                    <h2 className="text-2xl font-bold">User Details</h2>
                    <p className="text-blue-100 text-sm">Complete information about the user</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <FaTimesCircle className="text-2xl" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {viewUserLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
                      <FaUser className="text-blue-500" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500">Full Name</p>
                        <p className="font-medium">{viewUser.user.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email Address</p>
                        <p className="font-medium">{viewUser.user.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Role</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getRoleIcon(viewUser.user.role)}
                          <span className="capitalize font-medium">{viewUser.user.role}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Gender</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getGenderIcon(viewUser.user.gender)}
                          <span className="capitalize">{viewUser.user.gender || 'Not specified'}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date of Birth</p>
                        <p className="font-medium">{formatDate(viewUser.user.Dob)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          viewUser.user.isActive 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {viewUser.user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Role-specific Information */}
                  {viewUser.user.role === 'teacher' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
                        <FaChalkboardTeacher className="text-blue-500" />
                        Teacher Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-500">Subject</p>
                          <p className="font-medium">{viewUser.user.subject || 'Not assigned'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Assigned Class</p>
                          <p className="font-medium">{viewUser.user.assignedClass || 'Not assigned'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {viewUser.user.role === 'student' && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
                          <FaUserGraduate className="text-green-500" />
                          Student Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg">
                          <div>
                            <p className="text-xs text-gray-500">Class</p>
                            <p className="font-medium">
                              {viewUser.classInfo 
                                ? `${viewUser.classInfo.className} - ${viewUser.classInfo.section}`
                                : 'Not assigned'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Roll Number</p>
                            <p className="font-medium">{viewUser.user.rollNo || 'Not assigned'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Admission Number</p>
                            <p className="font-medium">{viewUser.user.admissionNo || 'Not assigned'}</p>
                          </div>
                          {viewUser.classInfo?.classTeacher && (
                            <div>
                              <p className="text-xs text-gray-500">Class Teacher</p>
                              <p className="font-medium">{viewUser.classInfo.classTeacher.name}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {viewUser.user.role === 'accountant' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
                        <FaUserTie className="text-orange-500" />
                        Accountant Information
                      </h3>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">No additional information available</p>
                      </div>
                    </div>
                  )}

                  {/* Account Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
                      <FaIdCard className="text-purple-500" />
                      Account Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-purple-50 p-4 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500">User ID</p>
                        <p className="font-medium text-sm">{viewUser.user._id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Created By</p>
                        <p className="font-medium">{viewUser.user.createdBy?.name || 'System'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Created At</p>
                        <p className="font-medium">{formatDate(viewUser.user.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Last Updated</p>
                        <p className="font-medium">{formatDate(viewUser.user.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}