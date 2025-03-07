const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const {hostGuard} = require('../middleware/hostGuardMiddleware');
const {
  getAllSensitiveData,
  createSensitiveData,
  updateSensitiveData,
  deleteSensitiveData
} = require('../controllers/protectedController');

const router = express.Router();

// Retrieve ALL sensitive data
router.get('/sensitive-data', authenticateToken, getAllSensitiveData);

// Create new sensitive data
router.post('/sensitive-data', hostGuard,authenticateToken, createSensitiveData);

// Update existing sensitive data
router.put('/sensitive-data/:id', hostGuard,authenticateToken, updateSensitiveData);

// Delete sensitive data
router.delete('/sensitive-data/:id', hostGuard,authenticateToken, deleteSensitiveData);

module.exports = router;
