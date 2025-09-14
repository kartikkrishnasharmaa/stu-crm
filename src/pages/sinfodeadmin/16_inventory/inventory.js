import SAAdminLayout from "../../../layouts/Sinfodeadmin";
import AllInv from "./Allassets";
import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";
import Transferassest from "./transfer";
import History from "./history";

function AddAssets() {
  const [branches, setBranches] = useState([]);
  const [staffs, setStaffs] = useState([]); // ✅ staff dropdown ke liye
  const [formData, setFormData] = useState({
    asset_name: "",
    asset_code: "",
    purchase_date: "",
    current_status: "in_use",
    quantity_available: "",
    branch_id: "",
    assigned_staff_id: "", // ✅ staff assign karne ke liye
  });

  // ✅ Fetch branches
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/branches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const branchData = res.data.map((branch) => ({
        id: branch.id,
        branchName: branch.branch_name,
      }));
      setBranches(branchData);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  // ✅ Fetch staff for dropdown
  const fetchStaffs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const staffData = res.data.map((s) => ({
        id: s.id,
        name: s.employee_name, // 👈 yahi change hai
      }));

      setStaffs(staffData);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchStaffs();
  }, []);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("/assets/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Asset created successfully!");
      setFormData({
        asset_name: "",
        asset_code: "",
        purchase_date: "",
        current_status: "in_use",
        quantity_available: "",
        branch_id: "",
        assigned_staff_id: "",
      });
    } catch (error) {
      console.error("Error creating asset:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to create asset!");
    }
  };

  return (
    <div className="items-center">
      <div className="bg-white shadow-lg rounded-2xl p-4 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
          Create New Asset
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Asset Name */}
          <input
            type="text"
            name="asset_name"
            placeholder="Asset Name"
            value={formData.asset_name}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          {/* Asset Code */}
          <input
            type="text"
            name="asset_code"
            placeholder="Asset Code"
            value={formData.asset_code}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          {/* Purchase Date */}
          <input
            type="date"
            name="purchase_date"
            value={formData.purchase_date}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          {/* Status Dropdown */}
          <select
            name="current_status"
            value={formData.current_status}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          >
            <option value="in_use">In Use</option>
            <option value="available">Available</option>
            <option value="under_maintenance">Under Repair</option>
          </select>

          {/* Quantity */}
          <input
            type="number"
            name="quantity_available"
            placeholder="Quantity Available"
            value={formData.quantity_available}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          />

          {/* Branch Dropdown */}
          <select
            name="branch_id"
            value={formData.branch_id}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          >
            <option value="">Select Branch</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.branchName}
              </option>
            ))}
          </select>

          {/* Staff Dropdown */}
          {/* Staff Dropdown */}
          <select
            name="assigned_staff_id"
            value={formData.assigned_staff_id}
            onChange={handleChange}
            className="w-full border rounded-lg p-3"
            required
          >
            <option value="">Assign to Staff</option>
            {staffs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow hover:bg-blue-700 transition duration-200"
          >
            Create Asset
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Assets() {
  const [activeTab, setActiveTab] = useState("addAssets");
  return (
    <SAAdminLayout>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-60 bg-white rounded-xl shadow-md p-4 space-y-3">
          <button
            onClick={() => setActiveTab("addAssets")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "addAssets"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            ➕ Add Assets
          </button>
          <button
            onClick={() => setActiveTab("assetsList")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "assetsList"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            📋 All Assets
          </button>
          <button
            onClick={() => setActiveTab("transferAssets")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "transferAssets"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            📋 Transfer Assets
          </button>
           <button
            onClick={() => setActiveTab("transferhistory")}
            className={`block w-full text-left px-4 py-5 rounded-lg ${
              activeTab === "transferhistory"
                ? "bg-blue-100 text-black"
                : "hover:bg-blue-100 text-black"
            }`}
          >
            📋 Transfer History
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 rounded-lg p-6 overflow-y-auto">
          {activeTab === "addAssets" && <AddAssets />}
          {activeTab === "assetsList" && <AllInv />}
          {activeTab === "transferAssets" && <Transferassest />}
          {activeTab === "transferhistory" && <History />}

        </div>
      </div>
    </SAAdminLayout>
  );
}
