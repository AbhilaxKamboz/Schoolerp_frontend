import { useEffect, useState } from "react";
import API from "../../api/api";
import { successAlert, errorAlert } from "../../utils/swal";
import { 
  FaBook, FaPlus, FaEdit, FaTrash, FaSearch,
  FaFilter, FaEye, FaTimes, FaSave
} from "react-icons/fa";
import Swal from 'sweetalert2';

export default function BooksManagement() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [viewingBook, setViewingBook] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  // Form state for Add/Edit Modal
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    publicationYear: "",
    category: "Other",
    quantity: 1,
    shelfLocation: "",
    description: ""
  });

  // Categories for filter dropdown
  const categories = [
    "Textbook", "Reference", "Fiction", "Non-Fiction", "Magazine", "Other"
  ];

  // Fetch books on mount and when filters change
  useEffect(() => {
    fetchBooks();
  }, [pagination.page, categoryFilter]);

  // Filter books based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(books);
    }
  }, [searchTerm, books]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10
      });
      if (categoryFilter) params.append('category', categoryFilter);

      const res = await API.get(`/librarian/books?${params}`);
      setBooks(res.data.books);
      setFilteredBooks(res.data.books);
      setPagination({
        page: res.data.page,
        totalPages: res.data.totalPages,
        total: res.data.total
      });
    } catch (err) {
      errorAlert("Error", "Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (book) => {
    // Check if book can be deleted
    if (book.availableQuantity < book.quantity) {
      return errorAlert("Cannot Delete", 
        "This book is currently issued to students. Please return them first."
      );
    }

    const result = await Swal.fire({
      title: 'Delete Book',
      text: `Are you sure you want to delete "${book.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete'
    });

    if (!result.isConfirmed) return;

    try {
      await API.delete(`/librarian/books/${book._id}`);
      successAlert("Deleted", "Book deleted successfully");
      fetchBooks();
    } catch (err) {
      errorAlert("Error", err.response?.data?.message || "Failed to delete");
    }
  };

  const viewBookDetails = (book) => {
    setViewingBook(book);
    setShowViewModal(true);
  };

  // Handle Add/Edit Modal Open
  const openAddEditModal = (book = null) => {
    if (book) {
      // Edit mode
      setEditingBook(book);
      setForm({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        publisher: book.publisher || "",
        publicationYear: book.publicationYear || "",
        category: book.category || "Other",
        quantity: book.quantity,
        shelfLocation: book.shelfLocation || "",
        description: book.description || ""
      });
    } else {
      // Add mode
      setEditingBook(null);
      setForm({
        title: "",
        author: "",
        isbn: "",
        publisher: "",
        publicationYear: "",
        category: "Other",
        quantity: 1,
        shelfLocation: "",
        description: ""
      });
    }
    setShowAddModal(true);
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submit (Add/Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.title || !form.author || !form.isbn) {
      return errorAlert("Required", "Title, author and ISBN are required");
    }

    try {
      setLoading(true);
      
      if (editingBook) {
        // Update existing book
        await API.put(`/librarian/books/${editingBook._id}`, form);
        successAlert("Success", "Book updated successfully");
      } else {
        // Create new book
        await API.post("/librarian/books", form);
        successAlert("Success", "Book added successfully");
      }
      
      // Close modal and refresh
      setShowAddModal(false);
      setEditingBook(null);
      fetchBooks();
    } catch (err) {
      errorAlert("Error", err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !showAddModal) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Books Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all books in the library
          </p>
        </div>
        <button
          onClick={() => openAddEditModal()}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <FaPlus /> Add New Book
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-lg space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, author or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <FaFilter /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border p-2 rounded-lg"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setCategoryFilter("");
                  setSearchTerm("");
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Author</th>
                <th className="p-3 text-left">ISBN</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-center">Total</th>
                <th className="p-3 text-center">Available</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{book.title}</td>
                  <td className="p-3">{book.author}</td>
                  <td className="p-3 font-mono text-sm">{book.isbn}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs">
                      {book.category}
                    </span>
                  </td>
                  <td className="p-3 text-center">{book.quantity}</td>
                  <td className="p-3 text-center">
                    <span className={`font-bold ${
                      book.availableQuantity > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {book.availableQuantity}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => viewBookDetails(book)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => openAddEditModal(book)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteBook(book)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Total {pagination.total} books
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                disabled={pagination.page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-purple-600 text-white rounded-lg">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========== ADD/EDIT BOOK MODAL ========== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-purple-600 to-purple-800 text-white sticky top-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editingBook ? "Edit Book" : "Add New Book"}
                </h2>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingBook(null);
                  }} 
                  className="hover:text-gray-200"
                >
                  <FaTimes size={24} />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                {/* Author */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={form.author}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                {/* ISBN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ISBN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="isbn"
                    value={form.isbn}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                    disabled={!!editingBook} // ISBN can't be changed after creation
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Publisher */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publisher
                  </label>
                  <input
                    type="text"
                    name="publisher"
                    value={form.publisher}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Publication Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publication Year
                  </label>
                  <input
                    type="number"
                    name="publicationYear"
                    value={form.publicationYear}
                    onChange={handleFormChange}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleFormChange}
                    min="1"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Shelf Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shelf Location
                  </label>
                  <input
                    type="text"
                    name="shelfLocation"
                    value={form.shelfLocation}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., A-12, B-5"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    rows="4"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FaSave /> {loading ? "Saving..." : (editingBook ? "Update Book" : "Add Book")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingBook(null);
                  }}
                  className="flex-1 bg-gray-500 text-white py-2.5 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== VIEW BOOK DETAILS MODAL ========== */}
      {showViewModal && viewingBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Book Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-white hover:text-gray-200"
                >
                  <FaTimes size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="font-medium">{viewingBook.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Author</p>
                  <p className="font-medium">{viewingBook.author}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ISBN</p>
                  <p className="font-mono">{viewingBook.isbn}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Publisher</p>
                  <p>{viewingBook.publisher || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs">
                    {viewingBook.category}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Shelf Location</p>
                  <p>{viewingBook.shelfLocation || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Quantity</p>
                  <p className="font-bold">{viewingBook.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available</p>
                  <p className={`font-bold ${
                    viewingBook.availableQuantity > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {viewingBook.availableQuantity}
                  </p>
                </div>
              </div>
              {viewingBook.description && (
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-700">{viewingBook.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}