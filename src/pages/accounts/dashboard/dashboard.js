import axios from "../../../api/axiosConfig";
import SAAdminLayout from "../../../layouts/AccountLayout";
export default function Dashboard() {
  
  return (
    <SAAdminLayout>
      <div className="p-6 bg-[#F4F9FD] min-h-screen">
        <p className="text-gray-500">Welcome Back,</p>
        <h1 className="text-[30px] mb-2 font-nunito">Accountant's Dashboard</h1>
        
      
      </div>
    </SAAdminLayout>
  );
}