const express = require('express');
const { automatePhishingAttack,streamPhishingLogs } = require('../controllers/phishingController');

const router = express.Router();

// Receive the Evilginx phishing link and start the attack
router.post('/simulate', automatePhishingAttack);
router.get("/logs", streamPhishingLogs); //  Add SSE logs endpoint

module.exports = router;
