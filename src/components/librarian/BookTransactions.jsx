import { useEffect, useState } from "react";
import API from "../../api/api";
import { successAlert, errorAlert } from "../../utils/swal";
import { 
  FaPlus, FaUndo, FaList, FaSearch, FaFilter,
  FaBook, FaUser, FaCalendar, FaMoneyBill,
  FaCheck, FaTimes, FaExclamationTriangle
} from "react-icons/fa";
import Swal from 'sweetalert2';

export default function BookTransactions() {
  const [activeTab, setActiveTab] = useState("issue");
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Search states
  const [studentSearch, setStudentSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showBookDropdown, setShowBookDropdown] = useState(false);
  
  // Form states
  const [issueForm, setIssueForm] = useState({
    studentId: "",
    studentName: "",
    bookId: "",
    bookTitle: "",
    dueDate: ""
  });

  // Fetch data on mount
  useEffect(() => {
    if (activeTab === "issue") {
      fetchBooks();
      fetchStudents();
    } else if (activeTab === "list" || activeTab === "return") {
      fetchIssues();
    }
  }, [activeTab, statusFilter]);

  // Filter students based on search
  useEffect(() => {
    if (studentSearch) {
      const filtered = students.filter(s =>
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.rollNo?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.email.toLowerCase().includes(studentSearch.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [studentSearch, students]);

  // Filter books based on search
  useEffect(() => {
    if (bookSearch) {
      const filtered = books.filter(b =>
        b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.isbn.toLowerCase().includes(bookSearch.toLowerCase())
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(books);
    }
  }, [bookSearch, books]);

  const fetchBooks = async () => {
    try {
      const res = await API.get("/librarian/books?isActive=true&limit=100");
      setBooks(res.data.books.filter(b => b.availableQuantity > 0));
      setFilteredBooks(res.data.books.filter(b => b.availableQuantity > 0));
    } catch (err) {
      errorAlert("Error", "Failed to load books");
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await API.get("/librarian/students");
      setStudents(res.data.students);
      setFilteredStudents(res.data.students);
    } catch (err) {
      errorAlert("Error", "Failed to load students");
    }
  };

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const res = await API.get(`/librarian/issues?${params}`);
      setIssues(res.data.issues);
    } catch (err) {
      errorAlert("Error", "Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();

    if (!issueForm.studentId || !issueForm.bookId) {
      return errorAlert("Required", "Please select student and book");
    }

    try {
      setLoading(true);
      await API.post("/librarian/issue", {
        studentId: issueForm.studentId,
        bookId: issueForm.bookId,
        dueDate: issueForm.dueDate || undefined
      });
      
      successAlert("Success", "Book issued successfully");
      setIssueForm({ 
        studentId: "", studentName: "", 
        bookId: "", bookTitle: "", 
        dueDate: "" 
      });
      fetchBooks();
      fetchIssues();
      setActiveTab("list");
    } catch (err) {
      errorAlert("Error", err.response?.data?.message || "Failed to issue book");
    } finally {
      setLoading(false);
    }
  };

  const selectStudent = (student) => {
    setIssueForm({
      ...issueForm,
      studentId: student._id,
      studentName: `${student.name} (${student.rollNo} - ${student.className} ${student.section})`
    });
    setStudentSearch("");
    setShowStudentDropdown(false);
  };

  const selectBook = (book) => {
    setIssueForm({
      ...issueForm,
      bookId: book._id,
      bookTitle: `${book.title} by ${book.author} (Available: ${book.availableQuantity})`
    });
    setBookSearch("");
    setShowBookDropdown(false);
  };

  const handleReturn = async (issueId) => {
    const result = await Swal.fire({
      title: 'Return Book',
      text: 'Are you sure this book is being returned?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, return'
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const res = await API.put(`/librarian/return/${issueId}`);
      
      let message = "Book returned successfully";
      if (res.data.fineAmount > 0) {
        message += ` with fine of ₹${res.data.fineAmount}`;
      }
      
      successAlert("Success", message);
      fetchIssues();
      fetchBooks();
    } catch (err) {
      errorAlert("Error", err.response?.data?.message || "Failed to return book");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (issue) => {
    const now = new Date();
    const dueDate = new Date(issue.dueDate);
    
    if (issue.status === "returned") {
      return { text: "Returned", class: "bg-gray-100 text-gray-600" };
    } else if (issue.status === "overdue" || dueDate < now) {
      return { text: "Overdue", class: "bg-red-100 text-red-600" };
    } else {
      return { text: "Issued", class: "bg-green-100 text-green-600" };
    }
  };

  const calculateFine = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    if (now > due) {
      const days = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
      return days * 5; // ₹5 per day - should come from settings
    }
    return 0;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with Tabs */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Book Transactions
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-2 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("issue")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === "issue" 
              ? "bg-purple-600 text-white" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FaPlus /> Issue Book
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === "list" 
              ? "bg-purple-600 text-white" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FaList /> Issued Books
        </button>
        <button
          onClick={() => setActiveTab("return")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === "return" 
              ? "bg-purple-600 text-white" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FaUndo /> Return Book
        </button>
      </div>

      {/* ISSUE BOOK TAB */}
      {activeTab === "issue" && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Issue New Book</h2>
          
          <form onSubmit={handleIssueSubmit} className="space-y-4">
            {/* Student Search Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Student <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-purple-500">
                  <FaUser className="ml-3 text-gray-400" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => {
                      setStudentSearch(e.target.value);
                      setShowStudentDropdown(true);
                    }}
                    onFocus={() => setShowStudentDropdown(true)}
                    placeholder="Search by name, roll number or email..."
                    className="w-full p-2.5 pl-2 rounded-lg focus:outline-none"
                  />
                </div>
                
                {/* Selected Student Display */}
                {issueForm.studentName && !showStudentDropdown && (
                  <div className="mt-2 p-2 bg-purple-50 rounded-lg flex justify-between items-center">
                    <span className="text-sm text-purple-700">{issueForm.studentName}</span>
                    <button
                      type="button"
                      onClick={() => setIssueForm({...issueForm, studentId: "", studentName: ""})}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}

                {/* Student Dropdown */}
                {showStudentDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(student => (
                        <div
                          key={student._id}
                          onClick={() => selectStudent(student)}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        >
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-600">
                            Roll: {student.rollNo} | Class: {student.className} {student.section}
                          </p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                      ))
                    ) : (
                      <p className="p-3 text-gray-500 text-center">No students found</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Book Search Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Book <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-purple-500">
                  <FaBook className="ml-3 text-gray-400" />
                  <input
                    type="text"
                    value={bookSearch}
                    onChange={(e) => {
                      setBookSearch(e.target.value);
                      setShowBookDropdown(true);
                    }}
                    onFocus={() => setShowBookDropdown(true)}
                    placeholder="Search by title, author or ISBN..."
                    className="w-full p-2.5 pl-2 rounded-lg focus:outline-none"
                  />
                </div>

                {/* Selected Book Display */}
                {issueForm.bookTitle && !showBookDropdown && (
                  <div className="mt-2 p-2 bg-purple-50 rounded-lg flex justify-between items-center">
                    <span className="text-sm text-purple-700">{issueForm.bookTitle}</span>
                    <button
                      type="button"
                      onClick={() => setIssueForm({...issueForm, bookId: "", bookTitle: ""})}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}

                {/* Book Dropdown */}
                {showBookDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredBooks.length > 0 ? (
                      filteredBooks.map(book => (
                        <div
                          key={book._id}
                          onClick={() => selectBook(book)}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        >
                          <p className="font-medium">{book.title}</p>
                          <p className="text-sm text-gray-600">by {book.author}</p>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-gray-500">ISBN: {book.isbn}</span>
                            <span className={book.availableQuantity > 0 ? "text-green-600" : "text-red-600"}>
                              Available: {book.availableQuantity}/{book.quantity}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="p-3 text-gray-500 text-center">No books available</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date (Optional)
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-purple-500">
                <FaCalendar className="ml-3 text-gray-400" />
                <input
                  type="date"
                  value={issueForm.dueDate}
                  onChange={(e) => setIssueForm({...issueForm, dueDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2.5 pl-2 rounded-lg focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for default {14} days (from library settings)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !issueForm.studentId || !issueForm.bookId}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Issue Book"}
            </button>
          </form>
        </div>
      )}

      {/* LIST ISSUED BOOKS TAB */}
      {activeTab === "list" && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row justify-between gap-4">
            <h2 className="text-lg font-semibold">Issued Books</h2>
            
            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 p-2 rounded-lg text-sm"
              >
                <option value="all">All</option>
                <option value="issued">Issued</option>
                <option value="overdue">Overdue</option>
                <option value="returned">Returned</option>
              </select>
              
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Student</th>
                    <th className="p-3 text-left">Book</th>
                    <th className="p-3 text-left">Issue Date</th>
                    <th className="p-3 text-left">Due Date</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Fine</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {issues
                    .filter(i => 
                      i.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      i.bookId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((issue) => {
                      const status = getStatusBadge(issue);
                      const fine = calculateFine(issue.dueDate);
                      
                      return (
                        <tr key={issue._id} className="border-t hover:bg-gray-50">
                          <td className="p-3">
                            <p className="font-medium">{issue.studentId?.name}</p>
                            <p className="text-xs text-gray-500">Roll: {issue.studentId?.rollNo}</p>
                          </td>
                          <td className="p-3">
                            <p className="font-medium">{issue.bookId?.title}</p>
                            <p className="text-xs text-gray-500">by {issue.bookId?.author}</p>
                          </td>
                          <td className="p-3">
                            {new Date(issue.issueDate).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            {new Date(issue.dueDate).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${status.class}`}>
                              {status.text}
                            </span>
                          </td>
                          <td className="p-3">
                            {fine > 0 && status.text !== "Returned" && (
                              <span className="text-red-600 font-medium">₹{fine}</span>
                            )}
                            {issue.fineAmount > 0 && issue.status === "returned" && (
                              <span className="text-gray-600">₹{issue.fineAmount} (Paid)</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {status.text !== "Returned" && (
                              <button
                                onClick={() => handleReturn(issue._id)}
                                className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
                              >
                                Return
                              </button>
                            )}
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

      {/* RETURN BOOK TAB */}
      {activeTab === "return" && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Return</h2>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Search and return issued books quickly. Click on any book to return.
            </p>

            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name, book title or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {issues
                .filter(i => i.status !== "returned")
                .filter(i => 
                  i.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  i.bookId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  i.bookId?.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((issue) => {
                  const fine = calculateFine(issue.dueDate);
                  
                  return (
                    <div
                      key={issue._id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleReturn(issue._id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{issue.bookId?.title}</p>
                          <p className="text-sm text-gray-600">
                            Issued to: {issue.studentId?.name} ({issue.studentId?.rollNo})
                          </p>
                          <p className="text-xs text-gray-500">
                            Due: {new Date(issue.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        {fine > 0 && (
                          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
                            Fine: ₹{fine}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}