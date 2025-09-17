import { useState, useEffect } from "react";
import axios from "../../../api/axiosConfig";
import * as XLSX from "xlsx";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaTimes,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaVenusMars,
  FaIdCard,
  FaSchool,
  FaClock,
  FaChalkboardTeacher,
  FaFileExport
} from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

export default function Allstudents() {
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Close menu on outside click
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

  // Fetch Students
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/students/show", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Fetch Branches
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/branches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBranches(res.data || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchBranches();
  }, []);

  // Fetch single student data
  const fetchStudent = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/students/show/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching student:", error);
      return null;
    }
  };

  // Handle View Student
  const handleViewStudent = async (id) => {
    setIsLoading(true);
    const studentData = await fetchStudent(id);
    if (studentData) {
      setSelectedStudent(studentData);
      setShowViewModal(true);
    }
    setIsLoading(false);
    setOpenMenuId(null);
  };

  // Handle Edit Student
  const handleEditStudent = async (id) => {
    setIsLoading(true);
    const studentData = await fetchStudent(id);
    if (studentData) {
      setSelectedStudent(studentData);
      setEditFormData(studentData);
      setShowEditModal(true);
    }
    setIsLoading(false);
    setOpenMenuId(null);
  };

  // Handle Update Student
  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/students/update/${selectedStudent.id}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowEditModal(false);
      fetchStudents(); // Refresh the list
      alert("Student updated successfully!");
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Failed to update student.");
    }
    setIsLoading(false);
  };

  // Handle Delete Student
  const handleDeleteStudent = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/students/destroy/${selectedStudent.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeleteModal(false);
      fetchStudents(); // Refresh the list
      alert("Student deleted successfully!");
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student.");
    }
    setIsLoading(false);
  };

  // Export to Excel function
  const exportToExcel = () => {
    // Prepare data for export
    const dataForExport = filteredStudents.map(student => ({
      "Admission No": student.admission_number,
      "Full Name": student.full_name,
      "Email": student.email,
      "Contact": student.contact_number,
      "Gender": student.gender,
      "DOB": formatDate(student.dob),
      "Admission Date": formatDate(student.admission_date),
      "Guardian Name": student.guardian_name,
      "Guardian Contact": student.guardian_contact,
      "Address": student.address,
      "Branch": student.branch?.branch_name,
      "Course": student.course?.course_name,
      "Batch": student.batch?.batch_name
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    
    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Admission No
      { wch: 25 }, // Full Name
      { wch: 30 }, // Email
      { wch: 15 }, // Contact
      { wch: 10 }, // Gender
      { wch: 15 }, // DOB
      { wch: 15 }, // Admission Date
      { wch: 20 }, // Guardian Name
      { wch: 15 }, // Guardian Contact
      { wch: 40 }, // Address
      { wch: 20 }, // Branch
      { wch: 20 }, // Course
      { wch: 20 }  // Batch
    ];
    worksheet['!cols'] = columnWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, "students.xlsx");
  };

  // Filter students by branch + search
  const filteredStudents = students.filter((s) => {
    const matchesBranch =
      selectedBranch === "" || s.branch_id === parseInt(selectedBranch);

    const matchesSearch =
      (s.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.admission_number || "").toLowerCase().includes(search.toLowerCase());

    return matchesBranch && matchesSearch;
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="px-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-[34px] font-nunito">
          Students{" "}
          <span className="text-[34px] font-nunito">
            ({filteredStudents.length})
          </span>
        </h1>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Branch Dropdown */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="border p-2 rounded w-full md:w-60"
          >
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.branch_name}
              </option>
            ))}
          </select>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-gray-200 p-1 rounded-full">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === "list"
                  ? "bg-[#3F8CFF] text-white"
                  : "bg-transparent text-gray-600 hover:bg-gray-300"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                viewMode === "card"
                  ? "bg-[#3F8CFF] text-white"
                  : "bg-transparent text-gray-600 hover:bg-gray-300"
              }`}
            >
              Card View
            </button>
          </div>
          
          {/* Export Button */}
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors"
          >
            <FaFileExport /> Export Excel
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or admission number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
            <span>Loading...</span>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" ? (
        <div>
          <div className="min-w-[1000px]">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 bg-gray-100 p-4 rounded-t-lg font-semibold">
              <div className="col-span-3">Student</div>
              <div className="col-span-2">Email</div>
              <div className="col-span-2">Contact</div>
              {/* <div className="col-span-2">Admission No</div> */}
              <div className="col-span-2">Branch</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>
            
            {/* Table Rows */}
            <div className="space-y-3">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white shadow-sm hover:shadow-md transition rounded-xl p-4 grid grid-cols-12 gap-4 items-center"
                >
                  {/* Student Info */}
                  <div className="col-span-3 flex items-center gap-4">
                    <img
                      src={student.photo_url}
                      alt={student.full_name}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg truncate">
                        {student.full_name}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {student.gender} • {formatDate(student.dob)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Email */}
                  <div className="col-span-2 text-gray-600 truncate">
                    {student.email || "N/A"}
                  </div>
                  
                  {/* Contact */}
                  <div className="col-span-2 text-gray-600">
                    {student.contact_number || "N/A"}
                  </div>
                  
                  {/* Admission Number */}
                  {/* <div className="col-span-2 text-gray-600 font-medium">
                    {student.admission_number || "N/A"}
                  </div> */}
                  
                  {/* Branch */}
                  <div className="col-span-2 text-gray-600">
                    {student.branch?.branch_name || "N/A"}
                  </div>
                  
                  {/* Actions */}
                  <div className="col-span-1 flex justify-center">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === student.id ? null : student.id)
                        }
                        className="menu-toggle p-2 hover:bg-gray-100 rounded-full"
                      >
                        <HiDotsVertical size={20} />
                      </button>

                      {openMenuId === student.id && (
                        <div
                          className="menu-container absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-40 py-2 z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleViewStudent(student.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-purple-600"
                          >
                            <FaEye size={16} /> View
                          </button>

                          <button
                            onClick={() => handleEditStudent(student.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-blue-600"
                          >
                            <FaEdit size={16} /> Edit
                          </button>

                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowDeleteModal(true);
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
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Card View
        <div className="grid mt-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white mt-6 rounded-2xl shadow hover:shadow-lg transition p-6 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md -mt-10 mb-3">
                <img
                  src={student.photo_url}
                  alt={student.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold">{student.full_name}</h3>
              <p className="text-gray-500">{student.email}</p>
              <div className="grid gap-3 mt-4 w-full text-sm">
                <div className="bg-gray-50 rounded-lg py-2">
                  <p className="text-gray-800 font-bold">
                    Admission No: {student.admission_number}
                  </p>
                </div>
              </div>
              <span className="mt-4 px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                Admission Date: {formatDate(student.admission_date)}
              </span>
              
              {/* Card View Actions */}
              <div className="flex mt-4 space-x-2">
                <button
                  onClick={() => handleViewStudent(student.id)}
                  className="p-2 text-purple-600 hover:bg-purple-100 rounded-full"
                  title="View"
                >
                  <FaEye />
                </button>
                <button
                  onClick={() => handleEditStudent(student.id)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => {
                    setSelectedStudent(student);
                    setShowDeleteModal(true);
                  }}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Student Modal */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">Student Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-shrink-0 mx-auto md:mx-0">
                  <img
                    src={selectedStudent.photo_url}
                    alt={selectedStudent.full_name}
                    className="w-40 h-40 rounded-full object-cover border-4 border-blue-100"
                  />
                </div>
                
                <div className="flex-grow">
                  <h1 className="text-3xl font-bold mb-2">{selectedStudent.full_name}</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-700">
                      <FaIdCard className="mr-2 text-blue-500" />
                      <span>Admission No: {selectedStudent.admission_number}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaVenusMars className="mr-2 text-blue-500" />
                      <span>Gender: {selectedStudent.gender}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      <span>DOB: {formatDate(selectedStudent.dob)}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      <span>Admission: {formatDate(selectedStudent.admission_date)}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaEnvelope className="mr-2 text-blue-500" />
                      <span>{selectedStudent.email}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaPhone className="mr-2 text-blue-500" />
                      <span>{selectedStudent.contact_number}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Address Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-blue-500" />
                    Address
                  </h3>
                  <p className="text-gray-700">{selectedStudent.address}</p>
                </div>
                
                {/* Guardian Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <FaUser className="mr-2 text-blue-500" />
                    Guardian Information
                  </h3>
                  <p className="text-gray-700">
                    <strong>Name:</strong> {selectedStudent.guardian_name}
                  </p>
                  <p className="text-gray-700">
                    <strong>Contact:</strong> {selectedStudent.guardian_contact}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Branch Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <FaSchool className="mr-2 text-blue-500" />
                    Branch
                  </h3>
                  <p className="text-gray-700 font-medium">{selectedStudent.branch?.branch_name}</p>
                  <p className="text-gray-600 text-sm">{selectedStudent.branch?.address}</p>
                  <p className="text-gray-600 text-sm">{selectedStudent.branch?.city}, {selectedStudent.branch?.state}</p>
                </div>
                
                {/* Course Info */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <FaChalkboardTeacher className="mr-2 text-green-500" />
                    Course
                  </h3>
                  <p className="text-gray-700 font-medium">{selectedStudent.course?.course_name}</p>
                  <p className="text-gray-600 text-sm"> {selectedStudent.course?.duration} months</p>
                  <p className="text-gray-600 text-sm">Mode: {selectedStudent.course?.mode}</p>
                </div>
           
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">Edit Student</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateStudent} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editFormData.full_name || ''}
                    onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    className="w-full border rounded-lg p-2"
                    
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={editFormData.contact_number || ''}
                    onChange={(e) => setEditFormData({...editFormData, contact_number: e.target.value})}
                    className="w-full border rounded-lg p-2"
                    
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editFormData.dob || ''}
                    onChange={(e) => setEditFormData({...editFormData, dob: e.target.value})}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select
                    value={editFormData.gender || ''}
                    onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  value={editFormData.address || ''}
                  onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                  className="w-full border rounded-lg p-2"
                  rows="3"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Guardian Name</label>
                  <input
                    type="text"
                    value={editFormData.guardian_name || ''}
                    onChange={(e) => setEditFormData({...editFormData, guardian_name: e.target.value})}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Guardian Contact</label>
                  <input
                    type="text"
                    value={editFormData.guardian_contact || ''}
                    onChange={(e) => setEditFormData({...editFormData, guardian_contact: e.target.value})}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Confirm Deletion</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete student <strong>{selectedStudent.full_name}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteStudent}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}