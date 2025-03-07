const express = require("express");
const cors = require("cors");
const fs = require("fs");
const https = require("https");
const db = require("./db");

const authRoutes = require("./routes/authRoutes");
const mfaRoutes = require("./routes/mfaRoutes");
const userRoutes = require("./routes/userRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const phishingRoutes = require("./routes/phishingRoutes");
const emailRoutes = require("./routes/emailRoutes");

const app = express();
const port = process.env.PORT || 3000;
const host = "172.13.37.10"; // ✅ Bind to all network interfaces

const options = {
  key: fs.readFileSync("/app/certs/key.pem"),
  cert: fs.readFileSync("/app/certs/cert.pem"),
};

// ✅ Enable CORS (Allows external access - For POC purposes)
app.use(cors({ origin: "*" }));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});

// Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/mfa", mfaRoutes);
app.use("/api/user", userRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/phishing", phishingRoutes);
app.use("/api/email", emailRoutes);

app.get("/", (req, res) => {
  res.send("MFA Application Backend is Running");
});

// ✅ Start HTTPS Server, listening on 0.0.0.0 for external access
https.createServer(options, app).listen(port, host, () => {
  console.log(`✅ Backend running on https://${host}:${port}`);
});
