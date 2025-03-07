const puppeteer = require("puppeteer");
const db = require("../db");
const speakeasy = require("speakeasy");
const { getPhishingUrl } = require("../utils/emailService");

// A Map of userId => Array of active SSE response objects.
const activeSessions = new Map();

/**
 * Streams phishing attack logs to the frontend via SSE.
 */
exports.streamPhishingLogs = (req, res) => {
  const userId = req.query["user-id"];

  // Set required headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  console.log(`✅ New SSE client connected for user: ${userId}`);

  // Store this client's response in our activeSessions map
  if (!activeSessions.has(userId)) {
    activeSessions.set(userId, []);
  }
  activeSessions.get(userId).push(res);

  // Send a quick heartbeat so the client "onopen" fires right away
  res.write(`: hello\n\n`);

  // Handle client disconnect
  req.on("close", () => {
    console.log(`🔴 SSE connection closed for user: ${userId}`);
    const userClients = activeSessions.get(userId) || [];
    activeSessions.set(
      userId,
      userClients.filter((client) => client !== res)
    );
  });
};

/**
 * Broadcasts a log message to all active SSE clients for a given userId.
 */
function broadcastToSSEClients(userId, message) {
  if (!userId || !message) return;
  console.log(`User ${userId} log: ${message}`);

  const userClients = activeSessions.get(userId);
  if (!userClients) return;

  userClients.forEach((client) => {
    try {
      client.write(`data: ${message}\n\n`);
    } catch (err) {
      console.error(`❌ Error sending SSE log to user ${userId}:`, err);
      client.end(); // Close bad SSE connection
    }
  });
}

/**
 * Closes all active SSE connections for the specified userId.
 */
function closeAllConnectionsForUser(userId) {
  if (!activeSessions.has(userId)) return;

  const userClients = activeSessions.get(userId) || [];
  userClients.forEach((client) => {
    try {
      client.end();
    } catch (err) {
      console.error(`❌ Error closing SSE connection for user ${userId}:`, err);
    }
  });
  activeSessions.delete(userId);

  console.log(`🔴 All SSE connections closed for user: ${userId}`);
}

/**
 * Automates a phishing attack via Puppeteer and streams logs to the SSE clients.
 * Called when a client POSTs /api/phishing/simulate with { emailBody } in the request.
 */
exports.automatePhishingAttack = async (req, res) => {
  const { emailBody } = req.body;
  const userId = req.headers["user-id"];

  console.log("simulate phish API hit. User ID:", userId);

  // 1) Basic validation
  if (!emailBody) {
    broadcastToSSEClients(userId, "❌ You did not follow the white Rabbit, Neo...");
    closeAllConnectionsForUser(userId);
    return res
      .status(400)
      .json({ success: false, error: "Email body is required." });
  }

  // 2) Extract phishing URL
  let phishingUrl;
  try {
    broadcastToSSEClients(userId, "🔍 Extracting phishing URL from email...");
    phishingUrl = getPhishingUrl(emailBody);
    broadcastToSSEClients(userId, `✅ Extracted phishing URL: ${phishingUrl}`);
  } catch (error) {
    broadcastToSSEClients(userId, "❌ No phishing URL found in email body.");
    closeAllConnectionsForUser(userId);
    return res
      .status(400)
      .json({ success: false, error: "No phishing URL found in the email body." });
  }

  // 3) Launch Puppeteer and attempt the phishing attack
  try {
    broadcastToSSEClients(userId, `🎯 Starting phishing attack on: ${phishingUrl}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--ignore-certificate-errors"],
    });
    const page = await browser.newPage();

    broadcastToSSEClients(userId, "🌐 Navigating to phishing site...");

    // -- Specialized try/catch around page.goto to detect domain-resolution errors --
    try {
      await page.goto(phishingUrl, { waitUntil: "networkidle2" });
    } catch (gotoError) {
      if (gotoError.message.includes("net::ERR_NAME_NOT_RESOLVED")) {
        broadcastToSSEClients(
          userId,
          "❌ Could not resolve Evilginx domain. Are you sure you're hosting it on a reachable host?"
        );
      } else {
        broadcastToSSEClients(
          userId,
          `❌ Navigation to ${phishingUrl} failed: ${gotoError.message}`
        );
      }
      await browser.close();
      closeAllConnectionsForUser(userId);
      return res.status(500).json({ error: "Phishing attack failed" });
    }

    // Query the DB for the victim's credentials
    db.get(
      `SELECT email, password, mfaSecret FROM users WHERE email = 'victim@sec565.rocks'`,
      async (err, victim) => {
        if (err || !victim) {
          broadcastToSSEClients(userId, "❌ Victim user not found.");
          closeAllConnectionsForUser(userId);
          return res.status(500).json({ error: "Victim user not found" });
        }

        const { email, password, mfaSecret } = victim;

        broadcastToSSEClients(userId, "✍️ Entering credentials...");
        await page.type('input[name="email"]', email);
        await page.type('input[name="password"]', password);
        await page.click('button[type="submit"]');

        broadcastToSSEClients(userId, "⌛ Waiting for MFA input field...");
        await page.waitForSelector('input[name="mfa_code"]', { timeout: 5000 });

        const mfaCode = speakeasy.totp({ secret: mfaSecret, encoding: "base32" });
        broadcastToSSEClients(userId, `🔑 Entering MFA code: ${mfaCode}`);
        await page.type('input[name="mfa_code"]', mfaCode);
        await page.click('button[type="submit"]');

        broadcastToSSEClients(userId, "🔄 Waiting for redirection...");
        await page.waitForNavigation({ waitUntil: "networkidle2" });

        await browser.close();
        broadcastToSSEClients(userId, "✅ Phishing attack completed successfully!");

        // Successfully done
        closeAllConnectionsForUser(userId); // Shut down SSE for this user
        res.json({ success: true, message: "Phishing attack successful!" });
      }
    );
  } catch (error) {
    // Catch any other errors not handled above
    broadcastToSSEClients(userId, "❌ Phishing attack failed.");
    console.error(`A CRITICAL ERROR OCCURRED: ${error.message}`);
    closeAllConnectionsForUser(userId);
    return res.status(500).json({ error: "Phishing attack failed" });
  }
};
