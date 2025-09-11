import { useState, useEffect, useRef } from "react";
import axios from "../../../api/axiosConfig";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave
} from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

export default function Allstudents() {
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [userBranchId, setUserBranchId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(false);
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

  // Get user info from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserRole(user.role);
      setUserBranchId(user.branch_id);
      // For branch managers, set the selected branch to their branch
      if (user.role === "branch_manager") {
        setSelectedBranch(user.branch_id.toString());
      }
    }
  }, []);

  // Fetch Students based on user role
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      
      let url = "/students/show";
      // If user is branch manager, fetch only their branch students
      if (user.role === "branch_manager") {
        url = `/branches/${user.branch_id}`;
      }
      
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Handle different response structures
      if (user.role === "branch_manager") {
        // For branch managers, extract students from the branch response
        setStudents(res.data.students || []);
      } else {
        // For admin, use the direct students array
        setStudents(res.data || []);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Fetch Branches - only for admin users
  // const fetchBranches = async () => {
  //   try {
  //     const user = JSON.parse(localStorage.getItem("user"));
  //     // Only fetch branches if user is admin
  //     if (user.role === "admin") {
  //       const token = localStorage.getItem("token");
  //       const res = await axios.get("/branches", {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       setBranches(res.data || []);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching branches:", error);
  //   }
  // };

  // Fetch Batches
  // const fetchBatches = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const res = await axios.get("/batches", {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     setBatches(res.data || []);
  //   } catch (error) {
  //     console.error("Error fetching batches:", error);
  //   }
  // };

  // // Fetch Courses
  // const fetchCourses = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const res = await axios.get("/courses", {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     setCourses(res.data || []);
  //   } catch (error) {
  //     console.error("Error fetching courses:", error);
  //   }
  // };

  useEffect(() => {
    fetchStudents();
    // fetchBranches();
    // fetchBatches();
    // fetchCourses();
  }, []);

  // Fetch single student data
  const fetchStudent = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/students/show/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedStudent(res.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching student:", error);
      alert("Failed to fetch student details");
    }
  };

  // Update student
  const updateStudent = async (id, data) => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      
      // Check if user has permission to update this student
      if (user.role === "branch_manager") {
        // For branch managers, check if student belongs to their branch
        const student = students.find(s => s.id === id);
        if (student && student.branch_id !== user.branch_id) {
          alert("You don't have permission to update this student");
          return;
        }
      }
      
      setLoading(true);
      await axios.put(`/students/update/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Student updated successfully");
      setShowEditModal(false);
      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Failed to update student");
    } finally {
      setLoading(false);
    }
  };

  // Delete student
  const deleteStudent = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      
      // Check if user has permission to delete this student
      if (user.role === "branch_manager") {
        // For branch managers, check if student belongs to their branch
        const student = students.find(s => s.id === id);
        if (student && student.branch_id !== user.branch_id) {
          alert("You don't have permission to delete this student");
          return;
        }
      }
      
      if (window.confirm("Are you sure you want to delete this student?")) {
        await axios.delete(`/students/destroy/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Student deleted successfully");
        fetchStudents(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student");
    }
  };

  // Open edit modal and populate form data
  const openEditModal = (student) => {
    setSelectedStudent(student);
    setEditFormData({
      full_name: student.full_name || "",
      email: student.email || "",
      phone: student.contact_number || "",
      admission_number: student.admission_number || "",
      admission_date: student.admission_date || "",
      dob: student.dob || "",
      gender: student.gender || "",
      address: student.address || "",
      guardian_name: student.guardian_name || "",
      guardian_contact: student.guardian_contact || "",
      batch_id: student.batch_id || "",
      course_id: student.course_id || "",
      enrollment_status: student.enrollment_status || "Active"
    });
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    updateStudent(selectedStudent.id, editFormData);
  };

  // Filter students by branch + search
  const filteredStudents = students.filter((s) => {
    // For branch managers, we already filtered by API, but still check
    const matchesBranch = userRole === "admin" 
      ? selectedBranch === "" || s.branch_id === parseInt(selectedBranch)
      : true; // For branch managers, all fetched students are from their branch

    const matchesSearch =
      (s.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.admission_number || "").toLowerCase().includes(search.toLowerCase());

    return matchesBranch && matchesSearch;
  });

  // Filter batches by selected branch (for branch managers)
  const filteredBatches = userRole === "branch_manager" 
    ? batches.filter(batch => batch.branch_id === parseInt(userBranchId))
    : batches;

  // Filter courses by selected branch (for branch managers)
  const filteredCourses = userRole === "branch_manager" 
    ? courses.filter(course => course.branch_id === parseInt(userBranchId))
    : courses;

  return (
    <div className="px-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[34px] font-nunito">
          Students{" "}
          <span className="text-[34px] font-nunito">
            ({filteredStudents.length})
          </span>
        </h1>
        
        {/* Branch Dropdown - only show for admin */}
        {userRole === "admin" && (
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
        )}
        
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

      {/* List View */}
      {viewMode === "list" ? (
        <div className="space-y-3">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white shadow-sm hover:shadow-md transition rounded-xl px-5 py-4 flex items-center"
            >
              {/* Left: Profile + Details */}
              <div className="flex items-center gap-4">
                <img
                  src={student.photo || "/default-avatar.png"}
                  alt={student.full_name}
                  className="w-12 h-12 rounded-full object-cover border"
                />
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {student.full_name}
                  </h3>
                  <p className="text-gray-500 text-sm">{student.email}</p>
                </div>
              </div>

              {/* Middle Info */}
              <div className="hidden md:flex flex-col text-sm text-gray-600 flex-1 items-center">
                <span className="font-medium">Guardian Name:</span>
                <span>{student.guardian_name}</span>
              </div>

              {/* Right Menu */}
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
                      onClick={() => fetchStudent(student.id)}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-purple-600"
                    >
                      <FaEye size={16} /> View
                    </button>

                    <button
                      onClick={() => openEditModal(student)}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-blue-600"
                    >
                      <FaEdit size={16} /> Edit
                    </button>

                    <button
                      onClick={() => deleteStudent(student.id)}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-red-600"
                    >
                      <FaTrash size={16} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Card View
        <div className="grid mt-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white mt-6 rounded-2xl shadow hover:shadow-lg transition p-6 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-md -mt-10 mb-3">
                <img
                  src={student.photo || "/default-avatar.png"}
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
                Admission Date: {student.admission_date}
              </span>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => fetchStudent(student.id)}
                  className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm"
                >
                  View
                </button>
                <button
                  onClick={() => openEditModal(student)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteStudent(student.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student Detail Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Student Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <img
                  src={selectedStudent.photo || "/default-avatar.png"}
                  alt={selectedStudent.full_name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
                <h3 className="text-xl font-semibold mt-4">{selectedStudent.full_name}</h3>
                <p className="text-gray-500">{selectedStudent.email}</p>
              </div>
              
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Admission Number</p>
                  <p className="font-medium">{selectedStudent.admission_number}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Admission Date</p>
                  <p className="font-medium">{selectedStudent.admission_date}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{selectedStudent.dob}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{selectedStudent.gender}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedStudent.contact_number}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{selectedStudent.address}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Guardian Name</p>
                  <p className="font-medium">{selectedStudent.guardian_name}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Guardian Contact</p>
                  <p className="font-medium">{selectedStudent.guardian_contact}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Batch</p>
                  <p className="font-medium">{selectedStudent.batch?.batch_name}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-medium">{selectedStudent.course?.course_name}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Enrollment Status</p>
                  <p className="font-medium">{selectedStudent.enrollment_status}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  openEditModal(selectedStudent);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2"
              >
                <FaEdit /> Edit
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Edit Student</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={editFormData.full_name}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                    required
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                    required
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Admission Number *</label>
                  <input
                    type="text"
                    name="admission_number"
                    value={editFormData.admission_number}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                    required
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Admission Date</label>
                  <input
                    type="date"
                    name="admission_date"
                    value={editFormData.admission_date}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={editFormData.dob}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={editFormData.gender}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    name="guardian_name"
                    value={editFormData.guardian_name}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Guardian Contact</label>
                  <input
                    type="text"
                    name="guardian_contact"
                    value={editFormData.guardian_contact}
                    onChange={handleInputChange}
                    className="border p-2 rounded"
                  />
                </div>

      
              </div>
              
              <div className="mt-4 flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={editFormData.address}
                  onChange={handleInputChange}
                  className="border p-2 rounded"
                  rows="3"
                />
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? "Saving..." : (
                    <>
                      <FaSave /> Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}