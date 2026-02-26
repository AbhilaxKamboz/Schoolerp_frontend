import { useEffect, useState } from "react";
import API from "../../api/api";
import { errorAlert } from "../../utils/swal";
import { 
  FaSearch, FaFilter, FaDownload, FaEye,
  FaCheckCircle, FaClock, FaExclamationTriangle
} from "react-icons/fa";

export default function StudentFees() {
  const [fees, setFees] = useState([]);
  const [filteredFees, setFilteredFees] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    classId: "",
    status: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, filters, fees]);

  const fetchData = async () => {
    try {
      const [feesRes, classesRes] = await Promise.all([
        API.get("/accountant/student-fees"),
        API.get("/accountant/classes")
      ]);
      
      setFees(feesRes.data.fees);
      setFilteredFees(feesRes.data.fees);
      setClasses(classesRes.data.classes);
    } catch (err) {
      errorAlert("Error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...fees];

    // Apply search
    if (search) {
      filtered = filtered.filter(f => 
        f.studentId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        f.studentId?.rollNo?.toLowerCase().includes(search.toLowerCase()) ||
        f.studentId?.admissionNo?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply class filter
    if (filters.classId) {
      filtered = filtered.filter(f => f.classId?._id === filters.classId);
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(f => f.status === filters.status);
    }

    setFilteredFees(filtered);
  };

  const fetchStudentDetails = async (studentId) => {
    try {
      const res = await API.get(`/accountant/student-fee/${studentId}`);
      setStudentDetails(res.data);
      setShowDetails(true);
    } catch (err) {
      errorAlert("Error", "Failed to load student details");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'paid':
        return {
          icon: <FaCheckCircle />,
          text: 'Paid',
          class: 'bg-green-100 text-green-600'
        };
      case 'partial':
        return {
          icon: <FaClock />,
          text: 'Partial',
          class: 'bg-yellow-100 text-yellow-600'
        };
      case 'unpaid':
        return {
          icon: <FaExclamationTriangle />,
          text: 'Unpaid',
          class: 'bg-red-100 text-red-600'
        };
      default:
        return {
          icon: <FaClock />,
          text: status,
          class: 'bg-gray-100 text-gray-600'
        };
    }
  };

  const downloadReport = () => {
    // Create CSV content
    const headers = ['Student Name', 'Roll No', 'Class', 'Total Fee', 'Paid', 'Due', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredFees.map(f => [
        f.studentId?.name,
        f.studentId?.rollNo || 'N/A',
        `${f.classId?.className}-${f.classId?.section}`,
        f.totalFee,
        f.paidAmount,
        f.dueAmount,
        f.status
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-fees-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

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
        <h1 className="text-xl md:text-2xl font-bold">Student Fees</h1>
        <button
          onClick={downloadReport}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <FaDownload /> Download Report
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, roll number or admission number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border p-2 pl-10 rounded"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 sm:w-auto"
          >
            <FaFilter /> Filters
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                value={filters.classId}
                onChange={(e) => setFilters({...filters, classId: e.target.value})}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full border p-2 rounded"
              >
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-xs md:text-sm">Total Students</p>
          <p className="text-xl md:text-2xl font-bold">{filteredFees.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-xs md:text-sm">Total Fee</p>
          <p className="text-xl md:text-2xl font-bold">
            ₹{filteredFees.reduce((sum, f) => sum + f.totalFee, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-xs md:text-sm">Collected</p>
          <p className="text-xl md:text-2xl font-bold text-green-600">
            ₹{filteredFees.reduce((sum, f) => sum + f.paidAmount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-xs md:text-sm">Due Amount</p>
          <p className="text-xl md:text-2xl font-bold text-red-600">
            ₹{filteredFees.reduce((sum, f) => sum + f.dueAmount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Fees Table - Horizontal scroll on mobile */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-left">Class</th>
                <th className="p-3 text-left">Total Fee</th>
                <th className="p-3 text-left">Paid</th>
                <th className="p-3 text-left">Due</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.length > 0 ? (
                filteredFees.map((fee) => {
                  const status = getStatusBadge(fee.status);
                  
                  return (
                    <tr key={fee._id} className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{fee.studentId?.name}</p>
                          <p className="text-xs text-gray-500">
                            Roll: {fee.studentId?.rollNo || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        {fee.classId?.className} - {fee.classId?.section}
                      </td>
                      <td className="p-3 font-medium">₹{fee.totalFee}</td>
                      <td className="p-3 text-green-600">₹{fee.paidAmount}</td>
                      <td className="p-3 text-red-600">₹{fee.dueAmount}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${status.class}`}>
                          {status.icon}
                          {status.text}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => fetchStudentDetails(fee.studentId?._id)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    No fee records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Modal */}
      {showDetails && studentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Student Fee Details</h2>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setStudentDetails(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>

              {/* Student Info */}
              <div className="bg-purple-50 p-4 rounded mb-4">
                <h3 className="font-semibold">{studentDetails.studentFee.studentId?.name}</h3>
                <p className="text-sm text-gray-600">
                  Class: {studentDetails.studentFee.classId?.className} - {studentDetails.studentFee.classId?.section}
                </p>
                <p className="text-sm text-gray-600">
                  Roll No: {studentDetails.studentFee.studentId?.rollNo || 'N/A'}
                </p>
              </div>

              {/* Fee Summary */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 p-3 rounded text-center">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-lg font-bold">₹{studentDetails.studentFee.totalFee}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded text-center">
                  <p className="text-xs text-gray-500">Paid</p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{studentDetails.studentFee.paidAmount}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded text-center">
                  <p className="text-xs text-gray-500">Due</p>
                  <p className="text-lg font-bold text-red-600">
                    ₹{studentDetails.studentFee.dueAmount}
                  </p>
                </div>
              </div>

              {/* Payment History */}
              <h3 className="font-semibold mb-2">Payment History</h3>
              {studentDetails.payments?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Amount</th>
                        <th className="p-2 text-left">Mode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentDetails.payments.map((payment, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </td>
                          <td className="p-2 font-medium text-green-600">
                            ₹{payment.amountPaid}
                          </td>
                          <td className="p-2 capitalize">{payment.paymentMode}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No payment history</p>
              )}

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setStudentDetails(null);
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}