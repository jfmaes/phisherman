const express = require('express');
const { registerUser, loginUser,logoutUser } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post("/logout", logoutUser); // ✅ Add logout route
router.get("/validate-token", authenticateToken, (req, res) => {
  res.json({ message: "Token is valid." });
});

module.exports = router;
