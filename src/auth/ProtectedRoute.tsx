import { Navigate, Outlet } from "react-router";
import { useAuth } from "./AuthProvider";

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
