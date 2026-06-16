import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/useAuth";

const GuestGate = () => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated()) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}

export default GuestGate;