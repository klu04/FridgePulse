import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/useAuth";
const AuthGate = () => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        console.log("Unauthenticated, redirecting to login")
    }
    return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
}
export default AuthGate;