import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [mfaSecret, setMfaSecret] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      console.log("Attempting to register user with email:", email);
      const data = await registerUser(firstName, lastName, email, password);
      console.log("Registration response:", data);

      if (data.qrCodeUrl) {
        setQrCodeUrl(data.qrCodeUrl);
        setMfaSecret(data.secret);
        setMessage("Scan the QR code below in your authenticator app.");
      } else {
        setMessage("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      }
    } catch (err) {
      console.error("Error registering user:", err);
      
      if (err.response) {
        console.log("Error response data:", err.response.data);
        setError(err.response.data.error || "An error occurred while registering.");
      } else if (err.request) {
        console.log("Error request:", err.request);
        setError("No response received from the server.");
      } else {
        console.log("Error message:", err.message);
        setError("Unexpected error occurred. Check the console for more details.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Register</h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-700">First Name</label>
            <input
              type="text"
              placeholder="Enter your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-gray-700">Last Name</label>
            <input
              type="text"
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
            />
          </div>

          <button
            type="submit"
            className={`w-full p-3 rounded-lg transition ${
              isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        {message && <p className="text-green-500 text-sm mt-4">{message}</p>}

        {qrCodeUrl && (
          <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold text-gray-700">Scan this QR code</h3>
            <img src={qrCodeUrl} alt="MFA QR Code" className="mx-auto mt-2 border border-gray-300 p-2 rounded-lg" />
            <p className="text-gray-600 mt-2">Or enter this secret manually:</p>
            <p className="text-gray-800 font-mono text-sm bg-gray-100 p-2 rounded-lg break-all max-w-full">
              {mfaSecret}
            </p>
          </div>
        )}


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

export default Register;
