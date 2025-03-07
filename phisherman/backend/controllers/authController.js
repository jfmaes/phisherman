const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const db = require("../db");
const {tokenBlacklist} = require("../utils/tokenBlacklist");

const SECRET_KEY = "your_secret_key"; // Replace with an environment variable in production


/**
 * Registers a new user, hashes their password, and generates an MFA secret.
 */
exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    console.log(`Registering new user: ${email}`);

    // ✅ Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`Hashed password for ${email}: ${hashedPassword}`);

    // ✅ Generate MFA Secret
    const mfaSecret = speakeasy.generateSecret({ name: `Phisherman App (${email})` });
    console.log(`Generated MFA Secret for ${email}: ${mfaSecret.base32}`);

    db.run(
      `INSERT INTO users (firstName, lastName, email, password, mfaSecret, isMfaEnabled)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [firstName, lastName, email, hashedPassword, mfaSecret.base32],
      function (err) {
        if (err) {
          console.error("Database Error (registerUser):", err.message);
          return res.status(500).json({ error: "User registration failed." });
        }

        console.log(`User successfully stored in database: ${email}`);

        qrcode.toDataURL(mfaSecret.otpauth_url, (err, qrCodeUrl) => {
          if (err) {
            console.error("QR Code Generation Error:", err.message);
            return res.status(500).json({ error: "Failed to generate QR Code." });
          }

          console.log(`MFA Secret Stored in Database for ${email}: ${mfaSecret.base32}`);

          res.json({
            userId: this.lastID,
            message: "User registered successfully. Scan this QR code in your authenticator app.",
            qrCodeUrl,
            secret: mfaSecret.base32, // Display for debugging (Remove in production)
          });
        });
      }
    );
  } catch (error) {
    console.error("Error during user registration:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * Logs in a user by validating their credentials and initiating the MFA process.
 */
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log(`Login attempt for user: ${email}`);

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
      if (err) {
        console.error("Database Error (loginUser):", err.message);
        return res.status(500).json({ error: "Internal server error." });
      }

      if (!user) {
        console.warn(`Login failed for email: ${email} - User not found.`);
        return res.status(401).json({ error: "Invalid credentials." });
      }

      console.log(`User found: ${email}. Validating password...`);

      // ✅ Verify password using bcrypt
      let isPasswordValid = false;

      // For users starting with "victim", compare the password as a plain string
      if (email.startsWith("victim")) {
        console.warn(`⚠️ Using string comparison for victim user: ${email}`);
        isPasswordValid = password === user.password;
      } else {
        isPasswordValid = await bcrypt.compare(password, user.password);
      }
      
      if (!isPasswordValid) {
        console.warn(`Login failed for email: ${email} - Incorrect password.`);
        return res.status(401).json({ error: "Invalid credentials." });
      }

      console.log(`Login successful for user: ${email}. Proceeding to MFA.`);

      res.json({
        message: "Login successful. Proceed to MFA.",
        email,
      });
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * Logs out a user by invalidating their session (JWT-based).
 */
exports.logoutUser = (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({ error: "No token provided" });
    }

    console.log("Logging out user, blacklisting token:", token);
    tokenBlacklist.add(token);

    res.json({ message: "User logged out successfully." });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};
