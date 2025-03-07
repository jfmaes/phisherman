import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Index from "./pages/Index"
import Register from "./pages/Register";
import MFA from "./pages/MFA";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import PhishingSimulation from "./pages/PhishingSimulation";
import PhishingExecution from "./pages/PhishingExecution";

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect "/" to "/login" */}
        <Route path="*" element={<Navigate to="/index" />} />
        <Route path="/index" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mfa" element={<MFA />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/phishing" element={<PhishingSimulation />} />
        <Route path="/phishing-execution" element={<PhishingExecution />} />
      </Routes>
    </Router>
  );
}

export default App;
