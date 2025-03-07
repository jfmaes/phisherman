import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyMFA } from "../services/api";

function MFA() {
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      //console.log(`Submitting MFA Code for ${email}:`, mfaCode);
      const response = await verifyMFA(email, mfaCode); // ✅ Pass correct param

      //console.log("MFA verification response:", response);

      if (response.data.token) {
        //console.log("MFA verified successfully! Storing JWT.");

        // ✅ Store the JWT token in localStorage
        localStorage.setItem("authToken", response.data.token);

        // Redirect to dashboard after successful MFA
        navigate("/dashboard");
      } else {
        setError("Unexpected error. Please try again.");
      }
    } catch (err) {
      console.error("MFA verification failed:", err);

      if (err.response && err.response.status === 401) {
        setError("Invalid MFA code. Please try again.");
      } else {
        setError("Network error. Please check your connection.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Enter MFA Code</h2>

        <form onSubmit={handleMfaSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">MFA Code</label>
            <input
              type="text"
              placeholder="Enter MFA Code"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
              name = "mfa_code"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition"
          >
            Verify MFA
          </button>
        </form>

        <button
          onClick={() => navigate("/login")}
          className="w-full mt-4 bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default MFA;
