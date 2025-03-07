const express = require('express');
const {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
  } = require("../controllers/userController");
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();
router.get("/users", authenticateToken, getAllUsers);
router.post("/users", authenticateToken, createUser);
router.put("/users/:id", authenticateToken, updateUser);
router.delete("/users/:id", authenticateToken, deleteUser);

module.exports = router;
