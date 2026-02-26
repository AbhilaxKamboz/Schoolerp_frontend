import { useEffect, useState } from "react";
import API from "../../api/api";
import { errorAlert } from "../../utils/swal";
import { 
  FaSearch, FaExclamationTriangle, FaMoneyBillWave,
  FaUserGraduate, FaCalendarAlt, FaBell
} from "react-icons/fa";

export default function DueFees() {
  const [dueStudents, setDueStudents] = useState([]);
  const [filteredDue, setFilteredDue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [daysFilter, setDaysFilter] = useState(30);
  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalDue: 0,
    averageDue: 0
  });

  useEffect(() => {
    fetchDueFees();
  }, [daysFilter]);

  useEffect(() => {
    applySearch();
  }, [search, dueStudents]);

  const fetchDueFees = async () => {
    try {
      const res = await API.get(`/accountant/due-fees?days=${daysFilter}`);
      setDueStudents(res.data.students);
      setFilteredDue(res.data.students);
      setSummary({
        totalStudents: res.data.totalStudents,
        totalDue: res.data.totalDue,
        averageDue: res.data.totalStudents ? 
          (res.data.totalDue / res.data.totalStudents).toFixed(2) : 0
      });
    } catch (err) {
      errorAlert("Error", "Failed to load due fees");
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    if (!search) {
      setFilteredDue(dueStudents);
      return;
    }

    const filtered = dueStudents.filter(item => 
      item.studentId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.studentId?.rollNo?.toLowerCase().includes(search.toLowerCase()) ||
      item.studentId?.admissionNo?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredDue(filtered);
  };

  const sendReminder = async (student) => {
    // This would integrate with SMS/Email service
    alert(`Reminder sent to ${student.studentId?.name}`);
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
        <h1 className="text-xl md:text-2xl font-bold">Due Fees</h1>
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="text-orange-500" />
          <span className="text-sm text-gray-600">
            {summary.totalStudents} students with pending dues
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 rounded-lg shadow">
          <p className="text-sm opacity-90">Total Due Amount</p>
          <p className="text-3xl font-bold">₹{summary.totalDue.toLocaleString()}</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow">
          <p className="text-sm opacity-90">Students with Dues</p>
          <p className="text-3xl font-bold">{summary.totalStudents}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white p-6 rounded-lg shadow">
          <p className="text-sm opacity-90">Average Due per Student</p>
          <p className="text-3xl font-bold">₹{summary.averageDue}</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border p-2 pl-10 rounded"
            />
          </div>

          {/* Days Filter */}
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400" />
            <select
              value={daysFilter}
              onChange={(e) => setDaysFilter(Number(e.target.value))}
              className="border p-2 rounded"
            >
              <option value={15}>Last 15 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Due Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t">
          <div className="text-center">
            <p className="text-xs text-gray-500">Due {'<'} ₹1000</p>
            <p className="font-bold text-green-600">
              {dueStudents.filter(s => s.dueAmount < 1000).length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">₹1000 - ₹5000</p>
            <p className="font-bold text-yellow-600">
              {dueStudents.filter(s => s.dueAmount >= 1000 && s.dueAmount < 5000).length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">₹5000 - ₹10000</p>
            <p className="font-bold text-orange-600">
              {dueStudents.filter(s => s.dueAmount >= 5000 && s.dueAmount < 10000).length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">{'>'} ₹10000</p>
            <p className="font-bold text-red-600">
              {dueStudents.filter(s => s.dueAmount >= 10000).length}
            </p>
          </div>
        </div>
      </div>

      {/* Due Students List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold">Students with Due Fees</h3>
        </div>

        {filteredDue.length > 0 ? (
          <div className="divide-y">
            {filteredDue.map((item) => (
              <div key={item.studentId?._id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <FaUserGraduate className="text-gray-400 text-xl" />
                      <div>
                        <h4 className="font-medium">{item.studentId?.name}</h4>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                          <span>Roll: {item.studentId?.rollNo || 'N/A'}</span>
                          <span>Class: {item.classId?.className}-{item.classId?.section}</span>
                          <span>Admission: {item.studentId?.admissionNo || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Due Amount */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Due Amount</p>
                      <p className="text-2xl font-bold text-red-600">
                        ₹{item.dueAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        of ₹{item.totalFee.toLocaleString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => sendReminder(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Send Reminder"
                      >
                        <FaBell />
                      </button>
                      <button
                        onClick={() => window.location.href = `/accountant/receive-payment?student=${item.studentId?._id}`}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                      >
                        Receive Payment
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Paid: ₹{item.paidAmount}</span>
                    <span>Due: ₹{item.dueAmount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(item.paidAmount / item.totalFee) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <FaMoneyBillWave className="text-5xl mx-auto mb-3 text-gray-400" />
            <p>No students with due fees found</p>
          </div>
        )}
      </div>
    </div>
  );
}