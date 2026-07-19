import { useAuthContext } from "@/hooks/useAuthContext";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  async function handleLogout() {
    if (window.confirm("Are you sure you want to log out?")) {
      await logout();
      navigate("/login");
    }
  }

  return (
    <button onClick={handleLogout} className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-white hover:text-gray-900">
      Log Out
    </button>
  );
}

export default LogoutButton;