import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/useAuth";

export function AuthGate() {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        console.log("Unauthenticated, redirecting to login")
    }
    return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}