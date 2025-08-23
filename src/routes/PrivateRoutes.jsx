import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";

export function PrivateRoute() {
  const { token } = useAuth();
  const session = sessionStorage.getItem("auth")
  if (session) {
    const data = JSON.parse(session);
    if (!data.token) {
      return <Navigate to="/login" replace />;
    }
  }
  if(!session){
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
