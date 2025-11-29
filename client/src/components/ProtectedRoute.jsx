import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, roleRequired }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) return <Navigate to="/login" />;

  if (roleRequired && user.role !== roleRequired) {
    return (
      <p style={{ textAlign: "center", marginTop: "2rem" }}>
        No access permission!
      </p>
    );
  }

  return children;
}
