import { useEffect, useState } from "react";
import API from "../../api/api";
import { successAlert, errorAlert } from "../../utils/swal";
import { 
  FaUser, FaEnvelope, FaVenusMars, FaCalendar, 
  FaUserCircle, FaKey, FaTimes,
  FaIdCard, FaClock, FaCheckCircle, FaLock
} from "react-icons/fa";

export default function AccountantProfile() {
  // State for profile data
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Fetch profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Function to fetch accountant profile
  const fetchProfile = async () => {
    try {
      const res = await API.get("/accountant/profile");
      setProfile(res.data.user);
    } catch (err) {
      errorAlert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  // Change password function
  const changePassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return errorAlert("Error", "New passwords do not match");
    }
    
    // Validate password length
    if (passwordData.newPassword.length < 6) {
      return errorAlert("Error", "Password must be at least 6 characters");
    }

    try {
      await API.put("/accountant/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      successAlert("Success", "Password changed successfully");
      setShowPasswordModal(false);
      // Reset password form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      errorAlert("Error", err.response?.data?.message || "Failed to change password");
    }
  };

  // Get password strength indicator
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

  // Show loading spinner while fetching
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-purple-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 md:w-20 md:h-20 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 px-2 sm:px-4">
      {/* Header - No Edit Button */}
      <div>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
          My Profile
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">
          View your profile information
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Profile Header with Cover Photo */}
        <div className="relative h-24 sm:h-32 bg-gradient-to-r from-purple-600 to-purple-800">
          {/* Profile Picture */}
          <div className="relative -bottom-6 left-4 md:left-6">
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-white rounded-full p-1 shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                    {profile?.name?.charAt(0) || 'A'}
                  </span>
                </div>
              </div>
              {/* Camera icon - disabled (just for show) */}
              <div className="absolute bottom-0 right-0 bg-gray-400 text-white p-1.5 rounded-full cursor-not-allowed opacity-50">
                <FaUserCircle className="text-xs sm:text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* View Only Mode - No Edit */}
        <div className="pt-16 sm:pt-20 p-4 md:p-6">
          {/* Name and Role */}
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              {profile?.name || "Accountant"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                Accountant
              </span>
              {profile?.isActive && (
                <span className="flex items-center gap-1 text-green-600 text-xs md:text-sm">
                  <FaCheckCircle /> Active
                </span>
              )}
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-base md:text-lg font-semibold text-gray-700 border-b pb-2">
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <FaEnvelope className="text-purple-500 text-lg mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="font-medium text-sm md:text-base truncate">{profile?.email}</p>
                </div>
              </div>

              {/* Gender */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <FaVenusMars className="text-purple-500 text-lg mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="font-medium text-sm md:text-base capitalize">
                    {profile?.gender || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <FaCalendar className="text-purple-500 text-lg mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="font-medium text-sm md:text-base">
                    {profile?.Dob 
                      ? new Date(profile.Dob).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Accountant ID */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <FaIdCard className="text-purple-500 text-lg mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">Accountant ID</p>
                  <p className="font-medium text-sm md:text-base">
                    {profile?._id?.slice(-8).toUpperCase() || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="mt-6 space-y-4">
            <h3 className="text-base md:text-lg font-semibold text-gray-700 border-b pb-2">
              Account Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Account Created */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <FaClock className="text-purple-500 text-lg mt-1 flex-shrink-0" />
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

              {/* Last Updated */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <FaClock className="text-purple-500 text-lg mt-1 flex-shrink-0" />
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

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="p-4 md:p-6 border-b bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-t-xl">
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
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  placeholder="Enter current password"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  minLength="6"
                  placeholder="Enter new password"
                />
                
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
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  placeholder="Re-enter new password"
                />
              </div>

              {/* Password Requirements */}
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-purple-700 mb-2">Password requirements:</p>
                <ul className="space-y-1 text-xs text-purple-600">
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

              {/* Modal action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
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
                  className="flex-1 bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
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