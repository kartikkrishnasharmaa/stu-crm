import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Accountdashboard from "../pages/accounts/dashboard/dashboard";

const AccRoutes = () => {
  return (
    <Routes>
      <Route
        path="/account/dashboard"
        element={
          <ProtectedRoute>
            <Accountdashboard />
          </ProtectedRoute>
        }
      />
    
    </Routes>
  );
};
export default AccRoutes;
