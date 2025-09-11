import React, { useState, useEffect } from 'react';
import axios from "../../../api/axiosConfig";
import './FeesStructure.css';

const FeesStructure = () => {
  const [feeStructures, setFeeStructures] = useState([]);
  const [courses, setCourses] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [viewStructure, setViewStructure] = useState(null);
  const [formData, setFormData] = useState({
    course_id: '',
    student_id: '',
    fee_type: '',
    amount: '',
    payment_mode: '',
    number_of_installments: '',
    coupon_id: '',
    student_fee_payment_id: ''
  });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [finalFee, setFinalFee] = useState(0);
  const [selectedCoupon, setSelectedCoupon] = useState('');
  
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userBranchId = userData.branch_id;

  // Fetch fee structures
  const fetchFeeStructures = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/fee-structures", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Filter fee structures by user's branch_id
      const filteredFeeStructures = res.data.filter(structure => 
        structure.student && structure.student.branch_id === userBranchId
      );
      
      setFeeStructures(filteredFeeStructures || []);
    } catch (error) {
      console.error("Error fetching fee structures:", error);
    }
  };

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/courses/index", {
        headers: { Authorization: `Bearer ${token}` },
        params: { branch_id: userBranchId }
      });
      setCourses(res.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // Fetch all coupons
  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/coupons", {
        headers: { Authorization: `Bearer ${token}` },
        params: { branch_id: userBranchId }
      });
      setCoupons(res.data || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  // Fetch Students
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/students/show", {
        headers: { Authorization: `Bearer ${token}` },
        params: { branch_id: userBranchId }
      });
      setStudents(res.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchFeeStructures();
    fetchCourses();
    fetchCoupons();
    fetchStudents();
  }, []);

  // Update selected course when formData.course_id changes
  useEffect(() => {
    if (formData.course_id) {
      const course = courses.find(c => c.id === parseInt(formData.course_id));
      setSelectedCourse(course);
      if (course) {
        setFormData(prev => ({
          ...prev,
          amount: course.actual_price || 0
        }));
        setFinalFee(course.actual_price || 0);
      }
    } else {
      setSelectedCourse(null);
      setFinalFee(0);
    }
  }, [formData.course_id, courses]);

  // Handle coupon application
  const handleApplyCoupon = () => {
    if (!selectedCoupon) return;
    
    const coupon = coupons.find(c => c.id == selectedCoupon);
    if (!coupon) return;
    
    let newFee = parseFloat(formData.amount || 0);
    
    if (coupon.discount_type === "percentage") {
      newFee = newFee - (newFee * parseFloat(coupon.discount_value)) / 100;
    } else if (coupon.discount_type === "fixed") {
      newFee = newFee - parseFloat(coupon.discount_value);
    }
    
    if (newFee < 0) newFee = 0;
    setFinalFee(newFee);
    
    // Update form data with coupon ID
    setFormData(prev => ({
      ...prev,
      coupon_id: selectedCoupon
    }));
  };

  // Get course name by ID
  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.course_name : `Course ID: ${courseId}`;
  };

  // Get student name by ID
  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.full_name : `Student ID: ${studentId}`;
  };

  // Get student admission number by ID
  const getStudentAdmissionNumber = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.admission_number : 'N/A';
  };

  // Get course details by ID
  const getCourseDetails = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? {
      name: course.course_name,
      code: course.course_code,
      mode: course.mode,
      actual_price: course.actual_price
    } : null;
  };

  // Get student details by ID
  const getStudentDetails = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? {
      name: student.full_name,
      admission_number: student.admission_number,
      contact_number: student.contact_number,
      email: student.email,
      guardian_name: student.guardian_name,
      guardian_contact: student.guardian_contact,
      enrollment_status: student.enrollment_status
    } : null;
  };

  // Get next due date from installments
  const getNextDueDate = (installments) => {
    if (!installments || installments.length === 0) return 'N/A';
    
    const today = new Date();
    const upcomingInstallments = installments.filter(installment => 
      new Date(installment.due_date) > today
    );
    
    if (upcomingInstallments.length === 0) return 'All paid';
    
    // Sort by due date and get the earliest one
    upcomingInstallments.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    return new Date(upcomingInstallments[0].due_date).toLocaleDateString();
  };

  // Get installment status
  const getInstallmentStatus = (installments) => {
    if (!installments || installments.length === 0) return 'N/A';
    
    const today = new Date();
    const paidInstallments = installments.filter(installment => 
      new Date(installment.due_date) < today && parseFloat(installment.amount || 0) > 0
    );
    
    const totalInstallments = installments.length;
    return `${paidInstallments.length}/${totalInstallments} paid`;
  };

  // Stats calculation - only for current branch
  const totalFees = feeStructures.reduce((sum, structure) => sum + parseFloat(structure.amount || 0), 0);
  const totalInstallments = feeStructures.reduce((sum, structure) => 
    sum + (structure.payment_mode === 'installments' ? (structure.number_of_installments || 0) : 0), 0);
  const totalCourses = new Set(feeStructures.map(s => s.course_id)).size;
  const totalStudents = new Set(feeStructures.map(s => s.student_id)).size;

  const openModal = (mode, id = null) => {
    setCurrentEditId(id);
    if (mode === 'edit' && id) {
      const structure = feeStructures.find(s => s.id === id);
      if (structure) {
        setFormData({
          course_id: structure.course_id,
          student_id: structure.student_id || '',
          fee_type: structure.fee_type,
          amount: structure.amount,
          payment_mode: structure.payment_mode,
          number_of_installments: structure.number_of_installments || '',
          coupon_id: structure.coupon_id || '',
          student_fee_payment_id: structure.student_fee_payment_id || ''
        });
        setFinalFee(structure.amount || 0);
        setSelectedCoupon(structure.coupon_id || '');
      }
    } else {
      setFormData({
        course_id: '',
        student_id: '',
        fee_type: '',
        amount: '',
        payment_mode: '',
        number_of_installments: '',
        coupon_id: '',
        student_fee_payment_id: ''
      });
      setSelectedCourse(null);
      setFinalFee(0);
      setSelectedCoupon('');
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentEditId(null);
    setSelectedCourse(null);
    setFinalFee(0);
    setSelectedCoupon('');
  };

  const handleView = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/fee-structures/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setViewStructure(res.data);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error fetching fee structure details:", error);
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewStructure(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this fee structure?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/fee-structures/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeeStructures(feeStructures.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error deleting fee structure:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const feeData = {
        course_id: parseInt(formData.course_id),
        student_id: formData.student_id ? parseInt(formData.student_id) : null,
        fee_type: formData.fee_type,
        amount: finalFee > 0 ? finalFee : parseFloat(formData.amount),
        payment_mode: formData.payment_mode,
        number_of_installments: formData.payment_mode === 'installments' ? parseInt(formData.number_of_installments) : 0,
        coupon_id: formData.coupon_id ? parseInt(formData.coupon_id) : null,
        student_fee_payment_id: formData.student_fee_payment_id ? parseInt(formData.student_fee_payment_id) : null,
        branch_id: userBranchId
      };

      if (currentEditId) {
        // Update existing fee structure
        const res = await axios.put(`/fee-structures/${currentEditId}`, feeData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFeeStructures(feeStructures.map(s => s.id === currentEditId ? res.data : s));
      } else {
        // Create new fee structure
        const res = await axios.post('/fee-structures', feeData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFeeStructures([...feeStructures, res.data]);
      }

      closeModal();
    } catch (error) {
      console.error("Error saving fee structure:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  return (
    <div className="fees-structure-container">
      {/* Header */}
      <header className="fs-header">
        <div className="fs-header-content">
          <div className="fs-header-left">
            <div className="fs-logo">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div className="fs-header-text">
              <h1>Fee Structure Management</h1>
              <p>Manage course fees and payment structures</p>
            </div>
          </div>
          <button onClick={() => openModal('add')} className="fs-add-btn">
            <i className="fas fa-plus"></i>
            Add Fee Structure
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="fs-main">
        {/* Stats Cards */}
        <div className="fs-stats-grid">
          <div className="fs-stat-card">
            <div className="fs-stat-content">
              <div className="fs-stat-icon bg-green">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="fs-stat-text">
                <p>Active Structures</p>
                <h3>{feeStructures.length}</h3>
              </div>
            </div>
          </div>
          
          <div className="fs-stat-card">
            <div className="fs-stat-content">
              <div className="fs-stat-icon bg-purple">
                <i className="fas fa-book"></i>
              </div>
              <div className="fs-stat-text">
                <p>Courses</p>
                <h3>{totalCourses}</h3>
              </div>
            </div>
          </div>

          <div className="fs-stat-card">
            <div className="fs-stat-content">
              <div className="fs-stat-icon bg-red">
                <i className="fas fa-users"></i>
              </div>
              <div className="fs-stat-text">
                <p>Students Enrolled</p>
                <h3>{totalStudents}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Fee Structures Table */}
        <div className="fs-table-container">
          <div className="fs-table-header">
            <h2>Fee Structures</h2>
          </div>
          <div className="fs-table-wrapper">
            <table className="fs-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Fee Type</th>
                  <th>Amount</th>
                  <th>Payment Mode</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feeStructures.map(structure => (
                  <tr key={structure.id}>
                    <td>
                      <div className="fs-student-info">
                        <div className="fs-student-icon">
                          <i className="fas fa-user"></i>
                        </div>
                        <div>
                          <div className="fs-student-name">{structure.student?.full_name || getStudentName(structure.student_id)}</div>
                          <div className="fs-student-details">
                            Admission No: {structure.student?.admission_number || getStudentAdmissionNumber(structure.student_id)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="fs-course-info">
                        <div>
                          <div className="fs-course-name">{getCourseName(structure.course_id)}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="fs-badge fs-badge-blue">
                        {structure.fee_type}
                      </span>
                    </td>
                    <td className="fs-amount">
                      ₹{parseFloat(structure.amount || 0).toLocaleString()}
                    </td>
                    <td>
                      <span className={`fs-badge ${structure.payment_mode === 'installments' ? 'fs-badge-green' : 'fs-badge-orange'}`}>
                        {structure.payment_mode}
                      </span>
                    </td>
                    <td>
                      {new Date(structure.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="fs-actions">
                        <button onClick={() => handleView(structure.id)} className="fs-action-btn text-blue">
                          <i className="fas fa-eye"></i>
                        </button>
                        <button onClick={() => openModal('edit', structure.id)} className="fs-action-btn text-green">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button onClick={() => handleDelete(structure.id)} className="fs-action-btn text-red">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fs-modal-backdrop">
          <div className="fs-modal">
            <div className="fs-modal-header">
              <h3>{currentEditId ? 'Edit Fee Structure' : 'Add Fee Structure'}</h3>
              <button onClick={closeModal} className="fs-modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="fs-modal-form">
              <div className="fs-form-grid">
                <div className="fs-form-group">
                  <label>Course</label>
                  <select 
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.course_name} ({course.course_code})
                      </option>
                    ))}
                  </select>
                  {selectedCourse && (
                    <div className="fs-course-price-info">
                      <p>Actual Price: ₹{parseFloat(selectedCourse.actual_price || 0).toLocaleString()}</p>
                    </div>
                  )}
                </div>
                
                <div className="fs-form-group">
                  <label>Student</label>
                  <select 
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.full_name} ({student.admission_number})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="fs-form-group">
                  <label>Fee Type</label>
                  <select 
                    name="fee_type"
                    value={formData.fee_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Fee Type</option>
                    <option value="Tuition">Tuition</option>
                    <option value="Exam">Exam</option>
                    <option value="Library">Library</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
                
                <div className="fs-form-group">
                  <label>Amount (₹)</label>
                  <input 
                    type="number" 
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    step="0.01"
                    required
                    disabled={!!selectedCourse}
                  />
                </div>
                
                <div className="fs-form-group">
                  <label>Payment Mode</label>
                  <select 
                    name="payment_mode"
                    value={formData.payment_mode}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Payment Mode</option>
                    <option value="installments">Installments</option>
                    <option value="one-time">One-time</option>
                  </select>
                </div>
                
                {formData.payment_mode === 'installments' && (
                  <div className="fs-form-group">
                    <label>Number of Installments</label>
                    <input 
                      type="number" 
                      name="number_of_installments"
                      value={formData.number_of_installments}
                      onChange={handleInputChange}
                      min="2"
                      max="12"
                      required
                    />
                  </div>
                )}
                
                <div className="fs-form-group">
                  <label>Apply Coupon</label>
                  <div className="fs-coupon-section">
                    <select
                      value={selectedCoupon}
                      onChange={(e) => setSelectedCoupon(e.target.value)}
                      className="fs-coupon-select"
                    >
                      <option value="">-- Select Coupon --</option>
                      {coupons
                        .filter(c => !formData.course_id || c.course_id == formData.course_id)
                        .map(coupon => (
                          <option key={coupon.id} value={coupon.id}>
                            {coupon.code} ({coupon.discount_type} - {coupon.discount_value})
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="fs-apply-coupon-btn"
                    >
                      Apply
                    </button>
                  </div>
                  {finalFee > 0 && finalFee !== parseFloat(formData.amount || 0) && (
                    <div className="fs-final-fee">
                      Final Fee after discount: ₹{finalFee.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="fs-modal-actions">
                <button type="button" onClick={closeModal} className="fs-cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="fs-save-btn">
                  <i className="fas fa-save"></i>
                  Save Fee Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewStructure && (
        <div className="fs-modal-backdrop">
          <div className="fs-modal fs-view-modal">
            <div className="fs-modal-header">
              <h3>Fee Structure Details</h3>
              <button onClick={closeViewModal} className="fs-modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="fs-view-content">
              <div className="fs-view-grid">
                <div>
                  <h4>Student Information</h4>
                  <div className="fs-info-box">
                    {viewStructure.student ? (
                      <>
                        <p className="fs-info-title">{viewStructure.student.full_name}</p>
                        <p><strong>Admission No:</strong> {viewStructure.student.admission_number}</p>
                        <p><strong>Contact:</strong> {viewStructure.student.contact_number}</p>
                        <p><strong>Email:</strong> {viewStructure.student.email}</p>
                        <p><strong>Guardian:</strong> {viewStructure.student.guardian_name} ({viewStructure.student.guardian_contact})</p>
                        <p><strong>Status:</strong> {viewStructure.student.enrollment_status}</p>
                      </>
                    ) : (
                      <p>Student ID: {viewStructure.student_id}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4>Course Information</h4>
                  <div className="fs-info-box">
                    {getCourseDetails(viewStructure.course_id) ? (
                      <>
                        <p className="fs-info-title">{getCourseDetails(viewStructure.course_id).name}</p>
                        <p><strong>Code:</strong> {getCourseDetails(viewStructure.course_id).code}</p>
                        <p><strong>Mode:</strong> {getCourseDetails(viewStructure.course_id).mode}</p>
                        <p><strong>Actual Price:</strong> ₹{parseFloat(getCourseDetails(viewStructure.course_id).actual_price || 0).toLocaleString()}</p>
                      </>
                    ) : (
                      <p>Course ID: {viewStructure.course_id}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="fs-view-grid">
                <div>
                  <h4>Fee Details</h4>
                  <div className="fs-info-box">
                    <p className="fs-info-title">₹{parseFloat(viewStructure.amount || 0).toLocaleString()}</p>
                    <p><strong>Type:</strong> {viewStructure.fee_type}</p>
                    <p><strong>Mode:</strong> {viewStructure.payment_mode}</p>
                    {viewStructure.payment_mode === 'installments' && (
                      <p><strong>Installments:</strong> {viewStructure.number_of_installments}</p>
                    )}
                    {viewStructure.coupon_id && (
                      <p><strong>Coupon Applied:</strong> {viewStructure.coupon_id}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4>Dates</h4>
                  <div className="fs-info-box">
                    <p><strong>Created:</strong> {new Date(viewStructure.created_at).toLocaleString()}</p>
                    <p><strong>Updated:</strong> {new Date(viewStructure.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              {viewStructure.payment_mode === 'installments' && viewStructure.installments && viewStructure.installments.length > 0 && (
                <div>
                  <h4>Installment Details</h4>
                  <div className="fs-info-box">
                    <div className="fs-installments-list">
                      <table className="fs-installments-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Amount</th>
                            <th>Due Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewStructure.installments.map((installment, index) => (
                            <tr key={installment.id || index}>
                              <td>{installment.installment_number || index + 1}</td>
                              <td>₹{parseFloat(installment.amount || 0).toLocaleString()}</td>
                              <td>{new Date(installment.due_date).toLocaleDateString()}</td>
                              <td>
                                <span className={`fs-badge ${new Date(installment.due_date) > new Date() ? 'fs-badge-green' : 'fs-badge-red'}`}>
                                  {new Date(installment.due_date) > new Date() ? 'Upcoming' : 'Due'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesStructure;