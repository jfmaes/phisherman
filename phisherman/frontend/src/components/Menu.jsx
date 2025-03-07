import React from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/api"; // ✅ Use named import


function Menu() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log("Logging out...");

    try {
      const token = localStorage.getItem("authToken");
      console.log("Token:", token);
      if (token) {
        await logoutUser(token); 
      }
    } catch (err) {
      console.error("Logout error:", err);
    }

    localStorage.removeItem("authToken"); // ✅ Clear token from frontend
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white p-4 shadow-md">
      <ul className="flex justify-around">
        <li>
          <button onClick={() => navigate("/dashboard")} className="hover:text-blue-400">
            Dashboard
          </button>
        </li>
        <li>
          <button onClick={() => navigate("/users")} className="hover:text-blue-400">
            User Management
          </button>
        </li>
        <li>
          <button onClick={() => navigate("/phishing")} className="hover:text-blue-400">
            Phishing Simulation
          </button>
        </li>
        <li>
          <button onClick={handleLogout} className="hover:text-red-400">
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Menu;
