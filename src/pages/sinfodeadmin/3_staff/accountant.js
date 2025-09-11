import { useState, useEffect, useRef } from "react";
import axios from "../../../api/axiosConfig";
import {
  FaEdit,
  FaEye,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaPlus,
  FaTimes,
  FaFileExport,
} from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function Accountant() {
  const [accountantList, setAccountantList] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingAccountantId, setEditingAccountantId] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);

  // Handle click outside to close menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        openMenuId !== null &&
        !event.target.closest(".menu-container") &&
        !event.target.closest(".menu-toggle")
      ) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const [formData, setFormData] = useState({
    accountant_name: "",
    accountant_code: "",
    joining_date: "",
    contact_number: "",
    email: "",
    department: "",
    attendance_status: "Present",
    branch_id: "",
    acccreate_name: "",
    acccreate_email: "",
    acccreate_password: "",
    monthly_salary: "",
    status: "Active"
  });
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/branches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const branchList = res.data.map((branch) => ({
        id: branch.id,
        branch_name: branch.branch_name,
      }));
      setBranches(branchList);
      // Remove the code that sets the selectedBranch to the first branch
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const fetchAccountants = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/accountants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccountantList(res.data || []);
    } catch (error) {
      console.error("Error fetching accountants:", error);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchAccountants();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate phone number
    if (name === "contact_number") {
      // Only allow numbers and limit to 10 digits
      if (!/^\d{0,10}$/.test(value)) return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      await axios.put(
        `/accountants/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAccountantList(
        accountantList.map((accountant) =>
          accountant.id === id ? { ...accountant, status: newStatus } : accountant
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const deleteAccountant = async (id) => {
    if (window.confirm("Are you sure you want to delete this accountant?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/accountants/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchAccountants();
      } catch (error) {
        console.error("Error deleting accountant:", error);
      }
    }
  };

  // Function to export data to Excel
  const exportToExcel = () => {
    const dataToExport = filteredAccountants.map(accountant => ({
      "Accountant Name": accountant.accountant_name,
      "Accountant Code": accountant.accountant_code,
      "Joining Date": accountant.joining_date,
      "Contact Number": accountant.contact_number,
      "Email": accountant.email,
      "Department": accountant.department,
      "Attendance Status": accountant.attendance_status,
      "Monthly Salary": accountant.monthly_salary,
      "Status": accountant.status,
      "Branch": branches.find(b => b.id === accountant.branch_id)?.branch_name || "N/A"
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Accountant Data");
    XLSX.writeFile(wb, "accountant_data.xlsx");
  };

  const filteredAccountants = accountantList.filter(
    (accountant) =>
      (selectedBranch ? accountant.branch_id === parseInt(selectedBranch) : true) &&
      ((accountant.accountant_name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
        (accountant.accountant_code || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (accountant.email || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (accountant.department || "")
          .toLowerCase()
          .includes(search.toLowerCase()))
  );

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
      // Get login name from user object if available, otherwise use accountant name
      acccreate_name: accountant.user?.email || accountant.email,
      // Get login email from user object if available, otherwise use accountant email
      acccreate_email: accountant.user?.email || accountant.email,
      // Get password from user object if available
      acccreate_password: accountant.user?.plain_password || "",
      monthly_salary: accountant.monthly_salary,
      status: accountant.status || "Active"
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
        // Update
        await axios.put(`/accountants/${editingAccountantId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Accountant updated successfully!");
      } else {
        // Create
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
      acccreate_name: "",
      acccreate_email: "",
      acccreate_password: "",
      monthly_salary: "",
      status: "Active"
    });
  };

  return (
    <div className="px-5 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        {/* Left: Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Accountants{" "}
          <span className="text-blue-600">
            ({filteredAccountants.length})
          </span>
        </h1>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2 bg-gray-200 p-1 rounded-full self-start">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-transparent text-gray-600 hover:bg-gray-300"
                }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${viewMode === "card"
                  ? "bg-blue-600 text-white"
                  : "bg-transparent text-gray-600 hover:bg-gray-300"
                }`}
            >
              Card View
            </button>
          </div>

          {/* Right: Create Button and Export Button */}
          <div className="flex gap-3">
            <button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
            >
              <FaFileExport /> Export Excel
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
            >
              <FaPlus /> Create Accountant
            </button>
          </div>
        </div>
      </div>

      {/* Branch Filter and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="border p-2 rounded md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Branches</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.branch_name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by name, code, email or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* List View */}
      {viewMode === "list" ? (
        <div className="rounded-xl">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-100 font-semibold text-gray-700 border-b">
            <div className="col-span-3">Accountant Name</div>
            <div className="col-span-2">Department</div>
            <div className="col-span-2">Contact</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y">
            {filteredAccountants.map((accountant) => (
              <div
                key={accountant.id}
                className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                {/* Accountant Name Column */}
                <div className="col-span-3 flex items-center gap-3">
                  <img
                    src={
                      accountant.profile_image ||
                      "https://sipl.ind.in/wp-content/uploads/2022/07/dummy-user.png"
                    }
                    alt={accountant.accountant_name}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-800 truncate">
                      {accountant.accountant_name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{accountant.accountant_code}</p>
                  </div>
                </div>

                {/* Department Column */}
                <div className="col-span-2 flex items-center">
                  <span className="text-gray-700 truncate">{accountant.department}</span>
                </div>

                {/* Contact Column */}
                <div className="col-span-2 flex items-center">
                  <span className="text-gray-700 truncate">{accountant.contact_number || "N/A"}</span>
                </div>

                {/* Email Column */}
                <div className="col-span-3 flex items-center">
                  <span className="text-gray-700 text-sm truncate">{accountant.email || "N/A"}</span>
                </div>

                {/* Status Column */}
                <div className="col-span-1 flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${accountant.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                    }`}>
                    {accountant.status || "Active"}
                  </span>
                </div>

                {/* Actions Column */}
                <div className="col-span-1 flex justify-end items-center">
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === accountant.id ? null : accountant.id)
                      }
                      className="menu-toggle p-2 hover:bg-gray-100 rounded-full"
                    >
                      <HiDotsVertical size={20} />
                    </button>

                    {openMenuId === accountant.id && (
                      <div
                        className="menu-container absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-48 py-2 z-50 border border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            toggleStatus(accountant.id, accountant.status || "Active")
                          }
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
                        >
                          {accountant.status === "Active" ? (
                            <FaToggleOn size={18} className="text-green-600" />
                          ) : (
                            <FaToggleOff size={18} className="text-red-600" />
                          )}
                          {accountant.status === "Active" ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          onClick={() =>
                            navigate(`/sinfodeadmin/accountant/${accountant.id}`)
                          }
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-purple-600 text-sm"
                        >
                          <FaEye size={16} /> View Details
                        </button>

                        <button
                          onClick={() => handleEditClick(accountant)}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-blue-600 text-sm"
                        >
                          <FaEdit size={16} /> Edit
                        </button>

                        <button
                          onClick={() => deleteAccountant(accountant.id)}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-red-600 text-sm"
                        >
                          <FaTrash size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredAccountants.length === 0 && (
            <div className="py-10 text-center text-gray-500">
              No accountants found. {search && `No results for "${search}"`}
            </div>
          )}
        </div>
      ) : (
        /* Card View */
        <div className="grid mt-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAccountants.map((accountant) => (
            <div
              key={accountant.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 flex flex-col items-center text-center relative"
            >

              {/* Profile Image */}
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md -mt-12 mb-3">
                <img
                  src={
                    accountant.profile_image ||
                    "https://sipl.ind.in/wp-content/uploads/2022/07/dummy-user.png"
                  }
                  alt={accountant.accountant_name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name & Department */}
              <h3 className="text-lg font-semibold text-gray-800">{accountant.accountant_name}</h3>
              <p className="text-gray-500 mb-1">{accountant.department}</p>
              <p className="text-gray-400 text-sm mb-3">{accountant.accountant_code}</p>

              {/* Contact Info */}
              <div className="w-full space-y-2 mt-2 text-sm">
                <div className="bg-gray-50 rounded-lg py-2 px-3">
                  <p className="text-gray-700 font-medium truncate">
                    📞 {accountant.contact_number || "N/A"}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg py-2 px-3">
                  <p className="text-gray-700">
                    ₹{accountant.monthly_salary || "0"} / month
                  </p>
                </div>
              </div>

              {/* Joining Date Badge */}
              <div className="mt-4 text-xs text-gray-500">
                Joined on: {accountant.joining_date}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <FaTimes size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              {editingAccountantId ? "Update Accountant" : "Create Accountant"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Accountant Name *</label>
                <input
                  name="accountant_name"
                  value={formData.accountant_name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
{/* 
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Accountant Code</label>
                <input
                  name="accountant_code"
                  value={formData.accountant_code}
                  onChange={handleChange}
                  placeholder="Code (e.g., ACC-001)"
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div> */}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Joining Date *</label>
                <input
                  name="joining_date"
                  value={formData.joining_date}
                  onChange={handleChange}
                  type="date"
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Contact Number *</label>
                <input
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  type="email"
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Department *</label>
                <input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Department"
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Monthly Salary</label>
                <input
                  name="monthly_salary"
                  value={formData.monthly_salary}
                  onChange={handleChange}
                  placeholder="Salary Amount"
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="number"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Branch *</label>
                <select
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleChange}
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Login Name *</label>
                <input
                  name="acccreate_name"
                  value={formData.acccreate_name}
                  onChange={handleChange}
                  placeholder="Login Username"
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Login Email *</label>
                <input
                  name="acccreate_email"
                  value={formData.acccreate_email}
                  onChange={handleChange}
                  placeholder="Login Email"
                  type="email"
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {editingAccountantId ? "New Password (leave blank to keep current)" : "Login Password *"}
                </label>
                <input
                  name="acccreate_password"
                  value={formData.acccreate_password}
                  onChange={handleChange}
                  placeholder="Password"
                  type="text"
                  className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!editingAccountantId}
                />
              </div>

              <div className="md:col-span-2 flex justify-end pt-4 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingAccountantId(null);
                    resetForm();
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-70"
                >
                  {loading ? "Saving..." : (editingAccountantId ? "Update Accountant" : "Create Accountant")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}