import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  validateToken,
} from "../services/api";
import Menu from "../components/Menu";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

/**
 * User Management Page
 * Allows admins to view, create, update, and delete user accounts.
 * Only accessible to authenticated users.
 */
function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mfaSecret: "",
    isMfaEnabled: false,
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Validates token before allowing access.
   */
  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await validateToken();
      if (!isValid) {
        console.warn("Unauthorized access - Redirecting to login.");
        navigate("/login");
      } else {
        setIsAuthenticated(true);
        fetchUsers();
      }
    };
    checkAuth();
  }, [navigate]);

  /**
   * Fetches all users from the backend.
   */
  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.data.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setMessage("Error fetching users.");
      if(import.meta.env.VITE_ENV === "hosted") {
        setMessage("Fetching Users is disabled in the hosted environment.");
      }
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
   * Creates a new user.
   */
  const handleCreate = async () => {
    try {
      await createUser(formData);
      setMessage("User added successfully!");
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error("Error creating user:", err);
      setMessage("Failed to add user.");
    }
  };

  /**
   * Updates an existing user.
   */
  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      await updateUser(editingId, formData);
      setMessage("User updated successfully!");
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      setMessage("Failed to update user.");
      if(import.meta.env.VITE_ENV === "hosted") {
        setMessage("Editing Users is disabled in the hosted environment.");
      }
    }
  };

  /**
   * Handles editing a selected user.
   * @param {Object} user - The user object to edit.
   */
  const handleEdit = (user) => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "", // Password won't be pre-filled for security reasons
      mfaSecret: user.mfaSecret,
      isMfaEnabled: user.isMfaEnabled,
    });
    setEditingId(user.id);
  };

  /**
   * Deletes a user.
   * @param {number} id - The ID of the user to delete.
   */
  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      setMessage("User deleted successfully!");
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      setMessage("Failed to delete user.");
      if(import.meta.env.VITE_ENV === "hosted") {
        setMessage("Deleting Users is disabled in the hosted environment.");
      }
    }
  };

  /**
   * Resets the form inputs.
   */
  const resetForm = () => {
    setFormData({ firstName: "", lastName: "", email: "", password: "", mfaSecret: "", isMfaEnabled: false });
    setEditingId(null);
  };

  if (!isAuthenticated) {
    return <p className="text-white text-center mt-10">Verifying session...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Menu />
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-600 mt-2">Manage system users securely.</p>
        {message && <p className="text-center text-lg mt-4">{message}</p>}

        {/* ✅ User Management Form */}
        <div className="mt-6 bg-white p-4 rounded shadow-md">
          {Object.keys(formData).map((key) => (
            <input
              key={key}
              name={key}
              type={key === "password" ? "password" : "text"}
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
              Add User
            </button>
          )}
        </div>

        {/* ✅ User Table */}
        <table className="mt-6 w-full border-collapse border border-gray-300 bg-white rounded shadow-md">
          <thead>
            <tr className="bg-gray-200">
              {["First Name", "Last Name", "Email", "Password", "MFA Secret", "MFA Enabled", "Created At", "Actions"].map(
                (header) => (
                  <th key={header} className="border p-2">
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border p-2">{user.firstName}</td>
                <td className="border p-2">{user.lastName}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{user.password}</td>
                <td className="border p-2">{user.mfaSecret}</td>
                <td className="border p-2">{user.isMfaEnabled ? "Yes" : "No"}</td>
                <td className="border p-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="border p-2 flex space-x-2">
                  <button onClick={() => handleEdit(user)} className="bg-yellow-500 text-white px-3 py-1 rounded">Edit</button>
                  <button onClick={() => handleDelete(user.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
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

export default UserManagement;
