const express = require('express');
const {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
  } = require("../controllers/userController");
const { authenticateToken } = require('../middleware/authMiddleware');
const {hostGuard} = require('../middleware/hostGuardMiddleware');

const router = express.Router();
router.get("/users", hostGuard, authenticateToken, getAllUsers);
router.post("/users", authenticateToken, createUser);
router.put("/users/:id", hostGuard,authenticateToken, updateUser);
router.delete("/users/:id", hostGuard,authenticateToken, deleteUser);

module.exports = router;
