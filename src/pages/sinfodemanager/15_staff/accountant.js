import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";
import {
  FaEdit,
  FaEye,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Accountant() {
  const [accountantList, setAccountantList] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingAccountantId, setEditingAccountantId] = useState(null);
  const navigate = useNavigate();

  // Form data for accountant
  const [formData, setFormData] = useState({
    accountant_name: "",
    accountant_code: "",
    joining_date: "",
    contact_number: "",
    email: "",
    department: "",
    attendance_status: "Present",
    branch_id: "",
    monthly_salary: "",
    acccreate_name: "",
    acccreate_email: "",
    acccreate_password: ""
  });

  // Fetch accountants list
  const fetchAccountants = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found! Please login again.");
        return;
      }
      const res = await axios.get("/accountants", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle both array and object response formats
      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      }
      
      setAccountantList(data);
    } catch (error) {
      console.error("Error fetching accountants:", error);
      alert("Failed to load accountants list");
    }
  };

  useEffect(() => {
    fetchAccountants();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Toggle attendance status
  const toggleAttendance = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = currentStatus === "Present" ? "Absent" : "Present";

      await axios.put(
        `/accountants/${id}`,
        { attendance_status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAccountantList(
        accountantList.map((accountant) =>
          accountant.id === id ? { ...accountant, attendance_status: newStatus } : accountant
        )
      );
      alert(`Attendance status changed to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update attendance");
    }
  };

  // Delete accountant
  const deleteAccountant = async (id) => {
    if (window.confirm("Are you sure you want to delete this accountant?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/accountants/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Accountant deleted successfully!");
        fetchAccountants();
      } catch (error) {
        console.error("Error deleting accountant:", error);
        alert("Failed to delete accountant");
      }
    }
  };

  // Search filter
  const filteredAccountants = accountantList.filter(
    (accountant) =>
      (accountant.accountant_name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (accountant.department || "").toLowerCase().includes(search.toLowerCase()) ||
      (accountant.accountant_code || "").toLowerCase().includes(search.toLowerCase())
  );

  // Edit click
  const handleEditClick = (accountant) => {
    setEditingAccountantId(accountant.id);
    setFormData({
      accountant_name: accountant.accountant_name,
      accountant_code: accountant.accountant_code,
      joining_date: accountant.joining_date,
      contact_number: accountant.contact_number,
      email: accountant.email,
      department: accountant.department,
      attendance_status: accountant.attendance_status,
      branch_id: accountant.branch_id,
      monthly_salary: accountant.monthly_salary,
      acccreate_name: accountant.user?.email || "",
      acccreate_email: accountant.user?.email || "",
      acccreate_password: "" // Don't prefill password for security
    });
    setIsModalOpen(true);
  };

  // Create/Update submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (editingAccountantId) {
        // Update - exclude user creation fields for update
        const { acccreate_name, acccreate_email, acccreate_password, ...updateData } = formData;
        await axios.put(`/accountants/${editingAccountantId}`, updateData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Accountant updated successfully!");
      } else {
        // Create - include all fields
        await axios.post("/accountants", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Accountant created successfully!");
      }

      fetchAccountants();
      setIsModalOpen(false);
      setEditingAccountantId(null);
      resetForm();
    } catch (error) {
      console.error(error);
      alert(editingAccountantId ? "Error updating accountant" : "Error creating accountant");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      accountant_name: "",
      accountant_code: "",
      joining_date: "",
      contact_number: "",
      email: "",
      department: "",
      attendance_status: "Present",
      branch_id: "",
      monthly_salary: "",
      acccreate_name: "",
      acccreate_email: "",
      acccreate_password: ""
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "0.00";
    return parseFloat(amount).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  return (
    <div>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">All Accountants</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FaPlus /> Create Accountant
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, department, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full md:w-1/3"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">Sr. No.</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Code</th>
                <th className="p-3 border">Department</th>
                <th className="p-3 border">Joining Date</th>
                <th className="p-3 border">Contact</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Monthly Salary</th>
                <th className="p-3 border">Branch</th>
                <th className="p-3 border">Attendance</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccountants.length > 0 ? (
                filteredAccountants.map((accountant, index) => (
                  <tr key={accountant.id} className="hover:bg-gray-50">
                    <td className="p-3 border">{index + 1}</td>
                    <td className="p-3 border">{accountant.accountant_name}</td>
                    <td className="p-3 border">{accountant.accountant_code}</td>
                    <td className="p-3 border">{accountant.department}</td>
                    <td className="p-3 border">{accountant.joining_date}</td>
                    <td className="p-3 border">{accountant.contact_number}</td>
                    <td className="p-3 border">{accountant.email}</td>
                    <td className="p-3 border">₹{formatCurrency(accountant.monthly_salary)}</td>
                    <td className="p-3 border">{accountant.branch?.branch_name || accountant.branch_id}</td>
                    <td className="p-3 border">
                      <span
                        className={`px-2 py-1 text-sm rounded ${
                          accountant.attendance_status === "Present"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {accountant.attendance_status}
                      </span>
                    </td>
                    <td className="p-3 border text-center flex justify-center gap-3">
                      <button
                        onClick={() =>
                          toggleAttendance(accountant.id, accountant.attendance_status)
                        }
                        className={`p-2 rounded ${
                          accountant.attendance_status === "Present"
                            ? "text-green-600 hover:bg-green-100"
                            : "text-red-600 hover:bg-red-100"
                        }`}
                        title="Toggle Attendance"
                      >
                        {accountant.attendance_status === "Present" ? (
                          <FaToggleOn size={20} />
                        ) : (
                          <FaToggleOff size={20} />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/sinfodemanager/accountant/${accountant.id}`)
                        }
                        className="p-2 text-purple-600 hover:bg-purple-100 rounded"
                        title="View Accountant"
                      >
                        <FaEye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditClick(accountant)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                        title="Edit Accountant"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => deleteAccountant(accountant.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                        title="Delete Accountant"
                      >
                        <FaTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center p-4 text-gray-500">
                    No accountants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingAccountantId(null);
                  resetForm();
                }}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              >
                <FaTimes />
              </button>

              <h2 className="text-xl font-bold mb-4">
                {editingAccountantId ? "Update Accountant" : "Create Accountant"}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <input
                  name="accountant_name"
                  value={formData.accountant_name}
                  onChange={handleChange}
                  placeholder="Accountant Name"
                  className="border p-2 rounded"
                  required
                />
                <input
                  name="accountant_code"
                  value={formData.accountant_code}
                  onChange={handleChange}
                  placeholder="Accountant Code"
                  className="border p-2 rounded"
                  required={!editingAccountantId}
                />
                <input
                  name="joining_date"
                  value={formData.joining_date}
                  onChange={handleChange}
                  type="date"
                  className="border p-2 rounded"
                  required
                />
                <input
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="Contact Number"
                  className="border p-2 rounded"
                  required
                />
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  type="email"
                  className="border p-2 rounded"
                  required
                />
                <input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Department"
                  className="border p-2 rounded"
                  required
                />
                <input
                  name="monthly_salary"
                  value={formData.monthly_salary}
                  onChange={handleChange}
                  placeholder="Monthly Salary"
                  type="number"
                  className="border p-2 rounded"
                  required
                />
                <select
                  name="attendance_status"
                  value={formData.attendance_status}
                  onChange={handleChange}
                  className="border p-2 rounded"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="On Leave">On Leave</option>
                </select>
                <input
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleChange}
                  placeholder="Branch ID"
                  type="number"
                  className="border p-2 rounded"
                  required
                />
                
                {/* User creation fields - only show when creating new accountant */}
                {!editingAccountantId && (
                  <>
                    <input
                      name="acccreate_name"
                      value={formData.acccreate_name}
                      onChange={handleChange}
                      placeholder="Login Username"
                      className="border p-2 rounded"
                      required
                    />
                    <input
                      name="acccreate_email"
                      value={formData.acccreate_email}
                      onChange={handleChange}
                      placeholder="Login Email"
                      type="email"
                      className="border p-2 rounded"
                      required
                    />
                    <input
                      name="acccreate_password"
                      value={formData.acccreate_password}
                      onChange={handleChange}
                      placeholder="Login Password"
                      type="password"
                      className="border p-2 rounded"
                      required
                    />
                  </>
                )}
                
                <div className="col-span-2 flex justify-end mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                  >
                    {loading ? "Saving..." : "Save Accountant"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}