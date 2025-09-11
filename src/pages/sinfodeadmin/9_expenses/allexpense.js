import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";

function AllExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState({ isOpen: false, expense: null });
  const [editForm, setEditForm] = useState({
    payment_to: "",
    amount: "",
    payment_mode: "",
    expense_date: "",
    description: ""
  });
  const [showDropdown, setShowDropdown] = useState(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("No token found! Please login again.");
          return;
        }

        const res = await axios.get("/expenses", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.status) {
          setExpenses(res.data.data);
        } else {
          alert("Failed to fetch expenses");
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
        alert("Something went wrong while fetching expenses");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  // Unique branches for dropdown
  const branches = ["all", ...new Set(expenses.map((exp) => exp.branch_name))];

  // Filtered data
  const filteredExpenses =
    selectedBranch === "all"
      ? expenses
      : expenses.filter((exp) => exp.branch_name === selectedBranch);

  // Handle delete expense
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setExpenses(expenses.filter(exp => exp.id !== id));
      setShowDropdown(null);
      alert("Expense deleted successfully!");
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense");
    }
  };

  // Handle update expense
  const handleUpdate = (expense) => {
    setEditModal({ isOpen: true, expense });
    setEditForm({
      payment_to: expense.payment_to,
      amount: expense.amount,
      payment_mode: expense.payment_mode,
      expense_date: expense.expense_date,
      description: expense.description || ""
    });
    setShowDropdown(null);
  };

  // Handle save updated expense
  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const { id } = editModal.expense;
      
      const res = await axios.put(`/expenses/${id}`, 
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setExpenses(expenses.map(exp => 
        exp.id === id ? { ...exp, ...editForm } : exp
      ));
      
      setEditModal({ isOpen: false, expense: null });
      alert("Expense updated successfully!");
    } catch (error) {
      console.error("Error updating expense:", error);
      alert("Failed to update expense");
    }
  };

  // Toggle dropdown menu
  const toggleDropdown = (id) => {
    setShowDropdown(showDropdown === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white">
            <h2 className="text-3xl font-bold mb-2">All Expenses</h2>
            <p className="text-purple-100">Manage and track your business expenses</p>
          </div>

          {/* Filters Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800">
                All Expenses ({filteredExpenses.length})
              </h2>

              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full md:w-64"
              >
                {branches.map((branch, i) => (
                  <option key={i} value={branch}>
                    {branch === "all" ? "All Branches" : branch}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No expenses found</h3>
                <p className="mt-1 text-gray-500">Try adjusting your filter to find what you're looking for.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="bg-white shadow-sm hover:shadow-md transition rounded-xl p-5 relative"
                  >
                    {/* Actions Dropdown */}
                    <div className="absolute top-4 right-4">
                      <button 
                        onClick={() => toggleDropdown(exp.id)}
                        className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      </button>
                      
                      {showDropdown === exp.id && (
                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <button
                              onClick={() => handleUpdate(exp)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              role="menuitem"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(exp.id)}
                              className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                              role="menuitem"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Category Title */}
                    <h3 className="font-semibold text-gray-800 text-lg mb-2">
                      {exp.category}
                    </h3>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Branch:</span>{" "}
                        {exp.branch_name}
                      </p>
                      <p>
                        <span className="font-medium">Payment To:</span>{" "}
                        {exp.payment_to}
                      </p>
                      <p>
                        <span className="font-medium">Mode:</span>{" "}
                        {exp.payment_mode}
                      </p>
                      <p>
                        <span className="font-medium">Date:</span> {exp.date}
                      </p>
                      <p className="md:col-span-2">
                        <span className="font-medium">Description:</span>{" "}
                        {exp.description || "-"}
                      </p>
                    </div>

                    {/* Amount Highlight */}
                    <div className="mt-3 border-t pt-2">
                      <p className="text-lg font-bold text-purple-600">
                        ₹{exp.amount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Expense</h3>
              <form onSubmit={handleSaveUpdate}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="payment_to">
                    Payment To
                  </label>
                  <input
                    type="text"
                    id="payment_to"
                    value={editForm.payment_to}
                    onChange={(e) => setEditForm({...editForm, payment_to: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                    Amount
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="payment_mode">
                    Payment Mode
                  </label>
                  <select
                    id="payment_mode"
                    value={editForm.payment_mode}
                    onChange={(e) => setEditForm({...editForm, payment_mode: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Select Payment Mode</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expense_date">
                    Date
                  </label>
                  <input
                    type="date"
                    id="expense_date"
                    value={editForm.expense_date}
                    onChange={(e) => setEditForm({...editForm, expense_date: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows="3"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setEditModal({ isOpen: false, expense: null })}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllExpenses;