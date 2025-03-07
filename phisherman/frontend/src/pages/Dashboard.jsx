import React, { useEffect, useState } from "react";
import {
  getSensitiveData,
  createSensitiveData,
  updateSensitiveData,
  deleteSensitiveData,
  validateToken,
} from "../services/api";
import Menu from "../components/Menu";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

/**
 * Dashboard component for viewing and managing sensitive data.
 * Users must be authenticated to access this page.
 */
function Dashboard() {
  const navigate = useNavigate();
  const [sensitiveData, setSensitiveData] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    ssn: "",
    creditCardNumber: "",
    bankAccountNumber: "",
    phoneNumber: "",
    address: "",
    email: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(""); // Success/Error message
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Runs on page load to validate the user's token before allowing access.
   */
  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await validateToken();
      if (!isValid) {
        console.warn("Unauthorized access to Dashboard - Redirecting to login.");
        navigate("/login");
      } else {
        setIsAuthenticated(true);
        fetchData();
      }
    };
    checkAuth();
  }, [navigate]);

  /**
   * Fetches sensitive data from the backend.
   */
  const fetchData = async () => {
    try {
      const response = await getSensitiveData();
      setSensitiveData(response.data.data);
    } catch (err) {
      console.error("Error fetching sensitive data:", err);
      setMessage("Error fetching data.");
    }
  };

  /**
   * Handles form input changes.
   * @param {Event} e - The input change event.
   */
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Submits a new sensitive data entry.
   */
  const handleCreate = async () => {
    try {
      await createSensitiveData(formData);
      setMessage("Data added successfully!");
      resetForm();
      fetchData();
    } catch (err) {
      console.error("Error creating data:", err);
      setMessage("Failed to add data.");
    }
  };

  /**
   * Updates an existing sensitive data entry.
   */
  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      await updateSensitiveData(editingId, formData);
      setMessage("Data updated successfully!");
      resetForm();
      fetchData();
    } catch (err) {
      console.error("Error updating data:", err);
      setMessage("Failed to update data.");
    }
  };

  /**
   * Handles editing a selected entry.
   * @param {Object} item - The sensitive data entry to edit.
   */
  const handleEdit = (item) => {
    setFormData({
      fullName: item.fullName,
      ssn: item.ssn,
      creditCardNumber: item.creditCardNumber,
      bankAccountNumber: item.bankAccountNumber,
      phoneNumber: item.phoneNumber,
      address: item.address,
      email: item.email,
      notes: item.notes,
    });
    setEditingId(item.id);
  };

  /**
   * Deletes a sensitive data entry.
   * @param {number} id - The ID of the entry to delete.
   */
  const handleDelete = async (id) => {
    try {
      await deleteSensitiveData(id);
      setMessage("Data deleted successfully!");
      fetchData();
    } catch (err) {
      console.error("Error deleting data:", err);
      setMessage("Failed to delete data.");
    }
  };

  /**
   * Resets the form inputs.
   */
  const resetForm = () => {
    setFormData({
      fullName: "",
      ssn: "",
      creditCardNumber: "",
      bankAccountNumber: "",
      phoneNumber: "",
      address: "",
      email: "",
      notes: "",
    });
    setEditingId(null);
  };

  if (!isAuthenticated) {
    return <p className="text-white text-center mt-10">Verifying session...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Menu />
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage sensitive data securely.</p>

        {/* ✅ Display messages */}
        {message && <p className="text-center text-lg mt-4">{message}</p>}

        {/* ✅ CRUD Form */}
        <div className="mt-6 bg-white p-4 rounded shadow-md">
          {Object.keys(formData).map((key) => (
            <input
              key={key}
              name={key}
              type="text"
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              className="p-2 border rounded w-full mt-2"
              value={formData[key]}
              onChange={handleInputChange}
            />
          ))}

          {editingId ? (
            <button onClick={handleUpdate} className="bg-green-500 text-white p-2 rounded mt-4 w-full">
              Save Changes
            </button>
          ) : (
            <button onClick={handleCreate} className="bg-blue-500 text-white p-2 rounded mt-4 w-full">
              Add Data
            </button>
          )}
        </div>

        {/* ✅ Display Data */}
        <table className="mt-6 w-full border-collapse border border-gray-300 bg-white rounded shadow-md">
          <thead>
            <tr className="bg-gray-200">
              {["Full Name", "SSN", "Credit Card", "Bank Account", "Phone", "Address", "Email", "Notes", "Actions"].map((header) => (
                <th key={header} className="border p-2">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sensitiveData.map((item) => (
              <tr key={item.id}>
                {Object.keys(formData).map((field) => (
                  <td key={field} className="border p-2">
                    {item[field]}
                  </td>
                ))}
                <td className="border p-2 flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </div>
  );
}

export default Dashboard;
