import SAAdminLayout from "../../../layouts/Sinfodeadmin";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";

export default function StaffDetail() {
  const { id } = useParams();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStaffDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/accountants/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaff(res.data);
    } catch (error) {
      console.error("Error fetching staff details:", error);
      alert("Failed to load staff details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffDetails();
  }, [id]);

  if (loading) {
    return (
      <SAAdminLayout>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="text-blue-500 text-lg">Loading staff details...</div>
        </div>
      </SAAdminLayout>
    );
  }

  if (!staff) {
    return (
      <SAAdminLayout>
        <div className="p-6 text-red-500 text-center">No staff found</div>
      </SAAdminLayout>
    );
  }

  return (
    <SAAdminLayout>
      <div className="p-6 flex flex-col lg:flex-row gap-6">
        {/* Left Profile Section */}
        <div className="w-full lg:w-[300px] bg-white shadow-md rounded-xl p-6">
          {/* Profile Image + Name */}
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold">
              {staff.accountant_name?.charAt(0) || "?"}
            </div>
            <h2 className="mt-3 text-xl font-semibold">
              {staff.accountant_name}
            </h2>
            <p className="text-gray-500">{staff.designation}</p>
            <span className="mt-2 bg-blue-100 text-blue-600 text-sm font-semibold px-3 py-1 rounded-full">
              {staff.employee_code}
            </span>
            
            {/* Status Badge */}
            <div className={`mt-3 text-sm font-semibold px-3 py-1 rounded-full ${
              staff.status === "Active" 
                ? "bg-green-100 text-green-600" 
                : "bg-red-100 text-red-600"
            }`}>
              {staff.status}
            </div>
          </div>

          {/* Main Info */}
          <div className="mt-6">
            <h3 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">
              Main Information
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <span className="mr-2">🏢</span>
                <div>
                  <p className="font-medium">Department</p>
                  <p>{staff.department || "Not specified"}</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="mr-2">📍</span>
                <div>
                  <p className="font-medium">Branch</p>
                  <p>{staff.branch?.branch_name || "Not specified"}</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="mr-2">📅</span>
                <div>
                  <p className="font-medium">Joining Date</p>
                  <p>{staff.joining_date || "Not specified"}</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="mr-2">💰</span>
                <div>
                  <p className="font-medium">Monthly Salary</p>
                  <p>₹{staff.monthly_salary || "Not specified"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-6">
            <h3 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">
              Contact Information
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <span className="mr-2">📧</span>
                <div>
                  <p className="font-medium">Email</p>
                  <p>{staff.email || "Not specified"}</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="mr-2">📞</span>
                <div>
                  <p className="font-medium">Contact Number</p>
                  <p>{staff.contact_number || "Not specified"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Section */}
        <div className="flex-1 bg-white shadow-md rounded-xl p-6">
          {/* Login Credentials */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Login Credentials</h2>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               
                <div>
                  <p className="text-sm font-medium text-gray-600">Login Email</p>
                  <p className="text-lg font-semibold">{staff.user?.email || "N/A"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-600">Password</p>
                  <div className="flex items-center justify-between bg-white p-3 rounded border">
                    <p className="text-lg font-mono">{staff.user?.plain_password || "N/A"}</p>
                    <button 
                      className="text-blue-500 text-sm font-medium hover:text-blue-700"
                      onClick={() => {
                        navigator.clipboard.writeText(staff.user?.plain_password || "");
                        alert("Password copied to clipboard!");
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">System Information</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               
                <div>
                  <p className="text-sm font-medium text-gray-600">Created At</p>
                  <p className="text-md">{new Date(staff.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="text-md">{new Date(staff.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SAAdminLayout>
  );
}
