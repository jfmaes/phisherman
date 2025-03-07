import React, { useState, useEffect } from "react";
import { sendPhishingEmail } from "../services/api";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { v4 as uuidv4 } from "uuid"; // ✅ Import UUID generator



/**
 * Phishing Simulation Page
 * Allows users to send a phishing email via MailHog.
 */
function PhishingSimulation() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("securityteam@sec565.rocks");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");

  // ✅ Ensure each user has a unique UUID stored in localStorage
  useEffect(() => {
    if (!localStorage.getItem("userId")) {
      localStorage.setItem("userId", uuidv4()); // ✅ Generate & store user UUID
    }
  }, []);

  /**
   * Handles sending the phishing email.
   */
  const handleSendPhish = async () => {
    if (!from || !subject || !body) {
      setMessage("❌ Please provide From address, Subject, and Body.");
      return;
    }

    try {
      await sendPhishingEmail(from, subject, body);
      setMessage(`✅ Phishing email sent successfully! Redirecting...`);
      setTimeout(() => {
        navigate("/phishing-execution", { state: { emailBody: body } });
      }, 1500);
    } catch (err) {
      console.error("Error sending phishing email:", err);
      setMessage("❌ Failed to send phishing email.");
      if (import.meta.env.VITE_ENV === 'hosted')
      {
        setMessage("❌ Sending email is disabled in the hosted version of this app.");
        setTimeout(() => {
          navigate("/phishing-execution", { state: { emailBody: body } });
        }, 1500);
      }
      
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Phishing Simulation</h1>
        <p className="text-gray-600 mt-2">Send a phishing email via MailHog.</p>

        <div className="mt-4">
          <label className="block text-gray-700">To:</label>
          <input type="email" value="victim@sec565.rocks" readOnly className="p-2 border rounded w-full bg-gray-200 cursor-not-allowed" />
        </div>

        <div className="mt-4">
          <label className="block text-gray-700">From:</label>
          <input type="email" className="p-2 border rounded w-full" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>

        <div className="mt-4">
          <label className="block text-gray-700">Subject:</label>
          <input type="text" className="p-2 border rounded w-full" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>

        <div className="mt-4">
          <label className="block text-gray-700">Email Body:</label>
          <textarea className="p-2 border rounded w-full h-32" value={body} onChange={(e) => setBody(e.target.value)} />
        </div>

        <button onClick={handleSendPhish} className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition mt-4 w-full">
          Send Phishing Email
        </button>

        {message && <p className="text-lg mt-4">{message}</p>}
      </div>
      <Footer />
    </div>
  );
}

export default PhishingSimulation;
