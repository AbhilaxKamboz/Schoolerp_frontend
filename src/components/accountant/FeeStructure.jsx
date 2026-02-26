import { useEffect, useState } from "react";
import API from "../../api/api";
import { successAlert, errorAlert, confirmAlert } from "../../utils/swal";
import { 
  FaPlus, FaEdit, FaTrash, FaMoneyBillWave,
  FaSearch, FaToggleOn, FaToggleOff
} from "react-icons/fa";

export default function FeeStructure() {
  const [feeStructures, setFeeStructures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");

  const [form, setForm] = useState({
    classId: "",
    tuitionFee: "",
    examFee: "",
    miscFee: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [feesRes, classesRes] = await Promise.all([
        API.get("/accountant/fee-structures"),
        API.get("/accountant/classes")
      ]);
      setFeeStructures(feesRes.data.fees);
      setClasses(classesRes.data.classes);
    } catch (err) {
      errorAlert("Error", "Failed to load data");
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

  const calculateTotal = () => {
    const tuition = Number(form.tuitionFee) || 0;
    const exam = Number(form.examFee) || 0;
    const misc = Number(form.miscFee) || 0;
    return tuition + exam + misc;
  };

  const saveFeeStructure = async (e) => {
    e.preventDefault();

    if (!form.classId || !form.tuitionFee) {
      return errorAlert("Required", "Class and tuition fee are required");
    }

    try {
      if (editId) {
        await API.put(`/accountant/fee-structure/${editId}`, form);
        successAlert("Updated", "Fee structure updated successfully");
      } else {
        await API.post("/accountant/fee-structure/create", form);
        successAlert("Created", "Fee structure created successfully");
      }

      resetForm();
      fetchData();
    } catch (err) {
      errorAlert("Error", err.response?.data?.message || "Operation failed");
    }
  };

  const editFeeStructure = (fee) => {
    setEditId(fee._id);
    setForm({
      classId: fee.classId._id,
      tuitionFee: fee.tuitionFee,
      examFee: fee.examFee,
      miscFee: fee.miscFee
    });
    setShowForm(true);
  };

  const toggleStatus = async (id, current) => {
    const ok = await confirmAlert(
      "Confirm",
      `Do you want to ${current ? "deactivate" : "activate"} this fee structure?`
    );

    if (!ok) return;

    try {
      await API.put(`/accountant/fee-structure/${id}`, {
        isActive: !current
      });
      successAlert("Updated", "Status updated successfully");
      fetchData();
    } catch (err) {
      errorAlert("Error", "Failed to update status");
    }
  };

  const deleteFeeStructure = async (id) => {
    const ok = await confirmAlert(
      "Delete Fee Structure",
      "Are you sure you want to delete this fee structure?"
    );

    if (!ok) return;

    try {
      await API.delete(`/accountant/fee-structure/${id}`);
      successAlert("Deleted", "Fee structure deleted successfully");
      fetchData();
    } catch (err) {
      errorAlert("Error", "Failed to delete");
    }
  };

  const resetForm = () => {
    setForm({
      classId: "",
      tuitionFee: "",
      examFee: "",
      miscFee: ""
    });
    setEditId(null);
    setShowForm(false);
  };

  // Filter fee structures
  const filteredFees = feeStructures.filter(fee => {
    const matchesSearch = fee.classId?.className?.toLowerCase().includes(search.toLowerCase()) ||
                         fee.classId?.section?.toLowerCase().includes(search.toLowerCase());
    const matchesClass = !filterClass || fee.classId?._id === filterClass;
    return matchesSearch && matchesClass;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl md:text-2xl font-bold">Fee Structures</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          <FaPlus /> {showForm ? "Close" : "New Fee Structure"}
        </button>
      </div>

      {/* Filters - Responsive */}
      <div className="bg-white p-4 rounded-lg shadow grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border p-2 pl-10 rounded"
          />
        </div>
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">All Classes</option>
          {classes.map(c => (
            <option key={c._id} value={c._id}>
              {c.className} - {c.section}
            </option>
          ))}
        </select>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <form onSubmit={saveFeeStructure} className="bg-white p-4 md:p-6 rounded-lg shadow space-y-4">
          <h3 className="text-lg font-semibold">
            {editId ? "Edit Fee Structure" : "Create New Fee Structure"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Class *
              </label>
              <select
                name="classId"
                value={form.classId}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
                disabled={editId} // Can't change class when editing
              >
                <option value="">Choose Class</option>
                {classes.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.className} - {c.section}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tuition Fee (₹) *
              </label>
              <input
                type="number"
                name="tuitionFee"
                value={form.tuitionFee}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Fee (₹)
              </label>
              <input
                type="number"
                name="examFee"
                value={form.examFee}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Miscellaneous Fee (₹)
              </label>
              <input
                type="number"
                name="miscFee"
                value={form.miscFee}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                min="0"
              />
            </div>
          </div>

          {/* Total Display */}
          <div className="bg-purple-50 p-4 rounded">
            <p className="text-sm text-gray-600">Total Fee</p>
            <p className="text-2xl font-bold text-purple-600">₹{calculateTotal().toLocaleString()}</p>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <button
              type="submit"
              className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              {editId ? "Update" : "Create"} Fee Structure
            </button>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Fee Structures Table - Horizontal scroll on mobile */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Class</th>
                <th className="p-3 text-left">Tuition</th>
                <th className="p-3 text-left">Exam</th>
                <th className="p-3 text-left">Misc</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.length > 0 ? (
                filteredFees.map((fee) => (
                  <tr key={fee._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      {fee.classId?.className} - {fee.classId?.section}
                    </td>
                    <td className="p-3">₹{fee.tuitionFee}</td>
                    <td className="p-3">₹{fee.examFee || 0}</td>
                    <td className="p-3">₹{fee.miscFee || 0}</td>
                    <td className="p-3 font-medium">₹{fee.totalFee}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleStatus(fee._id, fee.isActive)}
                        className={`text-xl ${fee.isActive ? 'text-green-600' : 'text-gray-400'}`}
                      >
                        {fee.isActive ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => editFeeStructure(fee)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteFeeStructure(fee._id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    No fee structures found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total Structures</p>
          <p className="text-2xl font-bold">{feeStructures.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Active Structures</p>
          <p className="text-2xl font-bold text-green-600">
            {feeStructures.filter(f => f.isActive).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Inactive Structures</p>
          <p className="text-2xl font-bold text-red-600">
            {feeStructures.filter(f => !f.isActive).length}
          </p>
        </div>
      </div>
    </div>
  );
}