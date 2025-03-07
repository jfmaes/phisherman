import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

/**
 * Landing Page
 * Provides two options: Login or Automatic Phish Simulation.
 */
function Index() {
  const navigate = useNavigate();

  return (
      <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-800">Welcome to Phisherman</h1>
        <p className="text-gray-600 mt-2">Choose an option below to proceed.</p>

        <div className="mt-6 space-y-4">
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/phishing")}
            className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition"
          >
            Automatic Phish Simulation
          </button>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Index;
