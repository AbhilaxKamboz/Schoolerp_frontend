import { useEffect, useState } from "react";
import API from "../../api/api";
import { successAlert, errorAlert } from "../../utils/swal";
import { 
  FaUser, FaEnvelope, FaVenusMars, FaCalendar, 
  FaBook, FaChalkboard, FaEdit, FaSave, 
  FaTimes, FaCamera, FaCheckCircle, FaIdCard,
  FaClock, FaGraduationCap, FaChartLine, FaBell,
  FaShieldAlt, FaUserTie
} from "react-icons/fa";
import Swal from 'sweetalert2';

export default function TeacherProfile() {
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({
        name: "",
        gender: "",
        Dob: "",
        subject: "",
        assignedClass: "",
        qualification: "",      
        joiningDate: ""     
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await API.get("/teacher/profile");
            setProfile(res.data.user);
            setForm({
                name: res.data.user.name,
                gender: res.data.user.gender || "",
                Dob: res.data.user.Dob ? res.data.user.Dob.split('T')[0] : "",
                subject: res.data.user.subject || "",
                assignedClass: res.data.user.assignedClass || "",
                qualification: res.data.user.qualification || "",
                joiningDate: res.data.user.joiningDate ? res.data.user.joiningDate.split('T')[0] : ""
            });
        } catch {
            errorAlert("Error", "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            await API.put("/teacher/profile", form);
            
            await Swal.fire({
                title: 'Success!',
                text: 'Profile updated successfully',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            
            setEditMode(false);
            fetchProfile();
        } catch {
            errorAlert("Error", "Failed to update profile");
        }
    };

    const getInitials = (name) => {
        if (!name) return "T";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

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
        <div className="space-y-4 md:space-y-6 px-2 sm:px-4 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
                        My Profile
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 mt-1">
                        Manage your personal and professional information
                    </p>
                </div>

                {!editMode && (
                    <button
                        onClick={() => setEditMode(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
                    >
                        <FaEdit /> Edit Profile
                    </button>
                )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Left Column - Profile Card */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Cover Photo with Profile Info */}
                        <div className="relative h-32 sm:h-40 bg-gradient-to-r from-blue-600 to-blue-800">
                            {/* Profile Picture */}
                            <div className="absolute -bottom-12 left-4 md:left-6">
                                <div className="relative group">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-white rounded-full p-1 shadow-xl">
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                                            <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                                                {getInitials(profile?.name)}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Camera icon for photo update */}
                                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg">
                                        <FaCamera className="text-sm" />
                                    </button>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                                <FaCheckCircle /> Active
                            </div>
                        </div>

                        {/* Content */}
                        {!editMode ? (
                            /* ===== VIEW MODE ===== */
                            <div className="pt-16 sm:pt-20 p-4 md:p-6">
                                {/* Name and Role */}
                                <div className="mb-6">
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                                        {profile?.name}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                                            Teacher
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            ID: {profile?._id?.slice(-8).toUpperCase()}
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
                                            <FaEnvelope className="text-blue-500 text-lg mt-1 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-500">Email</p>
                                                <p className="font-medium text-sm md:text-base truncate">{profile?.email}</p>
                                            </div>
                                        </div>

                                        {/* Gender */}
                                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                            <FaVenusMars className="text-blue-500 text-lg mt-1 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-500">Gender</p>
                                                <p className="font-medium text-sm md:text-base capitalize">
                                                    {profile?.gender || 'Not specified'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Date of Birth */}
                                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                            <FaCalendar className="text-blue-500 text-lg mt-1 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-500">Date of Birth</p>
                                                <p className="font-medium text-sm md:text-base">
                                                    {formatDate(profile?.Dob)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Joining Date - 👈 NEW */}
                                        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                            <FaClock className="text-blue-500 text-lg mt-1 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-gray-500">Joining Date</p>
                                                <p className="font-medium text-sm md:text-base">
                                                    {formatDate(profile?.joiningDate)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Information */}
                                <div className="mt-6 space-y-4">
                                    <h3 className="text-base md:text-lg font-semibold text-gray-700 border-b pb-2">
                                        Professional Information
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                        {/* Subject */}
                                        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                            <FaBook className="text-blue-500 text-lg mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-500">Subject</p>
                                                <p className="font-medium text-sm md:text-base">
                                                    {profile?.subject || 'Not assigned'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Assigned Class */}
                                        <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                                            <FaChalkboard className="text-purple-500 text-lg mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-500">Assigned Class</p>
                                                <p className="font-medium text-sm md:text-base">
                                                    {profile?.assignedClass || 'Not assigned'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Qualification -  NEW */}
                                        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                            <FaGraduationCap className="text-green-500 text-lg mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-500">Qualification</p>
                                                <p className="font-medium text-sm md:text-base">
                                                    {profile?.qualification || 'Not specified'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Teacher ID */}
                                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                            <FaIdCard className="text-gray-500 text-lg mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-500">Teacher ID</p>
                                                <p className="font-medium text-sm md:text-base">
                                                    {profile?._id?.slice(-8).toUpperCase()}
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

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                            <FaClock className="text-gray-500 text-lg mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-500">Member Since</p>
                                                <p className="font-medium text-sm md:text-base">
                                                    {formatDate(profile?.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                            <FaClock className="text-gray-500 text-lg mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-500">Last Updated</p>
                                                <p className="font-medium text-sm md:text-base">
                                                    {formatDate(profile?.updatedAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* ===== EDIT MODE ===== */
                            <form onSubmit={updateProfile} className="pt-16 sm:pt-20 p-4 md:p-6">
                                <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-4">
                                    Edit Profile
                                </h3>

                                <div className="space-y-4">
                                    {/* Name Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
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
                                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Date of Birth */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date of Birth
                                            </label>
                                            <input
                                                type="date"
                                                name="Dob"
                                                value={form.Dob}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        {/* Joining Date - 👈 NEW */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Joining Date
                                            </label>
                                            <input
                                                type="date"
                                                name="joiningDate"
                                                value={form.joiningDate}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Subject */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Subject
                                            </label>
                                            <input
                                                type="text"
                                                name="subject"
                                                value={form.subject}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., Mathematics"
                                            />
                                        </div>

                                        {/* Assigned Class */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Assigned Class
                                            </label>
                                            <input
                                                type="text"
                                                name="assignedClass"
                                                value={form.assignedClass}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., 10-A"
                                            />
                                        </div>
                                    </div>

                                    {/* Qualification - 👈 NEW */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Qualification
                                        </label>
                                        <input
                                            type="text"
                                            name="qualification"
                                            value={form.qualification}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., M.Sc, B.Ed"
                                        />
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaSave /> Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditMode(false)}
                                        className="flex-1 bg-gray-500 text-white px-4 py-2.5 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaTimes /> Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Right Column - Activity & Stats */}
                <div className="space-y-4 md:space-y-6">
                    {/* Quick Stats Card */}
                    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                        <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <FaChartLine className="text-blue-500" />
                            Quick Stats
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Classes Teaching</span>
                                <span className="font-bold text-blue-600">3</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Students</span>
                                <span className="font-bold text-green-600">85</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Subjects</span>
                                <span className="font-bold text-purple-600">2</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Experience</span>
                                <span className="font-bold text-orange-600">5 years</span>
                            </div>
                        </div>
                    </div>

                    {/* Security Tips */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-4 md:p-6">
                        <h3 className="text-base md:text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                            <FaShieldAlt className="text-blue-600" />
                            Security Tips
                        </h3>
                        <ul className="space-y-2 text-sm text-blue-700">
                            <li className="flex items-center gap-2">
                                <FaCheckCircle className="text-green-600 flex-shrink-0" />
                                <span>Use strong password with symbols</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <FaCheckCircle className="text-green-600 flex-shrink-0" />
                                <span>Enable two-factor authentication</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <FaCheckCircle className="text-green-600 flex-shrink-0" />
                                <span>Don't share your credentials</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}