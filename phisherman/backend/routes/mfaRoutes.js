const express = require('express');
const { setupMFA, verifyMFA } = require('../controllers/mfaController');

const router = express.Router();

router.post('/setup', setupMFA);
router.post('/verify-mfa', verifyMFA);

module.exports = router;
