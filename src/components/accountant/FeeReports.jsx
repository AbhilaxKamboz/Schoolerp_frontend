import { useEffect, useState } from "react";
import API from "../../api/api";
import { errorAlert, successAlert } from "../../utils/swal";
import { 
  FaFilePdf, FaFileExcel, FaPrint, FaChartBar,
  FaDownload, FaCalendarAlt, FaFilter
} from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';

export default function FeeReports() {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("collection"); // collection, due, class-wise
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState([]);
  const [reportData, setReportData] = useState(null);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (reportType) {
      generateReport();
    }
  }, [reportType, dateRange, selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await API.get("/accountant/classes");
      setClasses(res.data.classes);
    } catch (err) {
      errorAlert("Error", "Failed to load classes");
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      
      let params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      if (selectedClass) params.classId = selectedClass;

      const res = await API.get(`/accountant/fee-report?type=${reportType}`, { params });
      setReportData(res.data);
    } catch (err) {
      errorAlert("Error", "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format) => {
    try {
      let params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      if (selectedClass) params.classId = selectedClass;

      const res = await API.get(`/accountant/fee-report/${format}?type=${reportType}`, {
        params,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fee-report-${reportType}-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      successAlert("Success", `Report downloaded as ${format.toUpperCase()}`);
    } catch (err) {
      errorAlert("Error", "Failed to download report");
    }
  };

  const printReport = () => {
    window.print();
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
      <h1 className="text-xl md:text-2xl font-bold">Fee Reports</h1>

      {/* Report Controls */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="collection">Collection Report</option>
              <option value="due">Due Report</option>
              <option value="class-wise">Class-wise Collection</option>
              <option value="monthly">Monthly Collection</option>
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class (Optional)
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
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

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <button
            onClick={() => downloadReport('pdf')}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            <FaFilePdf /> PDF
          </button>
          <button
            onClick={() => downloadReport('excel')}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <FaFileExcel /> Excel
          </button>
          <button
            onClick={printReport}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <FaPrint /> Print
          </button>
        </div>
      </div>

      {/* Report Display */}
      {reportData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500 text-sm">Total Collections</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{reportData.totals?.totalCollected?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500 text-sm">Total Due</p>
              <p className="text-2xl font-bold text-red-600">
                ₹{reportData.totals?.totalDue?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500 text-sm">Total Students</p>
              <p className="text-2xl font-bold">
                {reportData.report?.length || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-500 text-sm">Collection Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {reportData.totals?.totalCollected && reportData.totals?.totalFees
                  ? ((reportData.totals.totalCollected / reportData.totals.totalFees) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>

          {/* Chart based on report type */}
          {reportType === 'collection' && (
            <div className="bg-white p-4 md:p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Daily Collection Trend</h3>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData.trend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="amount" name="Collection" stroke="#10b981" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {reportType === 'class-wise' && (
            <div className="bg-white p-4 md:p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Class-wise Collection</h3>
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.classWise || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="className" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="collected" name="Collected" fill="#10b981" />
                    <Bar dataKey="due" name="Due" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Detailed Report Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="text-lg font-semibold">Detailed Report</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Student</th>
                    <th className="p-3 text-left">Class</th>
                    <th className="p-3 text-left">Total Fee</th>
                    <th className="p-3 text-left">Paid</th>
                    <th className="p-3 text-left">Due</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Last Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.report?.map((item, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        <p className="font-medium">{item.student?.name}</p>
                        <p className="text-xs text-gray-500">Roll: {item.student?.rollNo}</p>
                      </td>
                      <td className="p-3">
                        {item.class?.className} - {item.class?.section}
                      </td>
                      <td className="p-3">₹{item.totalFee}</td>
                      <td className="p-3 text-green-600">₹{item.paidAmount}</td>
                      <td className="p-3 text-red-600">₹{item.dueAmount}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.status === 'paid' ? 'bg-green-100 text-green-600' :
                          item.status === 'partial' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {item.payments?.[0] ? (
                          <>
                            <p className="text-sm">₹{item.payments[0].amount}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(item.payments[0].date).toLocaleDateString()}
                            </p>
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}