import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (err) {
    user = null;
  }

  const token = localStorage.getItem("token");

  // agar user ya token nahi hai → login page
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
