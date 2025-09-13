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

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);

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
    employee_name: "",
    employee_code: "",
    designation: "",
    joining_date: "",
    contact_number: "",
    email: "",
    department: "",
    status: "Active",
    branch_id: "",
    staffcreate_name: "",
    staffcreate_email: "",
    staffcreate_password: "",
    monthly_salary: "",
  });

  const [formErrors, setFormErrors] = useState({});

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
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(res.data || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchStaff();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate phone number
    if (name === "contact_number") {
      // Only allow numbers and limit to 10 digits
      if (!/^\d{0,10}$/.test(value)) return;
    }
    
    // Validate salary
    if (name === "monthly_salary") {
      // Only allow numbers with optional decimal point
      if (!/^\d*\.?\d*$/.test(value)) return;
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
        `/staff/update/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStaffList(
        staffList.map((staff) =>
          staff.id === id ? { ...staff, status: newStatus } : staff
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const deleteStaff = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/staff/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchStaff();
      } catch (error) {
        console.error("Error deleting staff:", error);
      }
    }
  };

  const filteredStaff = staffList.filter(
    (staff) =>
      (selectedBranch ? staff.branch_id === parseInt(selectedBranch) : true) &&
      ((staff.employee_name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
        (staff.designation || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (staff.employee_code || "")
          .toLowerCase()
          .includes(search.toLowerCase()))
  );

  const handleEditClick = (staff) => {
    setEditingStaffId(staff.id);
    setFormData({
      employee_name: staff.employee_name || "",
      employee_code: staff.employee_code || "",
      designation: staff.designation || "",
      joining_date: staff.joining_date || "",
      contact_number: staff.contact_number || "",
      email: staff.email || "",
      department: staff.department || "",
      status: staff.status || "Active",
      branch_id: staff.branch_id || "",
      staffcreate_name: staff.user?.name || staff.employee_name || "",
      staffcreate_email: staff.user?.email || "",
      staffcreate_password: staff.user?.plain_password || "",
      monthly_salary: staff.monthly_salary || "",
    });
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    
    // Phone number validation
    if (formData.contact_number && !/^\d{10}$/.test(formData.contact_number)) {
      errors.contact_number = "Phone number must be exactly 10 digits";
    }
    
    // Salary validation
    if (formData.monthly_salary && !/^\d+(\.\d{1,2})?$/.test(formData.monthly_salary)) {
      errors.monthly_salary = "Please enter a valid salary amount";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (editingStaffId) {
        await axios.put(`/staff/update/${editingStaffId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Staff updated successfully!");
      } else {
        await axios.post("/staff/create", formData, {
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

  const resetForm = () => {
    setFormData({
      employee_name: "",
      employee_code: "",
      designation: "",
      joining_date: "",
      contact_number: "",
      email: "",
      department: "",
      status: "Active",
      branch_id: "",
      staffcreate_name: "",
      staffcreate_email: "",
      staffcreate_password: "",
      monthly_salary: "",
    });
    setFormErrors({});
  };

  const exportToExcel = () => {
    const dataToExport = filteredStaff.map(staff => ({
      "Employee Name": staff.employee_name,
      "Employee Code": staff.employee_code,
      "Designation": staff.designation,
      "Joining Date": staff.joining_date,
      "Contact Number": staff.contact_number,
      "Email": staff.email,
      "Department": staff.department,
      "Status": staff.status,
      "Branch": branches.find(b => b.id === staff.branch_id)?.branch_name || "N/A",
      "Monthly Salary": staff.monthly_salary
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff Data");
    XLSX.writeFile(workbook, "staff_data.xlsx");
  };

  return (
    <div className="px-5">
      <div className="flex items-center gap-4 mb-4">
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="border p-2 rounded"
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
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[34px] font-nunito">
          Employee <span>({filteredStaff.length})</span>
        </h1>
        <div className="flex gap-2 bg-gray-200 p-1 rounded-full">
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${viewMode === "list"
              ? "bg-[#3F8CFF] text-white"
              : "bg-transparent text-gray-600 hover:bg-gray-300"
              }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode("card")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${viewMode === "card"
              ? "bg-[#3F8CFF] text-white"
              : "bg-transparent text-gray-600 hover:bg-gray-300"
              }`}
          >
            Card View
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-3xl flex items-center gap-2"
          >
            <FaFileExport /> Export to Excel
          </button>
          <button
            onClick={() => {
              resetForm();
              setEditingStaffId(null);
              setIsModalOpen(true);
            }}
            className="bg-[#3F8CFF] hover:bg-blue-700 text-white px-4 py-2 rounded-3xl flex items-center gap-2"
          >
            <FaPlus /> Create Staff
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div>
          <div className="bg-white rounded-xl">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-100 font-semibold text-gray-700">
              <div className="col-span-3">Employee</div>
              <div className="col-span-2 text-center">Position</div>
              <div className="col-span-2 text-center">Phone no.</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
            <div className="divide-y">
              {filteredStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50"
                >
                  <div className="col-span-3 flex items-center gap-3">
                    <img
                      src={
                        staff.profile_image ||
                        "https://sipl.ind.in/wp-content/uploads/2022/07/dummy-user.png"
                      }
                      alt={staff.employee_name}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {staff.employee_name}
                      </h3>
                      <p className="text-gray-500 text-sm">{staff.email}</p>
                    </div>
                  </div>
                  <div className="col-span-2 text-center text-gray-600">
                    {staff.designation}
                  </div>
                  <div className="col-span-2 text-center text-gray-600">
                    {staff.contact_number}
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      staff.status === "Active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {staff.status}
                    </span>
                  </div>
                  <div className="col-span-3 flex justify-end">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === staff.id ? null : staff.id)
                        }
                        className="menu-toggle p-2 hover:bg-gray-100 rounded-full"
                      >
                        <HiDotsVertical size={20} />
                      </button>

                      {openMenuId === staff.id && (
                        <div
                          className="menu-container absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-40 py-2 z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => toggleStatus(staff.id, staff.status)}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                          >
                            {staff.status === "Active" ? (
                              <FaToggleOn size={18} className="text-green-600" />
                            ) : (
                              <FaToggleOff size={18} className="text-red-600" />
                            )}
                            {staff.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/sinfodeadmin/staff/${staff.id}`)
                            }
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-purple-600"
                          >
                            <FaEye size={16} /> View
                          </button>
                          <button
                            onClick={() => handleEditClick(staff)}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-blue-600"
                          >
                            <FaEdit size={16} /> Edit
                          </button>
                          <button
                            onClick={() => deleteStaff(staff.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-red-600"
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
          </div>
        </div>
      ) : (
        <div className="grid mt-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className="bg-white mt-6 rounded-2xl shadow p-6 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md -mt-10 mb-3">
                <img
                  src={
                    staff.profile_image ||
                    "https://sipl.ind.in/wp-content/uploads/2022/07/dummy-user.png"
                  }
                  alt={staff.employee_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold">{staff.employee_name}</h3>
              <p className="text-gray-500">{staff.designation}</p>
              <div className="grid gap-3 mt-4 w-full text-sm">
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-gray-800 font-bold">
                    Contact No: {staff.contact_number || 0}
                  </p>
                </div>
              </div>
              <span className="mt-4 px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                Joined on: {staff.joining_date}
              </span>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <FaTimes />
            </button>
            <h2 className="text-[18px] font-nunito">
              {editingStaffId ? "Update Staff" : "Create Staff"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid mt-3 grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="md:col-span-2">
                <h3 className="text-md font-medium mb-2 border-b pb-1">Employee Details</h3>
              </div>

              <input
                name="employee_name"
                value={formData.employee_name}
                onChange={handleChange}
                placeholder="Employee Name"
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
              <div className="relative">
                <input
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="Contact Number"
                  className={`border p-2 rounded w-full ${formErrors.contact_number ? 'border-red-500' : ''}`}
                  maxLength={10}
                  required
                />
                {formErrors.contact_number && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.contact_number}</p>
                )}
              </div>
              <div className="relative">
                <input
                  name="monthly_salary"
                  value={formData.monthly_salary}
                  onChange={handleChange}
                  placeholder="Salary"
                  className={`border p-2 rounded w-full ${formErrors.monthly_salary ? 'border-red-500' : ''}`}
                />
                {formErrors.monthly_salary && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.monthly_salary}</p>
                )}
              </div>
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
                name="branch_id"
                value={formData.branch_id}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <div className="md:col-span-2 mt-4">
                <h3 className="text-md font-medium mb-2 border-b pb-1">User Account Details</h3>
              </div>

              <input
                name="staffcreate_name"
                value={formData.staffcreate_name}
                onChange={handleChange}
                placeholder="Username"
                className="border p-2 rounded"
                required
              />
              <input
                name="staffcreate_email"
                value={formData.staffcreate_email}
                onChange={handleChange}
                placeholder="User Email"
                type="email"
                className="border p-2 rounded"
                required
              />
              <input
                name="staffcreate_password"
                value={formData.staffcreate_password}
                onChange={handleChange}
                placeholder="Password"
                type="text"
                className="border p-2 rounded"
                required={!editingStaffId}
              />

              <div className="md:col-span-2 flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#3F8CFF] hover:bg-blue-700 text-white px-4 py-2 rounded-3xl flex items-center gap-2"
                >
                  {loading ? "Saving..." : editingStaffId ? "Update Staff" : "Create Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}