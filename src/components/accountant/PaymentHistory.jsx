import { useEffect, useState } from "react";
import API from "../../api/api";
import { errorAlert } from "../../utils/swal";
import { 
  FaSearch, FaFilter, FaDownload, 
  FaMoneyBillWave, FaCreditCard, FaUniversity, FaMobile 
} from "react-icons/fa";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    paymentMode: "",
    startDate: "",
    endDate: ""
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchPayments();
  }, [pagination.page]);

  useEffect(() => {
    applyFilters();
  }, [search, filters, payments]);

  const fetchPayments = async () => {
    try {
      const res = await API.get(`/accountant/payments?page=${pagination.page}&limit=20`);
      setPayments(res.data.payments);
      setFilteredPayments(res.data.payments);
      setPagination({
        page: res.data.page,
        totalPages: res.data.totalPages,
        total: res.data.total
      });
    } catch (err) {
      errorAlert("Error", "Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Apply search (by student name)
    if (search) {
      filtered = filtered.filter(p => 
        p.studentFeeId?.studentId?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply payment mode filter
    if (filters.paymentMode) {
      filtered = filtered.filter(p => p.paymentMode === filters.paymentMode);
    }

    // Apply date range filter
    if (filters.startDate) {
      filtered = filtered.filter(p => 
        new Date(p.paymentDate) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(p => 
        new Date(p.paymentDate) <= new Date(filters.endDate)
      );
    }

    setFilteredPayments(filtered);
  };

  const getPaymentIcon = (mode) => {
    switch(mode) {
      case 'cash': return <FaMoneyBillWave className="text-green-600" />;
      case 'card': return <FaCreditCard className="text-blue-600" />;
      case 'bank': return <FaUniversity className="text-purple-600" />;
      case 'upi': return <FaMobile className="text-orange-600" />;
      default: return <FaMoneyBillWave className="text-gray-600" />;
    }
  };

  const downloadHistory = () => {
    const headers = ['Date', 'Student Name', 'Class', 'Amount', 'Mode', 'Received By'];
    const csvContent = [
      headers.join(','),
      ...filteredPayments.map(p => [
        new Date(p.paymentDate).toLocaleDateString(),
        p.studentFeeId?.studentId?.name || 'N/A',
        `${p.studentFeeId?.classId?.className || ''}-${p.studentFeeId?.classId?.section || ''}`,
        p.amountPaid,
        p.paymentMode,
        p.createdBy?.name || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
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
        <h1 className="text-xl md:text-2xl font-bold">Payment History</h1>
        <button
          onClick={downloadHistory}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <FaDownload /> Download History
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-xs md:text-sm">Total Payments</p>
          <p className="text-xl md:text-2xl font-bold">{pagination.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-xs md:text-sm">Total Amount</p>
          <p className="text-xl md:text-2xl font-bold text-green-600">
            ₹{filteredPayments.reduce((sum, p) => sum + p.amountPaid, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-xs md:text-sm">Cash Payments</p>
          <p className="text-xl md:text-2xl font-bold">
            {filteredPayments.filter(p => p.paymentMode === 'cash').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-500 text-xs md:text-sm">Online Payments</p>
          <p className="text-xl md:text-2xl font-bold">
            {filteredPayments.filter(p => p.paymentMode !== 'cash').length}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border p-2 pl-10 rounded"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            <FaFilter /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Mode
              </label>
              <select
                value={filters.paymentMode}
                onChange={(e) => setFilters({...filters, paymentMode: e.target.value})}
                className="w-full border p-2 rounded"
              >
                <option value="">All Modes</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank">Bank Transfer</option>
                <option value="upi">UPI</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="w-full border p-2 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
        )}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-left">Class</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Mode</th>
                <th className="p-3 text-left">Received By</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                      <br />
                      <span className="text-xs text-gray-500">
                        {new Date(payment.paymentDate).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{payment.studentFeeId?.studentId?.name}</p>
                      <p className="text-xs text-gray-500">
                        Roll: {payment.studentFeeId?.studentId?.rollNo || 'N/A'}
                      </p>
                    </td>
                    <td className="p-3">
                      {payment.studentFeeId?.classId?.className} - {payment.studentFeeId?.classId?.section}
                    </td>
                    <td className="p-3 font-medium text-green-600">
                      ₹{payment.amountPaid}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getPaymentIcon(payment.paymentMode)}
                        <span className="capitalize">{payment.paymentMode}</span>
                      </div>
                    </td>
                    <td className="p-3">{payment.createdBy?.name || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No payment records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPagination({...pagination, page: pagination.page - 1})}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-white border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPagination({...pagination, page: pagination.page + 1})}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 bg-white border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}