import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;

  try {
    const decoded = jwtDecode(token);
    if (role && decoded.role !== role) return <Navigate to="/login" />;
    return children;
  } catch (error) {
    console.error("ProtectedRoute error:", error.message);
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;