import { useEffect, useState } from "react";
import API from "../../api/api";
import { errorAlert } from "../../utils/swal";
import { 
  FaBook, FaHistory, FaExclamationTriangle, 
  FaCalendarAlt, FaMoneyBill, FaEye,
  FaChevronLeft, FaChevronRight, FaSearch,
  FaFilter, FaTimes, FaBookOpen
} from "react-icons/fa";

export default function StudentLibrary() {
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState("current"); // current, history
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const fetchMyBooks = async () => {
    try {
      setLoading(true);
      const res = await API.get("/student/my-books");
      setIssuedBooks(res.data.currentIssues || []);
      setHistory(res.data.history || []);
      setStats(res.data.stats);
    } catch (err) {
      errorAlert("Error", "Failed to load library data");
    } finally {
      setLoading(false);
    }
  };

  const viewBookDetails = async (issueId) => {
    try {
      const res = await API.get(`/student/book-issue/${issueId}`);
      setSelectedBook(res.data);
      setShowDetailsModal(true);
    } catch (err) {
      errorAlert("Error", "Failed to load book details");
    }
  };

  const getStatusBadge = (book) => {
    if (book.isOverdue) {
      return {
        text: 'Overdue',
        class: 'bg-red-100 text-red-600',
        icon: <FaExclamationTriangle />
      };
    } else if (book.status === 'issued') {
      return {
        text: 'Issued',
        class: 'bg-green-100 text-green-600',
        icon: <FaBook />
      };
    } else {
      return {
        text: 'Returned',
        class: 'bg-gray-100 text-gray-600',
        icon: <FaHistory />
      };
    }
  };

  const getDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    return `${diffDays} days left`;
  };

  const filteredBooks = issuedBooks.filter(book => 
    book.bookId?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.bookId?.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
        My Library
      </h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4">
            <p className="text-xs opacity-90">Total Issued</p>
            <p className="text-2xl font-bold">{stats.totalIssued}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4">
            <p className="text-xs opacity-90">Currently Issued</p>
            <p className="text-2xl font-bold">{stats.currentlyIssued}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-4">
            <p className="text-xs opacity-90">Overdue</p>
            <p className="text-2xl font-bold">{stats.overdue}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-4">
            <p className="text-xs opacity-90">Total Fine</p>
            <p className="text-2xl font-bold">₹{stats.totalFine}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-2 flex gap-2">
        <button
          onClick={() => setActiveTab("current")}
          className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
            activeTab === "current" 
              ? "bg-green-600 text-white" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Current Issues
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
            activeTab === "history" 
              ? "bg-green-600 text-white" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          History
        </button>
      </div>

      {/* Search Bar - for current issues */}
      {activeTab === "current" && (
        <div className="bg-white p-4 rounded-xl shadow-lg">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by book title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      )}

      {/* Current Issues Tab */}
      {activeTab === "current" && (
        <div className="space-y-4">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book) => {
              const status = getStatusBadge(book);
              return (
                <div
                  key={book._id}
                  className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{book.bookId?.title}</h3>
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${status.class}`}>
                          {status.icon}
                          {status.text}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">by {book.bookId?.author}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Issue Date</p>
                          <p className="font-medium">{new Date(book.issueDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Due Date</p>
                          <p className={`font-medium ${book.isOverdue ? 'text-red-600' : ''}`}>
                            {new Date(book.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {!book.isOverdue && book.status === 'issued' && (
                        <p className="text-sm text-orange-600 mt-2">
                          {getDaysLeft(book.dueDate)}
                        </p>
                      )}

                      {book.calculatedFine > 0 && (
                        <p className="text-sm text-red-600 mt-2 font-medium">
                          Fine: ₹{book.calculatedFine}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => viewBookDetails(book._id)}
                      className="md:self-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                    >
                      <FaEye /> View Details
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <FaBookOpen className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No books issued</p>
              <p className="text-sm text-gray-400 mt-1">
                Visit the library to issue books
              </p>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Book</th>
                    <th className="p-3 text-left">Issue Date</th>
                    <th className="p-3 text-left">Return Date</th>
                    <th className="p-3 text-left">Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item._id} className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        <p className="font-medium">{item.bookId?.title}</p>
                        <p className="text-sm text-gray-500">{item.bookId?.author}</p>
                      </td>
                      <td className="p-3">
                        {new Date(item.issueDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        {item.returnDate 
                          ? new Date(item.returnDate).toLocaleDateString()
                          : '-'
                        }
                      </td>
                      <td className="p-3">
                        {item.fineAmount > 0 ? (
                          <span className="text-red-600 font-medium">₹{item.fineAmount}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <FaHistory className="text-4xl mx-auto mb-3 text-gray-300" />
              <p>No history found</p>
            </div>
          )}
        </div>
      )}

      {/* Book Details Modal */}
      {showDetailsModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 bg-gradient-to-r from-green-600 to-green-800 text-white rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Book Details</h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedBook(null);
                  }}
                  className="text-white hover:text-gray-200"
                >
                  <FaTimes size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-xl">{selectedBook.issue?.bookId?.title}</h3>
                <p className="text-gray-600">by {selectedBook.issue?.bookId?.author}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">ISBN</p>
                  <p className="font-mono text-sm">{selectedBook.issue?.bookId?.isbn}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p>{selectedBook.issue?.bookId?.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Issue Date</p>
                  <p>{new Date(selectedBook.issue?.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className={selectedBook.isOverdue ? 'text-red-600 font-medium' : ''}>
                    {new Date(selectedBook.issue?.dueDate).toLocaleDateString()}
                  </p>
                </div>
                {selectedBook.calculatedFine > 0 && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Fine Amount</p>
                    <p className="text-red-600 font-bold">₹{selectedBook.calculatedFine}</p>
                  </div>
                )}
              </div>

              {selectedBook.issue?.bookId?.description && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700">{selectedBook.issue?.bookId?.description}</p>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedBook(null);
                  }}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
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