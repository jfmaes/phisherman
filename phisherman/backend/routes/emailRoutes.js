const express = require("express");
const { sendPhishingEmail } = require("../utils/emailService");
const { hostGuard } = require("../middleware/hostGuardMiddleware");

const router = express.Router();

/**
 * @route   POST /api/email/send-phish
 * @desc    Send a phishing email via MailHog
 * @access  Public (for now)
 */
router.post("/send-phish", hostGuard,sendPhishingEmail);

module.exports = router;
