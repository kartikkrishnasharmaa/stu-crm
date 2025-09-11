import { useEffect, useState } from "react";
import axios from "../../../api/axiosConfig";
import SAAdminLayout from "../../../layouts/StaffLayout";
import { FaArrowDown, FaArrowUp, FaFilter, FaRupeeSign } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userBranchId = userData.branch_id;
  const userBranchName = userData.branch_name || "Your Branch";

  // ✅ Courses API fetch
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/courses/index", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // ✅ Revenue API fetch (GET method with query parameters)
  const fetchRevenueData = async () => {
    if (!userBranchId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/monthly-revenue", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          year: selectedYear,
          branch_id: userBranchId
        }
      });
      
      setRevenueData(res.data);
      
      // Calculate total revenue
      const total = res.data.monthly_revenue.reduce((sum, month) => {
        return sum + parseFloat(month.student_fee || 0);
      }, 0);
      
      setTotalRevenue(total);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      alert("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (userBranchId) {
      fetchRevenueData();
    }
  }, [userBranchId, selectedYear]);

  const workload = [
    {
      name: "Shawn Stone",
      role: "UI/UX Designer",
      img: "https://sipl.ind.in/wp-content/uploads/2022/07/dummy-user.png",
    },
    {
      name: "Randy Delgado",
      role: "UI/UX Designer",
      img: "https://sipl.ind.in/wp-content/uploads/2022/07/dummy-user.png",
    },
    {
      name: "Emily Tyler",
      role: "Copywriter",
      img: "https://sipl.ind.in/wp-content/uploads/2022/07/dummy-user.png",
    },
    {
      name: "Louis Castro",
      role: "Copywriter",
      img: "https://sipl.ind.in/wp-content/uploads/2022/07/dummy-user.png",
    },
  ];

  const events = [
    {
      title: "Presentation of the new department",
      time: "Today | 5:00 PM",
      up: true,
    },
    { title: "Anna's Birthday", time: "Today | 6:00 PM", down: true },
    { title: "Ray's Birthday", time: "Tomorrow | 2:00 PM", down: true },
  ];

  const activity = [
    {
      name: "Oscar Holloway",
      role: "UI/UX Designer",
      action: "Updated the status of Mind Map task to In Progress",
    },
    {
      name: "Oscar Holloway",
      role: "UI/UX Designer",
      action: "Attached files to the task",
    },
    {
      name: "Emily Tyler",
      role: "Copywriter",
      action: "Updated the status of Mind Map task to In Progress",
    },
  ];

  // Generate year options (last 10 years and next 2 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear - 10; i <= currentYear + 2; i++) {
    yearOptions.push(i);
  }

  // Prepare chart data with attractive colors
  const chartData = {
    labels: revenueData?.monthly_revenue?.map(item => item.month.substring(0, 3)) || [],
    datasets: [
      {
        label: 'Monthly Revenue (₹)',
        data: revenueData?.monthly_revenue?.map(item => item.student_fee) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(199, 199, 199, 0.8)',
          'rgba(83, 102, 255, 0.8)',
          'rgba(40, 159, 64, 0.8)',
          'rgba(210, 99, 132, 0.8)',
          'rgba(130, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
          'rgba(40, 159, 64, 1)',
          'rgba(210, 99, 132, 1)',
          'rgba(130, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
          'rgba(40, 159, 64, 1)',
          'rgba(210, 99, 132, 1)',
          'rgba(130, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#4B5563',
          font: {
            size: 12,
            family: 'Nunito, sans-serif'
          }
        }
      },
      title: {
        display: true,
        text: `Monthly Revenue Analysis - ${selectedYear}`,
        color: '#374151',
        font: {
          size: 16,
          weight: 'bold',
          family: 'Nunito, sans-serif'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1F2937',
        bodyColor: '#1F2937',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 10,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `Revenue: ₹${context.raw.toLocaleString('en-IN')}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#4B5563',
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        },
        title: {
          display: true,
          text: 'Revenue (₹)',
          color: '#4B5563',
          font: {
            family: 'Nunito, sans-serif'
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#4B5563',
          font: {
            family: 'Nunito, sans-serif'
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <SAAdminLayout>
      <div className="p-6 bg-[#F4F9FD] min-h-screen">
        <p className="text-gray-500">Welcome Back,</p>
        <h1 className="text-[30px] mb-2 font-nunito">Dashboard</h1>
        
       <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold font-nunito">Revenue Summary</h2>
              <p className="text-sm opacity-90">Total revenue for {selectedYear}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold flex items-center justify-end">
                <FaRupeeSign className="mr-1" /> {totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm opacity-90">{revenueData?.branch_name || userBranchName}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Full width for revenue chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue Chart Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <h2 className="font-semibold text-xl font-nunito text-gray-800 mb-4 md:mb-0">Revenue Analytics</h2>
                
                {/* Year Selector */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                    <FaFilter className="text-gray-500 mr-2" />
                    <select 
                      className="bg-transparent border-none text-sm focus:ring-0"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    >
                      {yearOptions.map(year => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Display current branch info */}
              <div className="mb-4 text-sm text-gray-600">
                Showing data for: <span className="font-semibold">{userBranchName}</span>
              </div>
              
              {/* Chart Display */}
              {loading ? (
                <div className="flex justify-center items-center h-80">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="rounded-full bg-gray-200 h-12 w-12 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              ) : revenueData ? (
                <div className="h-80">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div className="flex justify-center items-center h-80 text-gray-500">
                  <p>Loading revenue data for {userBranchName}...</p>
                </div>
              )}
            </div>

            {/* Workload */}
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg font-nunito">Workload</h2>
                <button className="text-blue-500 text-sm">View all</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {workload.map((person, i) => (
                  <div
                    key={i}
                    className="border rounded-lg p-3 flex flex-col items-center text-center hover:shadow transition-shadow duration-200"
                  >
                    <img
                      src={person.img}
                      alt={person.name}
                      className="w-12 h-12 rounded-full mb-2 object-cover"
                    />
                    <p className="font-medium text-sm">{person.name}</p>
                    <p className="text-xs text-gray-500">{person.role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Courses (from API) */}
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg font-nunito">Courses</h2>
                <button className="text-blue-500 text-sm">
                  <a href="/sinfodeadmin/courses">View all</a>
                </button>
              </div>
              <div className="space-y-4">
                {courses.length > 0 ? (
                  courses.map((c, i) => (
                    <div key={i} className="border rounded-lg p-4 hover:shadow transition-shadow duration-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{c.course_name}</h3>
                          Trainer: {c.trainer?.employee_name || "N/A"}
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
                          {c.course_level || "General"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-3 text-sm">
                        <p>Duration: {c.duration || "N/A"}</p>
                        <p>
                          Students Enrolled:{" "}
                          <span className="font-semibold">
                            {c.students?.length || 0}
                          </span>
                        </p>
                        <p>Fee: ₹{c.actual_price || "0"}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No courses available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Nearest Events */}
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-lg font-nunito">
                  Nearest Events
                </h2>
                <button className="text-blue-500 text-sm">View all</button>
              </div>
              <ul className="space-y-6">
                {events.map((e, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center border-b pb-2 last:border-none"
                  >
                    <div className="space-y-6">
                      <p className="font-medium text-sm">{e.title}</p>
                      <p className="text-xs text-gray-500">{e.time}</p>
                    </div>
                    {e.up && <FaArrowUp className="text-green-500" />}
                    {e.down && <FaArrowDown className="text-red-500" />}
                  </li>
                ))}
              </ul>
            </div>

            {/* Activity Stream */}
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-semibold text-lg font-nunito">
                Activity Stream
              </h2>
              <div className="space-y-14">
                {activity.map((a, i) => (
                  <div
                    key={i}
                    className="border space-y-4 rounded-lg p-3 hover:shadow transition-shadow duration-200"
                  >
                    <p className="text-sm font-nunito font-medium">
                      {a.name}{" "}
                      <span className="text-gray-500 text-xs">({a.role})</span>
                    </p>
                    <p className="text-xs text-gray-500">{a.action}</p>
                  </div>
                ))}
              </div>
              <button className="mt-3 text-blue-500 text-sm">View more</button>
            </div>
          </div>
        </div>
      </div>
    </SAAdminLayout>
  );
}