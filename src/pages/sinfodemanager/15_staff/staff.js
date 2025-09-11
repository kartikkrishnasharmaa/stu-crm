// import SAManagerLayout from "../../../layouts/Sinfodemanager"; // Assuming you have a layout component for the admin dashboard

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
import { useNavigate } from "react-router-dom"; // for navigation

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const navigate = useNavigate();

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userBranchId = userData.branch_id;

  // Form data
  const [formData, setFormData] = useState({
    employee_name: "",
    employee_code: "",
    designation: "",
    joining_date: "",
    contact_number: "",
    email: "",
    department: "",
    status: "active", // Changed from attendance_status to status
    branch_id: userBranchId || "", // Set default to user's branch
    staffcreate_name: "",
    staffcreate_email: "",
    staffcreate_password: "",
    monthly_salary: ""
  });

  // Fetch staff list
  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found! Please login again.");
        return;
      }
      const res = await axios.get("/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStaffList(res.data || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
      alert("Failed to load staff list");
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Toggle status (active/inactive)
  const toggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      await axios.put(
        `/staff/update/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStaffList(
        staffList.map((staff) =>
          staff.id === id ? { ...staff, status: newStatus } : staff
        )
      );
      alert(`Status changed to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  // Delete staff
  const deleteStaff = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/staff/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Staff deleted successfully!");
        fetchStaff();
      } catch (error) {
        console.error("Error deleting staff:", error);
        alert("Failed to delete staff");
      }
    }
  };

  // Search filter
  const filteredStaff = staffList.filter(
    (staff) =>
      (staff.employee_name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (staff.designation || "").toLowerCase().includes(search.toLowerCase()) ||
      (staff.employee_code || "").toLowerCase().includes(search.toLowerCase())
  );

  // Handle form input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Edit click
  const handleEditClick = (staff) => {
    setEditingStaffId(staff.id);
    setFormData({
      employee_name: staff.employee_name,
      employee_code: staff.employee_code,
      designation: staff.designation,
      joining_date: staff.joining_date,
      contact_number: staff.contact_number,
      email: staff.email,
      department: staff.department,
      status: staff.status, // Changed from attendance_status to status
      branch_id: staff.branch_id,
      staffcreate_name: staff.staffcreate_name,
      staffcreate_email: staff.staffcreate_email,
      staffcreate_password: "",
      monthly_salary: staff.monthly_salary
    });
    setIsModalOpen(true);
  };

  // Create/Update submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Prepare data with user's branch_id
      const submitData = {
        ...formData,
        branch_id: userBranchId // Always use the logged-in user's branch
      };

      if (editingStaffId) {
        // Update
        await axios.put(`/staff/update/${editingStaffId}`, submitData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Staff updated successfully!");
      } else {
        // Create
        await axios.post("/staff/create", submitData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Staff created successfully!");
      }

      fetchStaff();
      setIsModalOpen(false);
      setEditingStaffId(null);
      resetForm();
    } catch (error) {
      console.error(error);
      alert(editingStaffId ? "Error updating staff" : "Error creating staff");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      employee_name: "",
      employee_code: "",
      designation: "",
      joining_date: "",
      contact_number: "",
      email: "",
      department: "",
      status: "active",
      branch_id: userBranchId || "", // Reset to user's branch
      staffcreate_name: "",
      staffcreate_email: "",
      staffcreate_password: "",
      monthly_salary: ""
    });
  };

  return (
    <div>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">All Staff</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FaPlus /> Create Staff
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, designation, or code..."
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
                <th className="p-3 border">Designation</th>
                <th className="p-3 border">Department</th>
                <th className="p-3 border">Joining Date</th>
                <th className="p-3 border">Contact</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff, index) => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="p-3 border">{index + 1}</td>
                    <td className="p-3 border">{staff.employee_name}</td>
                    <td className="p-3 border">{staff.designation}</td>
                    <td className="p-3 border">{staff.department}</td>
                    <td className="p-3 border">{staff.joining_date}</td>
                    <td className="p-3 border">{staff.contact_number}</td>
                    <td className="p-3 border">{staff.email}</td>
                    <td className="p-3 border">
                      <span
                        className={`px-2 py-1 text-sm rounded ${
                          staff.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {staff.status}
                      </span>
                    </td>
                    <td className="p-3 border text-center flex justify-center gap-3">
                      <button
                        onClick={() =>
                          toggleStatus(staff.id, staff.status)
                        }
                        className={`p-2 rounded ${
                          staff.status === "active"
                            ? "text-green-600 hover:bg-green-100"
                            : "text-red-600 hover:bg-red-100"
                        }`}
                        title="Toggle Status"
                      >
                        {staff.status === "active" ? (
                          <FaToggleOn size={20} />
                        ) : (
                          <FaToggleOff size={20} />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/sinfodemanager/staff/${staff.id}`)
                        }
                        className="p-2 text-purple-600 hover:bg-purple-100 rounded"
                        title="View Staff"
                      >
                        <FaEye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditClick(staff)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                        title="Edit Staff"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => deleteStaff(staff.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                        title="Delete Staff"
                      >
                        <FaTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center p-4 text-gray-500">
                    No staff found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              >
                <FaTimes />
              </button>

              <h2 className="text-xl font-bold mb-4">
                {editingStaffId ? "Update Staff" : "Create Staff"}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <input
                  name="employee_name"
                  value={formData.employee_name}
                  onChange={handleChange}
                  placeholder="Employee Name"
                  className="border p-2 rounded"
                  required
                />
                <input
                  name="employee_code"
                  value={formData.employee_code}
                  onChange={handleChange}
                  placeholder="Employee Code"
                  className="border p-2 rounded"
                  required
                />
                <input
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Designation"
                  className="border p-2 rounded"
                  required
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
                  name="monthly_salary"
                  value={formData.monthly_salary}
                  onChange={handleChange}
                  placeholder="Monthly Salary"
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
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="border p-2 rounded"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <input
                  name="staffcreate_name"
                  value={formData.staffcreate_name}
                  onChange={handleChange}
                  placeholder="Staff Create Name"
                  className="border p-2 rounded"
                  required
                />
                <input
                  name="staffcreate_email"
                  value={formData.staffcreate_email}
                  onChange={handleChange}
                  placeholder="Staff Create Email"
                  type="email"
                  className="border p-2 rounded"
                  required
                />
                <input
                  name="staffcreate_password"
                  value={formData.staffcreate_password}
                  onChange={handleChange}
                  placeholder="Staff Create Password"
                  type="password"
                  className="border p-2 rounded"
                  required={!editingStaffId}
                />
                <div className="col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                  >
                    {loading ? "Saving..." : "Save Staff"}
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