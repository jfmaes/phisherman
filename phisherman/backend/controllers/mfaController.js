const speakeasy = require('speakeasy');
const jwt = require("jsonwebtoken");
const User = require('../models/userModel');

const SECRET_KEY = "phisherman_private_secret_key_123"; // Replace with env variable in production


exports.setupMFA = async (req, res) => {
  try {
    const { email } = req.body;
    const secret = speakeasy.generateSecret({ name: `MFA-App (${email})` });

    await User.updateMFASecret(email, secret.base32);
    res.json({ secret: secret.base32, otpauth_url: secret.otpauth_url });
  } catch (error) {
    res.status(500).json({ error: "Failed to enable MFA" });
  }
};

exports.verifyMFA = async (req, res) => {
  try {

    //console.log("Received MFA request:", req.body);
    const { email, mfaToken } = req.body; // ✅ Rename 'token' to 'mfaToken'

    //console.log(`MFA verification attempt for: ${email}`,mfaToken);

    // ✅ Use the User model instead of direct DB queries
    const isVerified = await User.verifyMFA(email, mfaToken, require("speakeasy"));

    if (!isVerified) {
      console.warn(`MFA failed for email: ${email} - Invalid code.`);
      return res.status(401).json({ error: "Invalid MFA code" });
    }

    console.log(`MFA successful for email: ${email}`);

    // ✅ Generate a JWT Token (Valid for 8 hours)
    const authToken = jwt.sign({ email }, SECRET_KEY, { expiresIn: "8h" });

    res.json({ message: "MFA verification successful", token: authToken });
  } catch (error) {
    console.error("MFA verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};