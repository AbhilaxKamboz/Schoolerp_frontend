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
  const [activityLog, setActivityLog] = useState([]);

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
      { id: 3, action: "Viewed homework details", time: "1 day ago", icon: "📖" }
    ]);
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}