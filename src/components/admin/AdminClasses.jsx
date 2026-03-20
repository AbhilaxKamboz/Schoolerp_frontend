import { useEffect, useState } from "react";
import API from "../../api/api";
import { successAlert, confirmAlert, errorAlert } from "../../utils/swal";
import { 
  FaPlus, FaSearch, FaEdit, FaToggleOn, FaToggleOff,
  FaChalkboard, FaUserTie, FaCalendar, FaFilter,
  FaTimes, FaSave, FaChevronDown, FaChevronUp,
  FaEye, FaEyeSlash, FaSort, FaSortUp, FaSortDown
} from "react-icons/fa";
import Swal from 'sweetalert2';

export default function AdminClasses() {
  /* STATE MANAGEMENT */
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'className', direction: 'asc' });
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [expandedClass, setExpandedClass] = useState(null);
  const [mobileView, setMobileView] = useState('list'); // list, grid

  // Form data
  const [form, setForm] = useState({
    className: "",
    section: "",
    classTeacher: ""
  });

  /* FETCH DATA */
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/classes");
      setClasses(res.data.classes);
      setFilteredClasses(res.data.classes);
    } catch {
      errorAlert("Error", "Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await API.get("/admin/users?role=teacher&isActive=true");
      setTeachers(res.data.users);
    } catch {
      errorAlert("Error", "Failed to load teachers");
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  /* FILTERING AND SORTING */
  useEffect(() => {
    let result = [...classes];

    // Apply search filter
    if (search) {
      result = result.filter(c => 
        `${c.className} ${c.section} ${c.classTeacher?.name || ''}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(c => 
        statusFilter === 'active' ? c.isActive : !c.isActive
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'className') {
        aValue = `${a.className} ${a.section}`;
        bValue = `${b.className} ${b.section}`;
      }
      if (sortConfig.key === 'classTeacher') {
        aValue = a.classTeacher?.name || '';
        bValue = b.classTeacher?.name || '';
      }
      if (sortConfig.key === 'createdAt') {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredClasses(result);
  }, [classes, search, statusFilter, sortConfig]);

  /* SORT HANDLER */
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-gray-400" />;
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="text-blue-600" /> : 
      <FaSortDown className="text-blue-600" />;
  };

  /* INPUT HANDLER */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  /* CREATE / UPDATE CLASS */
  const saveClass = async (e) => {
    e.preventDefault();

    if (!form.className || !form.section) {
      return errorAlert("Required", "Class name & section are required");
    }

    try {
      if (editId) {
        await API.put(`/admin/class/${editId}`, form);
        successAlert("Updated", "Class updated successfully");
      } else {
        await API.post("/admin/class/create", form);
        successAlert("Created", "Class created successfully");
      }

      resetForm();
      fetchClasses();
    } catch (err) {
      errorAlert("Error", err.response?.data?.message || "Operation failed");
    }
  };

  /* EDIT CLASS */
  const editClass = (cls) => {
    setEditId(cls._id);
    setForm({
      className: cls.className,
      section: cls.section,
      classTeacher: cls.classTeacher?._id || ""
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* TOGGLE STATUS */
  const toggleStatus = async (id, current) => {
    const result = await Swal.fire({
      title: 'Confirm Status Change',
      text: `Do you want to ${current ? 'deactivate' : 'activate'} this class?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: current ? '#ef4444' : '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: current ? 'Yes, deactivate' : 'Yes, activate',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      await API.put(`/admin/class/status/${id}`, {
        isActive: !current
      });
      
      await Swal.fire({
        title: 'Updated!',
        text: `Class ${current ? 'deactivated' : 'activated'} successfully`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      fetchClasses();
    } catch {
      errorAlert("Error", "Failed to update status");
    }
  };

  /* RESET FORM */
  const resetForm = () => {
    setForm({ className: "", section: "", classTeacher: "" });
    setEditId(null);
    setShowForm(false);
  };

  /* TOGGLE EXPAND FOR MOBILE */
  const toggleExpand = (classId) => {
    setExpandedClass(expandedClass === classId ? null : classId);
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
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
            Class Management
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Manage all classes and sections
          </p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {/* View Toggle for Mobile */}
          <select
            value={mobileView}
            onChange={(e) => setMobileView(e.target.value)}
            className="sm:hidden flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="list">List View</option>
            <option value="grid">Grid View</option>
          </select>

          {/* Create Class Button */}
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
          >
            {showForm ? <FaTimes /> : <FaPlus />}
            <span className="hidden sm:inline">{showForm ? "Close" : "Create Class"}</span>
            <span className="sm:hidden">{showForm ? "Close" : "New"}</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by class, section or teacher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaFilter className={showFilters ? 'text-blue-600' : ''} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Classes</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={`${sortConfig.key}-${sortConfig.direction}`}
                onChange={(e) => {
                  const [key, direction] = e.target.value.split('-');
                  setSortConfig({ key, direction });
                }}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="className-asc">Class (A-Z)</option>
                <option value="className-desc">Class (Z-A)</option>
                <option value="classTeacher-asc">Teacher (A-Z)</option>
                <option value="classTeacher-desc">Teacher (Z-A)</option>
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT FORM */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <h2 className="text-lg md:text-xl font-semibold">
              {editId ? 'Edit Class' : 'Create New Class'}
            </h2>
          </div>
          
          <form onSubmit={saveClass} className="p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Class Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="className"
                  placeholder="e.g., 10"
                  value={form.className}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Section Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section <span className="text-red-500">*</span>
                </label>
                <input
                  name="section"
                  placeholder="e.g., A"
                  value={form.section}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Class Teacher Select */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Class Teacher
                </label>
                <select
                  name="classTeacher"
                  value={form.classTeacher}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Class Teacher</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} - {t.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaSave /> {editId ? "Update Class" : "Save Class"}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <p className="text-xs text-gray-500">Total Classes</p>
          <p className="text-xl font-bold">{classes.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-xl font-bold text-green-600">
            {classes.filter(c => c.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <p className="text-xs text-gray-500">Inactive</p>
          <p className="text-xl font-bold text-red-600">
            {classes.filter(c => !c.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <p className="text-xs text-gray-500">With Teachers</p>
          <p className="text-xl font-bold text-blue-600">
            {classes.filter(c => c.classTeacher).length}
          </p>
        </div>
      </div>

      {/* DESKTOP TABLE VIEW - Hidden on mobile */}
      <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left cursor-pointer hover:bg-gray-200" onClick={() => requestSort('className')}>
                  <div className="flex items-center gap-2">
                    Class {getSortIcon('className')}
                  </div>
                </th>
                <th className="p-3 text-left">Section</th>
                <th className="p-3 text-left cursor-pointer hover:bg-gray-200" onClick={() => requestSort('classTeacher')}>
                  <div className="flex items-center gap-2">
                    Class Teacher {getSortIcon('classTeacher')}
                  </div>
                </th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left cursor-pointer hover:bg-gray-200" onClick={() => requestSort('createdAt')}>
                  <div className="flex items-center gap-2">
                    Created {getSortIcon('createdAt')}
                  </div>
                </th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.length > 0 ? (
                filteredClasses.map((c) => (
                  <tr key={c._id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-medium">{c.className}</td>
                    <td className="p-3">{c.section}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FaUserTie className="text-gray-400" />
                        <span>{c.classTeacher?.name || '-'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        c.isActive 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FaCalendar className="text-gray-400" />
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => editClass(c)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Class"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => toggleStatus(c._id, c.isActive)}
                          className={`p-2 rounded-lg transition-colors ${
                            c.isActive 
                              ? 'text-orange-600 hover:bg-orange-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={c.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {c.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No classes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARD/GRID VIEW - Visible only on mobile */}
      <div className="md:hidden space-y-3">
        {filteredClasses.length > 0 ? (
          mobileView === 'grid' ? (
            // Grid View
            <div className="grid grid-cols-2 gap-3">
              {filteredClasses.map((c) => (
                <div key={c._id} className="bg-white rounded-xl shadow-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-lg font-bold">{c.className}</span>
                      <span className="text-gray-500 ml-1">-{c.section}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      c.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1 mb-1">
                      <FaUserTie className="text-xs" />
                      <span className="truncate">{c.classTeacher?.name || 'No teacher'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCalendar className="text-xs" />
                      <span className="text-xs">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => editClass(c)}
                      className="flex-1 bg-blue-100 text-blue-600 py-2 rounded-lg text-sm hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleStatus(c._id, c.isActive)}
                      className={`flex-1 py-2 rounded-lg text-sm ${
                        c.isActive 
                          ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                    >
                      {c.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View (Collapsible Cards)
            filteredClasses.map((c) => (
              <div key={c._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(c._id)}
                >
                  <div>
                    <h3 className="font-bold text-lg">
                      Class {c.className} - {c.section}
                    </h3>
                    <p className="text-sm text-gray-600">
                      <FaUserTie className="inline mr-1" />
                      {c.classTeacher?.name || 'No teacher assigned'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      c.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {expandedClass === c._id ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </div>

                {expandedClass === c._id && (
                  <div className="p-4 bg-gray-50 border-t space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="font-medium">{new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Teacher Email</p>
                        <p className="font-medium truncate">{c.classTeacher?.email || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => editClass(c)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(c._id, c.isActive)}
                        className={`flex-1 py-2 rounded-lg text-sm ${
                          c.isActive 
                            ? 'bg-orange-600 text-white hover:bg-orange-700' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {c.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-lg text-center text-gray-500">
            <FaChalkboard className="text-5xl mx-auto mb-3 text-gray-400" />
            <p className="text-lg">No classes found</p>
            <p className="text-sm">Try adjusting your search or create a new class</p>
          </div>
        )}
      </div>
    </div>
  );
}