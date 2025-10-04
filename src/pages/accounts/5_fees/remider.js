import React, { useState, useEffect } from 'react';
import axios from "../../../api/axiosConfig";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Reminder = () => {
  const [activeTab, setActiveTab] = useState('overdue');
  const [overdueData, setOverdueData] = useState([]);
  const [todayData, setTodayData] = useState([]);
  const [upcomingData, setUpcomingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState(null);

  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userBranchId = userData.branch_id;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/fee-reminders?type=${activeTab}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const filteredData = (res.data.data || []).filter(item =>
          item.fee_structure.student.branch_id === userBranchId
        );

        if (activeTab === 'overdue') setOverdueData(filteredData);
        else if (activeTab === 'today') setTodayData(filteredData);
        else setUpcomingData(filteredData);
      } catch (error) {
        console.error(`Error fetching ${activeTab} data:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, userBranchId]);

  const getCurrentData = () => {
    if (activeTab === 'overdue') return overdueData;
    if (activeTab === 'today') return todayData;
    return upcomingData;
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Send manual reminder API
  const sendReminder = async (installmentId) => {
    try {
      setSendingId(installmentId);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        '/send-manual-reminder',
        { installment_id: installmentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message || "Reminder sent successfully!");
    } catch (error) {
      console.error("Error sending reminder:", error);
      toast.error(error.response?.data?.message || "Failed to send reminder");
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">Fee Reminder</h2>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex gap-2 bg-gray-200 p-1 rounded-full">
          {['overdue', 'today', 'upcoming'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab ? "bg-[#3F8CFF] text-white" : "bg-transparent text-gray-600 hover:bg-gray-300"
              }`}
            >
              {tab === 'overdue' ? 'Overdue' : tab === 'today' ? 'Today' : 'Upcoming (7 Days)'}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading data...</p>
          </div>
        ) : (
          <>
            {getCurrentData().length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getCurrentData().map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.fee_structure.student.full_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.fee_structure.student.contact_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Installment #{item.installment_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.due_date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${activeTab === 'overdue' ? 'bg-red-100 text-red-800' : 
                              activeTab === 'today' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-green-100 text-green-800'}`}>
                            {activeTab === 'overdue' ? 'Overdue' : activeTab === 'today' ? 'Due Today' : 'Upcoming'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => sendReminder(item.id)}
                            disabled={sendingId === item.id}
                            className={`px-3 py-1 rounded-md text-white text-sm font-medium ${
                              sendingId === item.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                          >
                            {sendingId === item.id ? 'Sending...' : 'Send Reminder'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">No {activeTab} fees found for your branch.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Reminder;
