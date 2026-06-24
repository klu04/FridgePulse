import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function AuthGate() {
    const { isAuthenticated } = useAuth();
    
    const isLoggedIn = isAuthenticated();

    if (!isLoggedIn) {
        console.log("Unauthenticated, redirecting to login");
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
export default AuthGate;