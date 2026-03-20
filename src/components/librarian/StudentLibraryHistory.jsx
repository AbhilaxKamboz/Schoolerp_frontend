import { useEffect, useState } from "react";
import API from "../../api/api";
import { errorAlert } from "../../utils/swal";
import { 
  FaSearch, FaUser, FaBook, FaHistory,
  FaCalendar, FaMoneyBill, FaEye, FaTimes
} from "react-icons/fa";

export default function StudentLibraryHistory() {
  const [view, setView] = useState("student"); // student, book
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Fetch students for dropdown
  useEffect(() => {
    fetchStudents();
    fetchBooks();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await API.get("/librarian/students");
      setStudents(res.data.students);
    } catch (err) {
      errorAlert("Error", "Failed to load students");
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await API.get("/librarian/books?limit=100");
      setBooks(res.data.books);
    } catch (err) {
      errorAlert("Error", "Failed to load books");
    }
  };

  const fetchStudentHistory = async (studentId) => {
    try {
      setLoading(true);
      const res = await API.get(`/librarian/student/${studentId}/history`);
      setHistory(res.data.issues);
      setStats(res.data.stats);
      setSelectedStudent(students.find(s => s._id === studentId));
    } catch (err) {
      errorAlert("Error", "Failed to load student history");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookDetails = async (bookId) => {
    try {
      setLoading(true);
      const res = await API.get(`/librarian/books/${bookId}`);
      setSelectedBook(res.data.book);
      setHistory(res.data.currentIssues || []);
    } catch (err) {
      errorAlert("Error", "Failed to load book details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (issue) => {
    const now = new Date();
    const dueDate = new Date(issue.dueDate);
    
    if (issue.status === "returned") {
      return { text: "Returned", class: "bg-gray-100 text-gray-600" };
    } else if (dueDate < now) {
      return { text: "Overdue", class: "bg-red-100 text-red-600" };
    } else {
      return { text: "Issued", class: "bg-green-100 text-green-600" };
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
        Library History
      </h1>

      {/* View Toggle */}
      <div className="bg-white rounded-xl shadow-lg p-2 flex gap-2">
        <button
          onClick={() => setView("student")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            view === "student" 
              ? "bg-purple-600 text-white" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FaUser /> Student History
        </button>
        <button
          onClick={() => setView("book")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            view === "book" 
              ? "bg-purple-600 text-white" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FaBook /> Book Details
        </button>
      </div>

      {/* Search and Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={view === "student" 
              ? "Search by student name or roll number..." 
              : "Search by book title, author or ISBN..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {view === "student" ? (
          // Student List
          <div className="max-h-80 overflow-y-auto space-y-2">
            {filteredStudents.map(student => (
              <button
                key={student._id}
                onClick={() => fetchStudentHistory(student._id)}
                className="w-full p-4 border rounded-lg hover:bg-purple-50 text-left transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-600">
                      Roll: {student.rollNo} | Class: {student.className} {student.section}
                    </p>
                  </div>
                  <FaEye className="text-purple-600" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          // Book List
          <div className="max-h-80 overflow-y-auto space-y-2">
            {filteredBooks.map(book => (
              <button
                key={book._id}
                onClick={() => fetchBookDetails(book._id)}
                className="w-full p-4 border rounded-lg hover:bg-purple-50 text-left transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{book.title}</p>
                    <p className="text-sm text-gray-600">
                      by {book.author} | ISBN: {book.isbn}
                    </p>
                    <p className="text-xs text-gray-500">
                      Available: {book.availableQuantity}/{book.quantity}
                    </p>
                  </div>
                  <FaEye className="text-purple-600" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* History/Details Display */}
      {(selectedStudent || selectedBook) && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
            <h2 className="text-xl font-semibold">
              {selectedStudent ? selectedStudent.name : selectedBook?.title}
            </h2>
            <p className="text-purple-100 text-sm">
              {selectedStudent 
                ? `Roll: ${selectedStudent.rollNo} | Class: ${selectedStudent.className} ${selectedStudent.section}`
                : `by ${selectedBook?.author} | ISBN: ${selectedBook?.isbn}`
              }
            </p>
          </div>

          {/* Statistics (for students) */}
          {stats && (
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-b">
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Issued</p>
                <p className="text-2xl font-bold">{stats.totalIssued}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Currently Issued</p>
                <p className="text-2xl font-bold text-blue-600">{stats.currentlyIssued}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Returned</p>
                <p className="text-2xl font-bold text-green-600">{stats.returned}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Fine</p>
                <p className="text-2xl font-bold text-red-600">₹{stats.totalFine}</p>
              </div>
            </div>
          )}

          {/* History List */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">
                      {selectedStudent ? 'Book' : 'Student'}
                    </th>
                    <th className="p-3 text-left">Issue Date</th>
                    <th className="p-3 text-left">Due Date</th>
                    <th className="p-3 text-left">Return Date</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Fine</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((issue) => {
                    const status = getStatusBadge(issue);
                    return (
                      <tr key={issue._id} className="border-t hover:bg-gray-50">
                        <td className="p-3">
                          {selectedStudent 
                            ? issue.bookId?.title
                            : issue.studentId?.name
                          }
                        </td>
                        <td className="p-3">
                          {new Date(issue.issueDate).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          {new Date(issue.dueDate).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          {issue.returnDate 
                            ? new Date(issue.returnDate).toLocaleDateString()
                            : '-'
                          }
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${status.class}`}>
                            {status.text}
                          </span>
                        </td>
                        <td className="p-3">
                          {issue.fineAmount > 0 && (
                            <span className="text-red-600">₹{issue.fineAmount}</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedIssue(issue);
                              setShowDetailsModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-t-xl flex justify-between">
              <h3 className="text-lg font-semibold">Transaction Details</h3>
              <button onClick={() => setShowDetailsModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Book</p>
                  <p className="font-medium">{selectedIssue.bookId?.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Student</p>
                  <p className="font-medium">{selectedIssue.studentId?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Issue Date</p>
                  <p>{new Date(selectedIssue.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p>{new Date(selectedIssue.dueDate).toLocaleDateString()}</p>
                </div>
                {selectedIssue.returnDate && (
                  <div>
                    <p className="text-sm text-gray-500">Return Date</p>
                    <p>{new Date(selectedIssue.returnDate).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    getStatusBadge(selectedIssue).class
                  }`}>
                    {getStatusBadge(selectedIssue).text}
                  </span>
                </div>
                {selectedIssue.fineAmount > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Fine Amount</p>
                    <p className="text-red-600 font-bold">₹{selectedIssue.fineAmount}</p>
                  </div>
                )}
                {selectedIssue.remarks && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Remarks</p>
                    <p>{selectedIssue.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}