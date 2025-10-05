import { useState, useEffect, useRef } from "react";
import axios from "../../../api/axiosConfig";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSearch,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaIdCard,
  FaVenusMars,
  FaMapMarkerAlt
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
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Filter and Sort states
  const [filters, setFilters] = useState({
    gender: "all",
    enrollment_status: "all",
    batch: "all",
    course: "all",
    dateRange: {
      start: "",
      end: ""
    }
  });

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending"
  });

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
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStudents(res.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Fetch branches, batches, courses
  const fetchMasterData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [branchesRes, batchesRes, coursesRes] = await Promise.all([
        axios.get("/branches", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/batches", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("/courses", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setBranches(branchesRes.data || []);
      setBatches(batchesRes.data || []);
      setCourses(coursesRes.data || []);
    } catch (error) {
      console.error("Error fetching master data:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchMasterData();
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Handle date range changes
  const handleDateRangeChange = (rangeType, value) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [rangeType]: value
      }
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      gender: "all",
      enrollment_status: "all",
      batch: "all",
      course: "all",
      dateRange: {
        start: "",
        end: ""
      }
    });
    setSearch("");
    setSelectedBranch("");
  };

  // Get unique values for filter dropdowns
  const uniqueGenders = [...new Set(students.map(student => student.gender).filter(Boolean))];
  const uniqueEnrollmentStatuses = [...new Set(students.map(student => student.enrollment_status).filter(Boolean))];
  const uniqueBatches = [...new Set(students.map(student => student.batch?.batch_name).filter(Boolean))];
  const uniqueCourses = [...new Set(students.map(student => student.course?.course_name).filter(Boolean))];

  // Handle sorting
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-gray-400" />;
    return sortConfig.direction === "ascending" ?
      <FaSortUp className="text-blue-600" /> :
      <FaSortDown className="text-blue-600" />;
  };

  // Apply sorting and filtering
  const processedStudents = students
    .filter((student) => {
      // Search filter
      const matchesSearch =
        (student.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (student.email || "").toLowerCase().includes(search.toLowerCase()) ||
        (student.admission_number || "").toLowerCase().includes(search.toLowerCase()) ||
        (student.guardian_name || "").toLowerCase().includes(search.toLowerCase());

      // Branch filter
      const matchesBranch = userRole === "admin"
        ? selectedBranch === "" || student.branch_id === parseInt(selectedBranch)
        : true;

      // Gender filter
      const matchesGender = filters.gender === "all" || student.gender === filters.gender;

      // Enrollment status filter
      const matchesEnrollment = filters.enrollment_status === "all" || student.enrollment_status === filters.enrollment_status;

      // Batch filter
      const matchesBatch = filters.batch === "all" || student.batch?.batch_name === filters.batch;

      // Course filter
      const matchesCourse = filters.course === "all" || student.course?.course_name === filters.course;

      // Date range filter
      const admissionDate = new Date(student.admission_date);
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

      const matchesDateRange =
        (!startDate || admissionDate >= startDate) &&
        (!endDate || admissionDate <= endDate);

      return matchesSearch && matchesBranch && matchesGender && matchesEnrollment && matchesBatch && matchesCourse && matchesDateRange;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;

      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle nested object sorting
      if (sortConfig.key === 'batch') {
        aValue = a.batch?.batch_name;
        bValue = b.batch?.batch_name;
      } else if (sortConfig.key === 'course') {
        aValue = a.course?.course_name;
        bValue = b.course?.course_name;
      }

      // Handle date sorting
      if (sortConfig.key === 'admission_date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Students Management</h1>
          <p className="text-gray-600">Manage and track all student information</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-200 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "list"
                  ? "bg-[#3F8CFF] text-white shadow-sm"
                  : "bg-transparent text-gray-600 hover:bg-gray-300"
                }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "card"
                  ? "bg-[#3F8CFF] text-white shadow-sm"
                  : "bg-transparent text-gray-600 hover:bg-gray-300"
                }`}
            >
              Card View
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, admission number, or guardian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 p-2 pl-10 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Branch Dropdown - only show for admin */}
          {userRole === "admin" && (
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg w-full md:w-60 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
          )}

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <FaFilter /> Filters
            {Object.values(filters).some(filter =>
              typeof filter === 'string' ? filter !== 'all' :
                Object.values(filter).some(Boolean)
            ) && (
                <span className="bg-red-500 text-white rounded-full w-2 h-2"></span>
              )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Gender Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={filters.gender}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                  className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Genders</option>
                  {uniqueGenders.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
              </div>

              {/* Enrollment Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Status</label>
                <select
                  value={filters.enrollment_status}
                  onChange={(e) => handleFilterChange('enrollment_status', e.target.value)}
                  className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  {uniqueEnrollmentStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Batch Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                <select
                  value={filters.batch}
                  onChange={(e) => handleFilterChange('batch', e.target.value)}
                  className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Batches</option>
                  {uniqueBatches.map(batch => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>

              {/* Course Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  value={filters.course}
                  onChange={(e) => handleFilterChange('course', e.target.value)}
                  className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Courses</option>
                  {uniqueCourses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date Range</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                    className="border border-gray-300 p-2 rounded-lg w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Start Date"
                  />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                    className="border border-gray-300 p-2 rounded-lg w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="End Date"
                  />
                </div>
              </div>
            </div>

            {/* Reset Filters */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
      <div>
        Showing <span className="font-medium">{processedStudents.length}</span> of{" "}
        <span className="font-medium">{students.length}</span> students
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-800">{students.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaUser className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-green-600">
                {students.filter(student => student.enrollment_status === 'Active').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaUser className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Filtered Results</p>
              <p className="text-2xl font-bold text-purple-600">{processedStudents.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FaFilter className="text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-orange-600">
                {students.filter(student => {
                  const admissionDate = new Date(student.admission_date);
                  const currentMonth = new Date().getMonth();
                  const currentYear = new Date().getFullYear();
                  return admissionDate.getMonth() === currentMonth && admissionDate.getFullYear() === currentYear;
                }).length}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FaCalendarAlt className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === "list" ? (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="p-4 text-sm font-semibold tracking-wide text-left">Sr. No.</th>
                  <th
                    className="p-4 text-sm font-semibold tracking-wide text-left cursor-pointer hover:bg-gray-100 transition-colors"
                  
                  >
                    <div className="flex items-center gap-2">
                      Student Name
                    </div>
                  </th>
  
                  <th
                    className="p-4 text-sm font-semibold tracking-wide text-left cursor-pointer hover:bg-gray-100 transition-colors"
                  
                  >
                    <div className="flex items-center gap-2">
                      Course
                    </div>
                  </th>
                  <th
                    className="p-4 text-sm font-semibold tracking-wide text-left cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-400" />
                      Admission Date
                    </div>
                  </th>
                  <th className="p-4 text-sm font-semibold tracking-wide text-left">Status</th>
                  <th className="p-4 text-sm font-semibold tracking-wide text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {processedStudents.length > 0 ? (
                  processedStudents.map((student, index) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm text-gray-700">{index + 1}</td>
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.photo_url || "/default-avatar.png"}
                            alt={student.full_name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{student.full_name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <FaEnvelope className="text-gray-400" />
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                  
             
                      <td className="p-4 text-sm text-gray-700">
                        {student.course?.course_name || 'N/A'}
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        {formatDate(student.admission_date)}
                      </td>
                      <td className="p-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${student.enrollment_status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          }`}>
                          {student.enrollment_status}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="flex justify-center">
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === student.id ? null : student.id)}
                              className="menu-toggle p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <HiDotsVertical size={18} />
                            </button>

                            {openMenuId === student.id && (
                              <div
                                className="menu-container absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-32 py-2 z-50 border"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => fetchStudent(student.id)}
                                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-purple-600 text-sm"
                                >
                                  <FaEye size={14} /> View
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center p-8 text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <FaSearch className="text-4xl text-gray-300 mb-2" />
                        <p className="text-lg">No students found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Card View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {processedStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden"
            >
              <div className="p-4 flex flex-col items-center text-center">
                <div className="relative mt-5 mb-3">
                  <img
                    src={student.photo_url || "/default-avatar.png"}
                    alt={student.full_name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{student.full_name}</h3>
                <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
                  <FaEnvelope className="text-gray-400" />
                  {student.email}
                </p>

                <div className="w-full space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Admission No:</span>
                    <span className="font-medium">{student.admission_number}</span>
                  </div>
                  {/* <div className="flex justify-between items-center">
                    <span className="text-gray-500">Batch:</span>
                    <span className="font-medium">{student.batch?.batch_name || 'N/A'}</span>
                  </div> */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Course:</span>
                    <span className="font-medium">{student.course?.course_name || 'N/A'}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${student.enrollment_status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                    }`}>
                    {student.enrollment_status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${student.gender === 'Male'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-pink-100 text-pink-800'
                    }`}>
                    {student.gender}
                  </span>
                </div>

                <button
                  onClick={() => fetchStudent(student.id)}
                  className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    

      {/* Student Detail Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Student Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Section */}
              <div className="lg:col-span-1 flex flex-col items-center">
                <img
                  src={selectedStudent.photo_url || "/default-avatar.png"}
                  alt={selectedStudent.full_name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                />
                <h3 className="text-xl font-semibold mt-4 text-gray-800">{selectedStudent.full_name}</h3>
                <p className="text-gray-500 flex items-center gap-2 mt-1">
                  <FaEnvelope className="text-gray-400" />
                  {selectedStudent.email}
                </p>
                <div className="mt-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedStudent.enrollment_status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                    }`}>
                    {selectedStudent.enrollment_status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${selectedStudent.gender === 'Male'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-pink-100 text-pink-800'
                    }`}>
                    {selectedStudent.gender}
                  </span>
                </div>
              </div>

              {/* Details Section */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <FaIdCard className="text-gray-400" />
                    Admission Number
                  </p>
                  <p className="font-medium text-gray-800">{selectedStudent.admission_number}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" />
                    Admission Date
                  </p>
                  <p className="font-medium text-gray-800">{formatDate(selectedStudent.admission_date)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" />
                    Date of Birth
                  </p>
                  <p className="font-medium text-gray-800">{formatDate(selectedStudent.dob)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <FaPhone className="text-gray-400" />
                    Phone Number
                  </p>
                  <p className="font-medium text-gray-800">{selectedStudent.contact_number}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-400" />
                    Address
                  </p>
                  <p className="font-medium text-gray-800">{selectedStudent.address}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Guardian Name</p>
                  <p className="font-medium text-gray-800">{selectedStudent.guardian_name}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Guardian Contact</p>
                  <p className="font-medium text-gray-800">{selectedStudent.guardian_contact}</p>
                </div>

                {/* <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Batch</p>
                  <p className="font-medium text-gray-800">{selectedStudent.batch?.batch_name || 'N/A'}</p>
                </div> */}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-medium text-gray-800">{selectedStudent.course?.course_name || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
