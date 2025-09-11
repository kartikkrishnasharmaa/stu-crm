import { useEffect, useState } from "react";
import axios from "../../../api/axiosConfig";

function Tassets() {
  const [assets, setAssets] = useState([]);
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    asset_id: "",
    from_branch_id: "",
    to_branch_id: "",
    quantity: "",
    transfer_date: "",
  });

  const [message, setMessage] = useState("");

  // ✅ Fetch assets
  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/assets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssets(res.data);
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

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

  useEffect(() => {
    fetchAssets();
    fetchBranches();
  }, []);

  // ✅ Handle Transfer
  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put("/assets/transfer", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("✅ Asset transferred successfully!");
      setFormData({
        asset_id: "",
        from_branch_id: "",
        to_branch_id: "",
        quantity: "",
        transfer_date: "",
      });
    } catch (error) {
      console.error("Error transferring asset:", error);
      setMessage("❌ Failed to transfer asset.");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Transfer Assets</h1>

      {message && (
        <div className="mb-4 text-center text-sm font-medium text-green-600">
          {message}
        </div>
      )}

      <form
        onSubmit={handleTransfer}
        className="bg-white shadow-md rounded-xl p-6 border border-gray-100"
      >
        {/* Asset Dropdown */}
        <label className="block text-sm font-medium mb-1">Select Asset</label>
        <select
          value={formData.asset_id}
          onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
          required
          className="w-full border p-2 rounded mb-4"
        >
          <option value="">-- Select Asset --</option>
          {assets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.asset_name} ({asset.asset_code})
            </option>
          ))}
        </select>

        {/* From Branch Dropdown */}
        <label className="block text-sm font-medium mb-1">From Branch</label>
        <select
          value={formData.from_branch_id}
          onChange={(e) =>
            setFormData({ ...formData, from_branch_id: e.target.value })
          }
          required
          className="w-full border p-2 rounded mb-4"
        >
          <option value="">-- Select From Branch --</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.branchName}
            </option>
          ))}
        </select>

        {/* To Branch Dropdown */}
        <label className="block text-sm font-medium mb-1">To Branch</label>
        <select
          value={formData.to_branch_id}
          onChange={(e) =>
            setFormData({ ...formData, to_branch_id: e.target.value })
          }
          required
          className="w-full border p-2 rounded mb-4"
        >
          <option value="">-- Select To Branch --</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.branchName}
            </option>
          ))}
        </select>

        {/* Quantity */}
        <label className="block text-sm font-medium mb-1">Quantity</label>
        <input
          type="number"
          value={formData.quantity}
          onChange={(e) =>
            setFormData({ ...formData, quantity: e.target.value })
          }
          placeholder="Enter Quantity"
          required
          className="w-full border p-2 rounded mb-4"
        />

        {/* Transfer Date */}
        <label className="block text-sm font-medium mb-1">Transfer Date</label>
        <input
          type="date"
          value={formData.transfer_date}
          onChange={(e) =>
            setFormData({ ...formData, transfer_date: e.target.value })
          }
          required
          className="w-full border p-2 rounded mb-6"
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          Transfer Asset
        </button>
      </form>
    </div>
  );
}

export default Tassets;
