import { useEffect, useState } from "react";
import API from "../../api/api";
import { successAlert, errorAlert } from "../../utils/swal";
import { 
  FaSearch, FaUserGraduate, FaMoneyBillWave, 
  FaCreditCard, FaUniversity, FaMobile 
} from "react-icons/fa";

export default function ReceivePayment() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeDetails, setFeeDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amountPaid: "",
    paymentMode: "cash"
  });

  useEffect(() => {
    fetchDueStudents();
  }, []);

  useEffect(() => {
    const filtered = students.filter(s => 
      s.studentId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId?.rollNo?.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId?.admissionNo?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [search, students]);

  const fetchDueStudents = async () => {
    try {
      const res = await API.get("/accountant/due-fees");
      setStudents(res.data.students);
    } catch (err) {
      errorAlert("Error", "Failed to load students");
    }
  };

  const fetchStudentFeeDetails = async (studentId) => {
    try {
      setLoading(true);
      const res = await API.get(`/accountant/student-fee/${studentId}`);
      setFeeDetails(res.data);
      setSelectedStudent(studentId);
    } catch (err) {
      errorAlert("Error", "Failed to load fee details");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!paymentData.amountPaid || paymentData.amountPaid <= 0) {
      return errorAlert("Error", "Please enter a valid amount");
    }

    if (paymentData.amountPaid > feeDetails.studentFee.dueAmount) {
      return errorAlert("Error", 
        `Amount cannot exceed due amount of ₹${feeDetails.studentFee.dueAmount}`
      );
    }

    try {
      await API.post("/accountant/fee/payment", {
        studentFeeId: feeDetails.studentFee._id,
        amountPaid: Number(paymentData.amountPaid),
        paymentMode: paymentData.paymentMode
      });

      successAlert("Success", "Payment recorded successfully");
      
      // Reset form
      setPaymentData({
        amountPaid: "",
        paymentMode: "cash"
      });
      setSelectedStudent(null);
      setFeeDetails(null);
      
      // Refresh due students list
      fetchDueStudents();
    } catch (err) {
      errorAlert("Error", err.response?.data?.message || "Failed to record payment");
    }
  };

  const getPaymentIcon = (mode) => {
    switch(mode) {
      case 'cash': return <FaMoneyBillWave />;
      case 'card': return <FaCreditCard />;
      case 'bank': return <FaUniversity />;
      case 'upi': return <FaMobile />;
      default: return <FaMoneyBillWave />;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">Receive Payment</h1>

      {!selectedStudent ? (
        /* Student Selection View */
        <>
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, roll number or admission number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border p-2 pl-10 rounded"
              />
            </div>
          </div>

          {/* Students with Due Fees */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="text-lg font-semibold">
                Students with Due Fees ({filteredStudents.length})
              </h3>
            </div>

            {filteredStudents.length > 0 ? (
              <div className="divide-y">
                {filteredStudents.map((item) => (
                  <div key={item.studentId._id} className="p-4 hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Student Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <FaUserGraduate className="text-gray-400 text-xl" />
                          <div>
                            <h4 className="font-medium">{item.studentId.name}</h4>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                              <span>Roll: {item.studentId.rollNo || 'N/A'}</span>
                              <span>Class: {item.classId?.className}-{item.classId?.section}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Due Amount & Action */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Due Amount</p>
                          <p className="text-xl font-bold text-red-600">
                            ₹{item.dueAmount.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => fetchStudentFeeDetails(item.studentId._id)}
                          className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                        >
                          Receive Payment
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No students with due fees found
              </div>
            )}
          </div>
        </>
      ) : (
        /* Payment Form View */
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <button
            onClick={() => {
              setSelectedStudent(null);
              setFeeDetails(null);
            }}
            className="text-purple-600 hover:text-purple-800 mb-4"
          >
            ← Back to Students
          </button>

          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : feeDetails && (
            <div className="space-y-6">
              {/* Fee Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Total Fee</p>
                  <p className="text-xl font-bold">₹{feeDetails.studentFee.totalFee}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Paid Amount</p>
                  <p className="text-xl font-bold text-green-600">
                    ₹{feeDetails.studentFee.paidAmount}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Due Amount</p>
                  <p className="text-xl font-bold text-red-600">
                    ₹{feeDetails.studentFee.dueAmount}
                  </p>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={paymentData.amountPaid}
                    onChange={(e) => setPaymentData({
                      ...paymentData,
                      amountPaid: e.target.value
                    })}
                    className="w-full md:w-1/2 border p-2 rounded"
                    min="1"
                    max={feeDetails.studentFee.dueAmount}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max amount: ₹{feeDetails.studentFee.dueAmount}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Mode
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['cash', 'card', 'bank', 'upi'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPaymentData({
                          ...paymentData,
                          paymentMode: mode
                        })}
                        className={`p-3 border rounded flex flex-col items-center gap-2 transition-colors
                          ${paymentData.paymentMode === mode 
                            ? 'bg-purple-600 text-white border-purple-600' 
                            : 'hover:bg-gray-50'
                          }`}
                      >
                        <span className="text-xl">
                          {getPaymentIcon(mode)}
                        </span>
                        <span className="text-sm capitalize">{mode}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 text-lg font-medium"
                  >
                    Process Payment
                  </button>
                </div>
              </form>

              {/* Payment History */}
              {feeDetails.payments?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Payment History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[400px]">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left">Date</th>
                          <th className="p-2 text-left">Amount</th>
                          <th className="p-2 text-left">Mode</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeDetails.payments.map((payment, index) => (
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
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}