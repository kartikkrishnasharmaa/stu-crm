import SAAdminLayout from "../../../layouts/Sinfodeadmin";
import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";
import { HiDotsVertical } from "react-icons/hi";
import {
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaSpinner,
  FaPlus,
  FaTimes,
  FaEye,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaFileExport,
  FaUser,
  FaPercent
} from "react-icons/fa";
import * as XLSX from "xlsx";

export default function Branch() {
  const [branches, setBranches] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false); // Add loading state for details
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentBranchDetails, setCurrentBranchDetails] = useState(null);

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

  const handleEditClick = async (branch) => {
    setEditingBranchId(branch.id);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`branches/${branch.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fullBranch = res.data.branch;

      setFormData({
        branch_name: fullBranch.branch_name || "",
        address: fullBranch.address || "",
        city: fullBranch.city || "",
        state: fullBranch.state || "",
        pin_code: fullBranch.pin_code || "",
        contact_number: fullBranch.contact_number || "",
        email: fullBranch.email || "",
        opening_date: fullBranch.opening_date || "",
        branch_type: fullBranch.branch_type || "Main",
        status: fullBranch.status || "Active",
        discount_range: fullBranch.discount_range || "0",
        manager_name: fullBranch.manager_name || fullBranch.managers?.[0]?.name || "",
        manager_email: fullBranch.manager_email || fullBranch.managers?.[0]?.email || "",
        manager_password: fullBranch.plain_password || fullBranch.managers?.[0]?.plain_password || "", // Always blank for security
      });

      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to load branch details for edit:", error);
      alert("Could not load branch data. Please try again.");
    }
  };

  const handleViewClick = async (branchId) => {
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`branches/${branchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // API se branch object aata hai
      setCurrentBranchDetails(response.data.branch);
      setViewModalOpen(true);
    } catch (error) {
      console.error("Error fetching branch details:", error);
      alert("Failed to load branch details");
    } finally {
      setDetailsLoading(false);
    }
  };
  const exportToExcel = () => {
    // Prepare data for export
    const exportData = branches.map(branch => ({
      "Branch Code": branch.branch_code,
      "Branch Name": branch.branchName,
      "City": branch.city,
      "State": branch.state,
      "Pin Code": branch.pin_code,
      "Address": branch.address,
      "Contact Number": branch.contact,
      "Email": branch.email,
      "Opening Date": branch.opening_date,
      "Branch Type": branch.branch_type,
      "Status": branch.status,
      "Discount Range": branch.discount_range
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Branches");

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, "branches_export.xlsx");
  };

  const [formData, setFormData] = useState({
    branch_name: "",
    address: "",
    city: "",
    state: "",
    pin_code: "",
    contact_number: "",
    email: "",
    opening_date: "",
    branch_type: "Main",
    status: "Active",
    manager_name: "",
    manager_email: "",
    manager_password: "",
    discount_range: "0"
  });

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found! Please login again.");
        return;
      }
      const res = await axios.get("branches", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const branchData = res.data.map((branch) => ({
        id: branch.id,
        branchName: branch.branch_name,
        branch_code: branch.branch_code || "BR-" + branch.id,
        city: branch.city,
        state: branch.state,
        contact: branch.contact_number,
        email: branch.email,
        status: branch.status,
        opening_date: branch.opening_date,
        discount_range: branch.discount_range || "",
        pin_code: branch.pin_code || "",
        address: branch.address || "",
        branch_type: branch.branch_type || "Main",
      }));

      setBranches(branchData);
    } catch (error) {
      console.error("Error fetching branches:", error);
      alert("Failed to load branches");
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      await axios.patch(
        `branches/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBranches(
        branches.map((branch) =>
          branch.id === id ? { ...branch, status: newStatus } : branch
        )
      );
      alert(`Branch status changed to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const deleteBranch = async (id) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`branches/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Branch deleted successfully!");
        fetchBranches();
      } catch (error) {
        console.error("Error deleting branch:", error);
        alert("Failed to delete branch");
      }
    }
  };

  const filteredBranches = branches.filter(
    (branch) =>
      (branch.branchName || "").toLowerCase().includes(search.toLowerCase()) ||
      (branch.city || "").toLowerCase().includes(search.toLowerCase()) ||
      (branch.branch_code || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
     const { name, value } = e.target;
    
    // Validate phone number
    if (name === "contact_number") {
      // Only allow numbers and limit to 10 digits
      if (!/^\d{0,10}$/.test(value)) return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (editingBranchId) {
        const res = await axios.put(`branches/${editingBranchId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBranches(
          branches.map((branch) =>
            branch.id === editingBranchId ? { ...branch, ...res.data } : branch
          )
        );
        alert("Branch updated successfully!");
      } else {
        const res = await axios.post("branches", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBranches([...branches, res.data]);
        alert("Branch created successfully!");
      }
      fetchBranches();
      setIsModalOpen(false);
      setEditingBranchId(null);
      resetForm();
    } catch (error) {
      console.error(error);
      alert(
        editingBranchId ? "Error updating branch" : "Error creating branch"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      branch_name: "",
      address: "",
      city: "",
      state: "",
      pin_code: "",
      contact_number: "",
      email: "",
      opening_date: "",
      branch_type: "Main",
      status: "Active",
      manager_name: "",
      manager_email: "",
      manager_password: "",
      discount_range: "0"
    });
  };

  return (
    <SAAdminLayout>
      <div className="max-w-7xl mx-auto p-6 w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[34px] font-nunito">
            Branches ({branches.length})
          </h1>
          <div className="flex">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#3F8CFF] hover:bg-blue-700 text-white px-4 py-2 rounded-3xl flex items-center gap-2"
            >
              <FaPlus /> Create Branch
            </button>
            <button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 ml-4 text-white px-4 py-2 rounded-3xl flex items-center gap-2"
            >
              <FaFileExport /> Export Branches
            </button>
          </div>
        </div>

        {/* Search Filter */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, city, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full md:w-1/3"
          />
        </div>

        {/* Branch List Header - Only visible on larger screens */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-100 rounded-t-lg border-b">
          <div className="col-span-3 font-medium text-gray-700">Branch Info</div>
          <div className="col-span-2 font-medium text-gray-700 text-center">Opening Date</div>
          <div className="col-span-2 font-medium text-gray-700 text-center">Email</div>
          <div className="col-span-2 font-medium text-gray-700 text-center">Contact</div>
          <div className="col-span-1 font-medium text-gray-700 text-center">Status</div>
        </div>

        {/* Branch List */}
        <div className="shadow-md rounded-lg">
          <div className="space-y-3">
            {filteredBranches.length > 0 ? (
              filteredBranches.map((branch) => (
                <div
                  key={branch.id}
                  className="bg-white shadow-sm hover:shadow-md transition rounded-xl px-5 py-4 grid grid-cols-12 gap-4 items-center relative"
                >
                  {/* Branch Info - Fixed width */}
                  <div className="col-span-12 md:col-span-3 flex items-center gap-4">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
                      alt={branch.branchName}
                      className="w-12 h-12 rounded-full object-cover border p-2 bg-gray-50"
                    />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 text-lg truncate">
                        {branch.branchName}
                      </h3>
                      <p className="text-gray-500 text-sm truncate">{branch.city}</p>
                    </div>
                  </div>

                  {/* Opening Date - Fixed width */}
                  <div className="hidden md:flex col-span-2 flex-col text-sm text-gray-600 items-center justify-center">
                    <span className="truncate w-full text-center">
                      {branch.opening_date
                        ? new Date(branch.opening_date).toLocaleDateString(
                          "en-GB"
                        )
                        : ""}
                    </span>
                  </div>

                  {/* Email - Fixed width */}
                  <div className="hidden md:flex col-span-2 flex-col text-sm text-gray-600 items-center justify-center">
                    <span className="truncate w-full text-center">{branch.email}</span>
                  </div>

                  {/* Contact - Fixed width */}
                  <div className="hidden md:flex col-span-2 flex-col text-sm text-gray-600 items-center justify-center">
                    <span className="truncate w-full text-center">{branch.contact}</span>
                  </div>

                  {/* Status - Fixed width */}
                  <div className="hidden md:flex col-span-1 flex-col text-sm text-gray-600 items-center justify-center">
                    <span
                      className={`px-2 py-1 text-xs rounded ${branch.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {branch.status}
                    </span>
                  </div>

                  {/* Mobile view status indicator */}
                  <div className="md:hidden absolute top-4 right-3">
                    <span
                      className={`px-2 py-1 text-xs rounded ${branch.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {branch.status}
                    </span>
                  </div>

                  {/* Menu - Fixed position */}
                  <div className="col-span-12 ml-[15px] md:col-span-1 flex justify-end md:justify-center md:absolute md:right-4">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === branch.id ? null : branch.id
                          )
                        }
                        className="menu-toggle p-2 hover:bg-gray-100 rounded-full"
                      >
                        <HiDotsVertical size={20} />
                      </button>
                      {openMenuId === branch.id && (
                        <div
                          className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-40 py-2 z-50 menu-container"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewClick(branch.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-blue-600"
                          >
                            <FaEye size={16} /> View
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStatus(branch.id, branch.status);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                          >
                            {branch.status === "Active" ? (
                              <FaToggleOn size={18} className="text-green-600" />
                            ) : (
                              <FaToggleOff size={18} className="text-red-600" />
                            )}
                            Toggle Status
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(branch);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-blue-600"
                          >
                            <FaEdit size={16} /> Edit
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteBranch(branch.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-red-600"
                          >
                            <FaTrash size={16} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-4 text-gray-500">
                No branches found.
              </div>
            )}
          </div>
        </div>

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingBranchId(null);
                  resetForm();
                }}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              >
                <FaTimes />
              </button>

              <h2 className="text-[20px] font-semibold mb-3 font-nunito">
                {editingBranchId ? "Update Branch" : "Create Branch"}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <input
                  name="branch_name"
                  value={formData.branch_name}
                  onChange={handleChange}
                  placeholder="Branch Name"
                  className="border p-2 rounded"
                  required
                />
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                  className="border p-2 rounded"
                  required
                />
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="border p-2 rounded"
                  required
                />
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="border p-2 rounded"
                  required
                />
                <input
                  name="pin_code"
                  value={formData.pin_code}
                  onChange={handleChange}
                  placeholder="Pin Code"
                  className="border p-2 rounded"
                  type="number"
                  required
                />
                <input
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="Contact Number"
                  className="border p-2 rounded"
                  type="number"
                  maxLength={10}
                  required
                />
                <input
                  name="discount_range"
                  value={formData.discount_range}
                  onChange={handleChange}
                  placeholder="Max Discount (%)"
                  className="border p-2 rounded"
                  type="number"
                  min="0"
                  max="100"
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
                  name="opening_date"
                  value={formData.opening_date}
                  onChange={handleChange}
                  type="date"
                  className="border p-2 rounded"
                  required
                />
                <select
                  name="branch_type"
                  value={formData.branch_type}
                  onChange={handleChange}
                  className="border p-2 rounded"
                >
                  <option>Main</option>
                  <option>Franchise</option>
                </select>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="border p-2 rounded"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>

                <span className="col-span-2">
                  <hr className="my-4" />
                  <h2 className="text-[20px] font-semibold mt-4 font-nunito">
                    For Login
                  </h2>
                </span>

                <input
                  name="manager_name"
                  value={formData.manager_name}
                  onChange={handleChange}
                  placeholder="Manager Name"
                  className="border p-2 rounded"
                  required
                />
                <input
                  name="manager_email"
                  value={formData.manager_email}
                  onChange={handleChange}
                  placeholder="Manager Email"
                  type="email"
                  className="border p-2 rounded"
                  required
                />

                <input
                  name="manager_password"
                  value={formData.manager_password}
                  onChange={handleChange}
                  placeholder="Manager Password"
                  type="text"
                  className="border p-2 rounded"
                  required={!editingBranchId}
                />
                <div className="col-span-2 flex justify-end mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#3F8CFF] hover:bg-blue-700 text-white px-4 py-2 rounded-3xl flex items-center gap-2"
                  >
                    {loading ? "Saving..." : editingBranchId ? "Update Branch" : "Create Branch"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {viewModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setCurrentBranchDetails(null);
                }}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              >
                <FaTimes />
              </button>

              {detailsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <FaSpinner className="animate-spin text-4xl text-blue-500" />
                </div>
              ) : currentBranchDetails ? (
                <>
                  <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
                    {currentBranchDetails.branch_name} Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Branch Information Card */}
                    <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-800">
                        <FaMapMarkerAlt /> Branch Information
                      </h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Code:</span> {currentBranchDetails.branch_code}</p>
                        <p><span className="font-medium">Type:</span> {currentBranchDetails.branch_type}</p>
                        <p><span className="font-medium">Status:</span>
                          <span className={`px-2 py-1 ml-2 text-xs rounded ${currentBranchDetails.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {currentBranchDetails.status}
                          </span>
                        </p>
                        <p><span className="font-medium">Opening Date:</span>
                          {new Date(currentBranchDetails.opening_date).toLocaleDateString("en-GB")}
                        </p>
                        <p className="flex items-center gap-1">
                          <FaPercent className="text-blue-600" />
                          <span className="font-medium">Max Discount:</span> {currentBranchDetails.discount_range}%
                        </p>
                      </div>
                    </div>

                    {/* Contact Information Card */}
                    <div className="bg-green-50 p-4 rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-800">
                        <FaPhone /> Contact Information
                      </h3>
                      <div className="space-y-2">
                        <p className="flex items-center gap-2">
                          <FaEnvelope className="text-green-600" />
                          <span>{currentBranchDetails.email}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <FaPhone className="text-green-600" />
                          <span>{currentBranchDetails.contact_number}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-green-600" />
                          <span>{currentBranchDetails.address}, {currentBranchDetails.city}, {currentBranchDetails.state} - {currentBranchDetails.pin_code}</span>
                        </p>
                      </div>
                    </div>

                    {currentBranchDetails.managers && currentBranchDetails.managers.length > 0 && (
                      <div className="md:col-span-2 bg-purple-50 p-4 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-purple-800">
                          <FaUser /> Managers & Staff ({currentBranchDetails.managers.length})
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead>
                              <tr className="bg-purple-100">
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2 text-left">Email</th>
                                {/* <th className="px-4 py-2 text-left">Role</th> */}
                              </tr>
                            </thead>
                            <tbody>
                              {currentBranchDetails.managers.map((manager, index) => (
                                <tr key={manager.id} className={index % 2 === 0 ? 'bg-white' : 'bg-purple-50'}>
                                  <td className="px-4 py-2">{manager.name}</td>
                                  <td className="px-4 py-2">{manager.email}</td>
                                  {/* <td className="px-4 py-2">
                                    <span className={`px-2 py-1 text-xs rounded ${manager.role === 'branch_manager'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-700'
                                      }`}>
                                      {manager.role ? manager.role.replace('_', ' ') : 'N/A'}
                                    </span>
                                  </td> */}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center p-8 text-red-500">
                  Failed to load branch details. Please try again.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SAAdminLayout>
  );
}