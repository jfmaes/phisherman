const db = require("../db");
const bcrypt = require("bcryptjs");

/**
 * Retrieves all users (excluding sensitive information like passwords).
 */
exports.getAllUsers = (req, res) => {
  console.log("Fetching all users...");
  db.all(`SELECT * FROM users`, [], (err, data) => {
    if (err) {
      console.error("Database Error (getAllUsers):", err.message);
      return res.status(500).json({ error: "Error retrieving users" });
    }
    if (!data || data.length === 0) {
      console.warn("No users found in the database.");
      return res.status(404).json({ error: "No users found." });
    }
    console.log(`Retrieved ${data.length} users successfully.`);
    res.json({ message: "All users retrieved successfully", data });
  });
};

/**
 * Creates a new user.
 */
exports.createUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    `INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)`,
    [firstName, lastName, email, hashedPassword],
    function (err) {
      if (err) {
        console.error("Database Error (createUser):", err.message);
        return res.status(500).json({ error: "Error creating user" });
      }
      res.json({ id: this.lastID, message: "User created successfully" });
    }
  );
};

/**
 * Updates an existing user.
 */
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, password } = req.body;

  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  db.run(
    `UPDATE users SET 
      firstName = ?, 
      lastName = ?, 
      email = ?, 
      password = COALESCE(?, password) 
      WHERE id = ?`,
    [firstName, lastName, email, hashedPassword, id],
    function (err) {
      if (err || this.changes === 0) {
        return res.status(500).json({ error: "Error updating user" });
      }
      res.json({ message: "User updated successfully" });
    }
  );
};

/**
 * Deletes a user.
 */
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.userId; // ✅ Get authenticated user ID from token

  if (parseInt(id) === currentUserId) {
    console.warn(`User ${currentUserId} attempted to delete themselves.`);
    return res.status(403).json({ error: "You cannot delete your own account." });
  }

  db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
    if (err || this.changes === 0) {
      return res.status(500).json({ error: "Error deleting user" });
    }
    res.json({ message: "User deleted successfully" });
  });

   // ✅ Blacklist the token for the deleted user
   tokenBlacklist.add(req.headers.authorization?.split(" ")[1]);
   console.log(`Token invalidated for deleted user: ${user.email}`);

   res.json({ message: "User deleted successfully, token invalidated." });
};
