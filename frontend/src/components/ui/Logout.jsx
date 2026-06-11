// Name: Paula Tica
// Date: 05/23/2026

import { useAuth } from "@/lib/useAuth";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
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