import { useEffect, useState } from "react";
import API from "../../api/api";
import { successAlert, confirmAlert, errorAlert } from "../../utils/swal";
import { 
  FaPlus, FaSearch, FaEdit, FaToggleOn, FaToggleOff,
  FaBook, FaCode, FaCalendar, FaFilter,
  FaTimes, FaSave, FaChevronDown, FaChevronUp,
  FaSort, FaSortUp, FaSortDown, FaTag
} from "react-icons/fa";
import Swal from 'sweetalert2';

export default function AdminSubjects() {
  /* STATE MANAGEMENT */
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [mobileView, setMobileView] = useState('list'); // list, grid

  // Form data
  const [form, setForm] = useState({
    name: "",
    code: ""
  });

  /* FETCH SUBJECTS */
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/subjects");
      setSubjects(res.data.subjects);
      setFilteredSubjects(res.data.subjects);
    } catch {
      errorAlert("Error", "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  /* FILTERING AND SORTING */
  useEffect(() => {
    let result = [...subjects];

    // Apply search filter
    if (search) {
      result = result.filter(s => 
        `${s.name} ${s.code}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(s => 
        statusFilter === 'active' ? s.isActive : !s.isActive
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'createdAt') {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredSubjects(result);
  }, [subjects, search, statusFilter, sortConfig]);

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

  /* CREATE / UPDATE SUBJECT */
  const saveSubject = async (e) => {
    e.preventDefault();

    if (!form.name || !form.code) {
      return errorAlert("Required", "Subject name & code are required");
    }

    try {
      if (editId) {
        await API.put(`/admin/subject/${editId}`, form);
        successAlert("Updated", "Subject updated successfully");
      } else {
        await API.post("/admin/subject/create", form);
        successAlert("Created", "Subject created successfully");
      }

      resetForm();
      fetchSubjects();
    } catch (err) {
      errorAlert("Error", err.response?.data?.message || "Operation failed");
    }
  };

  /* EDIT SUBJECT */
  const editSubject = (sub) => {
    setEditId(sub._id);
    setForm({
      name: sub.name,
      code: sub.code
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ACTIVATE / DEACTIVATE */
  const toggleStatus = async (id, current) => {
    const result = await Swal.fire({
      title: 'Confirm Status Change',
      text: `Do you want to ${current ? 'deactivate' : 'activate'} this subject?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: current ? '#ef4444' : '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: current ? 'Yes, deactivate' : 'Yes, activate',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      await API.put(`/admin/subject/status/${id}`, {
        isActive: !current
      });

      await Swal.fire({
        title: 'Updated!',
        text: `Subject ${current ? 'deactivated' : 'activated'} successfully`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      fetchSubjects();
    } catch {
      errorAlert("Error", "Failed to update status");
    }
  };

  /* RESET FORM */
  const resetForm = () => {
    setForm({ name: "", code: "" });
    setEditId(null);
    setShowForm(false);
  };

  /* TOGGLE EXPAND FOR MOBILE */
  const toggleExpand = (subjectId) => {
    setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
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
            Subject Management
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Manage all subjects and their codes
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

          {/* Create Subject Button */}
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
          >
            {showForm ? <FaTimes /> : <FaPlus />}
            <span className="hidden sm:inline">{showForm ? "Close" : "Create Subject"}</span>
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
              placeholder="Search by subject name or code..."
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
                <option value="all">All Subjects</option>
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
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="code-asc">Code (A-Z)</option>
                <option value="code-desc">Code (Z-A)</option>
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
              {editId ? 'Edit Subject' : 'Create New Subject'}
            </h2>
          </div>
          
          <form onSubmit={saveSubject} className="p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Subject Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  placeholder="e.g., Mathematics"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Subject Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Code <span className="text-red-500">*</span>
                </label>
                <input
                  name="code"
                  placeholder="e.g., MTH101"
                  value={form.code}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaSave /> {editId ? "Update Subject" : "Save Subject"}
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
          <p className="text-xs text-gray-500">Total Subjects</p>
          <p className="text-xl font-bold">{subjects.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-xl font-bold text-green-600">
            {subjects.filter(s => s.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <p className="text-xs text-gray-500">Inactive</p>
          <p className="text-xl font-bold text-red-600">
            {subjects.filter(s => !s.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <p className="text-xs text-gray-500">With Codes</p>
          <p className="text-xl font-bold text-blue-600">
            {subjects.filter(s => s.code).length}
          </p>
        </div>
      </div>

      {/* DESKTOP TABLE VIEW - Hidden on mobile */}
      <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left cursor-pointer hover:bg-gray-200" onClick={() => requestSort('name')}>
                  <div className="flex items-center gap-2">
                    <FaBook className="text-gray-500" />
                    Subject {getSortIcon('name')}
                  </div>
                </th>
                <th className="p-3 text-left cursor-pointer hover:bg-gray-200" onClick={() => requestSort('code')}>
                  <div className="flex items-center gap-2">
                    <FaCode className="text-gray-500" />
                    Code {getSortIcon('code')}
                  </div>
                </th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left cursor-pointer hover:bg-gray-200" onClick={() => requestSort('createdAt')}>
                  <div className="flex items-center gap-2">
                    <FaCalendar className="text-gray-500" />
                    Created {getSortIcon('createdAt')}
                  </div>
                </th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((s) => (
                  <tr key={s._id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FaBook className="text-blue-500" />
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FaTag className="text-gray-400" />
                        <span className="font-mono">{s.code}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        s.isActive 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FaCalendar className="text-gray-400" />
                        <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => editSubject(s)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Subject"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => toggleStatus(s._id, s.isActive)}
                          className={`p-2 rounded-lg transition-colors ${
                            s.isActive 
                              ? 'text-orange-600 hover:bg-orange-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={s.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {s.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    <FaBook className="text-5xl mx-auto mb-3 text-gray-400" />
                    <p className="text-lg">No subjects found</p>
                    <p className="text-sm">Try adjusting your search or create a new subject</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARD/GRID VIEW - Visible only on mobile */}
      <div className="md:hidden space-y-3">
        {filteredSubjects.length > 0 ? (
          mobileView === 'grid' ? (
            // Grid View
            <div className="grid grid-cols-2 gap-3">
              {filteredSubjects.map((s) => (
                <div key={s._id} className="bg-white rounded-xl shadow-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <FaBook className="text-blue-500 text-xs flex-shrink-0" />
                        <h3 className="font-semibold text-sm truncate">{s.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <FaTag className="text-gray-400 text-xs flex-shrink-0" />
                        <span className="text-xs font-mono truncate">{s.code}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                      s.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => editSubject(s)}
                      className="flex-1 bg-blue-100 text-blue-600 py-2 rounded-lg text-xs hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleStatus(s._id, s.isActive)}
                      className={`flex-1 py-2 rounded-lg text-xs ${
                        s.isActive 
                          ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                    >
                      {s.isActive ? 'Deact' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View (Collapsible Cards)
            filteredSubjects.map((s) => (
              <div key={s._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(s._id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FaBook className="text-blue-500 flex-shrink-0" />
                      <h3 className="font-semibold truncate">{s.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <FaTag className="text-gray-400 text-sm flex-shrink-0" />
                      <span className="text-sm text-gray-600 font-mono truncate">{s.code}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-2">
                    <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                      s.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {expandedSubject === s._id ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </div>

                {expandedSubject === s._id && (
                  <div className="p-4 bg-gray-50 border-t space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="font-medium">{new Date(s.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Subject ID</p>
                        <p className="font-medium font-mono text-xs truncate">{s._id.slice(-8)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => editSubject(s)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(s._id, s.isActive)}
                        className={`flex-1 py-2 rounded-lg text-sm ${
                          s.isActive 
                            ? 'bg-orange-600 text-white hover:bg-orange-700' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {s.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-lg text-center text-gray-500">
            <FaBook className="text-5xl mx-auto mb-3 text-gray-400" />
            <p className="text-lg">No subjects found</p>
            <p className="text-sm">Try adjusting your search or create a new subject</p>
          </div>
        )}
      </div>
    </div>
  );
}