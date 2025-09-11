import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";

function CreateExpense() {
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paymentTo, setPaymentTo] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [message, setMessage] = useState("");

  // ✅ Fetch Branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("No token found! Please login again.");
          return;
        }
        const res = await axios.get("/branches", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBranches(res.data);
      } catch (error) {
        console.error("Error fetching branches:", error);
        alert("Failed to load branches");
      }
    };
    fetchBranches();
  }, []);

  // ✅ Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("No token found! Please login again.");
          return;
        }
        const res = await axios.get("/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        alert("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  // ✅ Submit Expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found! Please login again.");
        return;
      }

      const payload = {
        branch_id: Number(branchId),
        category_id: Number(categoryId),
        payment_to: paymentTo,
        expense_date: expenseDate,
        description: description,
        amount: Number(amount),
        payment_mode: paymentMode,
      };

      const res = await axios.post("/expenses", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(`✅ Expense Created: ID ${res.data.id}`);
      // reset form
      setBranchId("");
      setCategoryId("");
      setPaymentTo("");
      setExpenseDate("");
      setDescription("");
      setAmount("");
      setPaymentMode("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error creating expense");
    }
  };

  return (
    <div className="items-center flex justify-center mt-10">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Expense</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Branch Dropdown */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Select Branch
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">-- Select Branch --</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.branch_name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Select Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment To */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Payment To
            </label>
            <input
              type="text"
              placeholder="Vendor / Person"
              value={paymentTo}
              onChange={(e) => setPaymentTo(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Expense Date */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Expense Date
            </label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Description
            </label>
            <textarea
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Amount
            </label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Payment Mode
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">-- Select Mode --</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Save Expense
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateExpense;
