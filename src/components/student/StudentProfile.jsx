import { useEffect, useState } from "react";
import API from "../../api/api";
import { successAlert, errorAlert } from "../../utils/swal";
import { 
  FaUser, FaEnvelope, FaVenusMars, FaCalendar, 
  FaUserGraduate, FaIdCard, FaBook, FaChalkboard,
  FaKey, FaCamera, FaCheckCircle, FaClock, 
  FaGraduationCap, FaShieldAlt, FaEye, FaEyeSlash, 
  FaArrowLeft, FaChartLine, FaBell, FaAward,
  FaLock
} from "react-icons/fa";
import Swal from 'sweetalert2';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchProfile();
    fetchActivityLog();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/student/profile");
      setProfile(res.data.user);
      setClassInfo(res.data.classInfo);
    } catch (err) {
      errorAlert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLog = async () => {
    // Mock data - replace with actual API call
    setActivityLog([
      { id: 1, action: "Submitted Mathematics assignment", time: "2 hours ago", icon: "📚" },
      { id: 2, action: "Marked present in Physics class", time: "5 hours ago", icon: "✅" },
      { id: 3, action: "Viewed homework details", time: "1 day ago", icon: "📖" },
      { id: 4, action: "Changed password", time: "2 days ago", icon: "🔑" }
    ]);
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const changePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return errorAlert("Error", "New passwords do not match");
    }
    
    if (passwordData.newPassword.length < 6) {
      return errorAlert("Error", "Password must be at least 6 characters");
    }

    try {
      await API.put("/student/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      await Swal.fire({
        title: 'Success!',
        text: 'Password changed successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      errorAlert("Error", err.response?.data?.message || "Failed to change password");
    }
  };

  const getInitials = (name) => {
    if (!name) return "S";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: 'Not entered' };
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;

    if (strength <= 25) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 50) return { strength, label: 'Fair', color: 'bg-orange-500' };
    if (strength <= 75) return { strength, label: 'Good', color: 'bg-yellow-500' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
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
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4 max-w-6xl mx-auto">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
          My Profile
        </h1>
      </div>

      {/* Main Content Grid */}
      <div className="cols-3 gap-4 md:gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Cover Photo with Profile Info */}
            <div className="relative h-32 sm:h-40 bg-gradient-to-r from-green-600 to-green-800">
              {/* Profile Picture */}
              <div className="relative -bottom-12 left-4 md:left-6">
                <div className="relative group">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-white rounded-full p-1 shadow-xl">
                    <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                        {getInitials(profile?.name)}
                      </span>
                    </div>
                  </div>
                  {/* Camera icon - disabled (just for show) */}
                  <div className="absolute bottom-0 right-0 bg-gray-400 text-white p-2 rounded-full cursor-not-allowed opacity-50">
                    <FaCamera className="text-sm" />
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                <FaCheckCircle /> Active
              </div>
            </div>

            {/* View Only Mode - No Edit Button */}
            <div className="pt-16 sm:pt-20 p-4 md:p-6">
              {/* Name and Role */}
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  {profile?.name || "Student"}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                    Student
                  </span>
                  <span className="text-sm text-gray-500">
                    ID: {profile?._id?.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-700 border-b pb-2">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {/* Email */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <FaEnvelope className="text-green-500 text-lg mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-sm md:text-base truncate">{profile?.email}</p>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <FaVenusMars className="text-green-500 text-lg mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500">Gender</p>
                      <p className="font-medium text-sm md:text-base capitalize">
                        {profile?.gender || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <FaCalendar className="text-green-500 text-lg mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="font-medium text-sm md:text-base">
                        {formatDate(profile?.Dob)}
                      </p>
                    </div>
                  </div>

                  {/* Admission Number */}
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <FaIdCard className="text-green-500 text-lg mt-1 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500">Admission No</p>
                      <p className="font-medium text-sm md:text-base">
                        {profile?.admissionNo || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              {classInfo && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-700 border-b pb-2">
                    Academic Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {/* Class */}
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <FaChalkboard className="text-blue-500 text-lg mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Class</p>
                        <p className="font-medium text-sm md:text-base">
                          {classInfo.className} - {classInfo.section}
                        </p>
                      </div>
                    </div>

                    {/* Roll Number */}
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <FaBook className="text-purple-500 text-lg mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Roll Number</p>
                        <p className="font-medium text-sm md:text-base">
                          {profile?.rollNo || 'Not assigned'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Information */}
              <div className="mt-6 space-y-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-700 border-b pb-2">
                  Account Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <FaClock className="text-gray-500 text-lg mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Member Since</p>
                      <p className="font-medium text-sm md:text-base">
                        {new Date(profile?.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <FaClock className="text-gray-500 text-lg mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="font-medium text-sm md:text-base">
                        {new Date(profile?.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Only Password Change */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors text-sm md:text-base"
                >
                  <FaKey /> Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-4 md:p-6 border-b bg-gradient-to-r from-green-600 to-green-800 text-white rounded-t-xl">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FaKey /> Change Password
              </h3>
            </div>

            {/* Modal Body */}
            <form onSubmit={changePassword} className="p-4 md:p-6 space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 p-2.5 pr-10 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 p-2.5 pr-10 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                    minLength="6"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {passwordData.newPassword && (
                  <div className="mt-2">
                    <div className="flex gap-1 h-1 mb-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 h-full rounded ${
                            getPasswordStrength(passwordData.newPassword).strength >= i * 25
                              ? getPasswordStrength(passwordData.newPassword).color
                              : 'bg-gray-200'
                          }`}
                        ></div>
                      ))}
                    </div>
                    <p className={`text-xs ${
                      getPasswordStrength(passwordData.newPassword).strength <= 25 ? 'text-red-500' :
                      getPasswordStrength(passwordData.newPassword).strength <= 50 ? 'text-orange-500' :
                      getPasswordStrength(passwordData.newPassword).strength <= 75 ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      Password strength: {getPasswordStrength(passwordData.newPassword).label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full border border-gray-300 p-2.5 pr-10 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-green-700 mb-2">Password requirements:</p>
                <ul className="space-y-1 text-xs text-green-600">
                  <li className="flex items-center gap-1">
                    <FaCheckCircle className={`text-xs ${passwordData.newPassword.length >= 6 ? 'text-green-500' : 'text-gray-400'}`} />
                    At least 6 characters
                  </li>
                  <li className="flex items-center gap-1">
                    <FaCheckCircle className={`text-xs ${/[A-Z]/.test(passwordData.newPassword) ? 'text-green-500' : 'text-gray-400'}`} />
                    One uppercase letter
                  </li>
                  <li className="flex items-center gap-1">
                    <FaCheckCircle className={`text-xs ${/[0-9]/.test(passwordData.newPassword) ? 'text-green-500' : 'text-gray-400'}`} />
                    One number
                  </li>
                </ul>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: ""
                    });
                  }}
                  className="flex-1 bg-gray-500 text-white px-4 py-2.5 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}