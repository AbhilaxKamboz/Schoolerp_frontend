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
        </div>
      </div>
    </div>
  );
}