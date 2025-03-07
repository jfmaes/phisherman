const puppeteer = require("puppeteer");
const db = require("../db");
const speakeasy = require("speakeasy");
const { getPhishingUrl } = require("../utils/emailService");
const EventEmitter = require("events");

const logEmitter = new EventEmitter();
let sseClients = [];
let runningAttacks = new Set(); // ✅ Keeps track of active phishing attacks

/**
 * Streams phishing attack logs to frontend using SSE.
 */
exports.streamPhishingLogs = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  console.log("🔴 Connection established. Awaiting phishing attack...");
  sseClients.push(res);
  console.log(`✅ New SSE client connected. Active clients: ${sseClients.length}`);

  req.on("close", () => {
    console.log("🔴 Phishing log connection closed.");
    sseClients = sseClients.filter((client) => client !== res);
  });

  logEmitter.on("log", (message) => {
    res.write(`data: ${message}\n\n`);
  });
};

/**
 * Sends log messages to SSE clients.
 */
const sendLogToClients = (message) => {
  if (!message) return; // ✅ Prevents "undefined" logs
  console.log(message);
  logEmitter.emit("log", message);
};

/**
 * Automates a phishing attack and streams real-time logs.
 */
exports.automatePhishingAttack = async (req, res) => {
  const { emailBody } = req.body;

  if (!emailBody) {
    return res.status(400).json({ error: "Email body is required to extract the phishing URL." });
  }

  if (runningAttacks.has(emailBody)) {
    sendLogToClients("⚠️ Phishing attack already running. Skipping duplicate execution.");
    return res.status(429).json({ error: "Phishing attack already in progress." });
  }

  runningAttacks.add(emailBody); // ✅ Prevents duplicate execution

  let phishingUrl;
  try {
    sendLogToClients("🔍 Extracting phishing URL from email...");
    phishingUrl = getPhishingUrl(emailBody);
    sendLogToClients(`✅ Extracted phishing URL: ${phishingUrl}`);
  } catch (error) {
    sendLogToClients("❌ Failed to extract phishing URL.");
    runningAttacks.delete(emailBody);
    return res.status(400).json({ error: error.message });
  }

  sendLogToClients(`🎯 Starting phishing attack on: ${phishingUrl}`);

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--ignore-certificate-errors"],
    });
    const page = await browser.newPage();

    sendLogToClients("🌐 Navigating to phishing site...");
    await page.goto(phishingUrl, { waitUntil: "networkidle2" });

    db.get(`SELECT email, password, mfaSecret FROM users WHERE email = 'victim@sec565.rocks'`, async (err, victim) => {
      if (err || !victim) {
        sendLogToClients("❌ Victim user not found.");
        runningAttacks.delete(emailBody);
        return res.status(500).json({ error: "Victim user not found" });
      }

      const { email, password, mfaSecret } = victim;

      sendLogToClients("✍️ Entering credentials...");
      await page.type('input[name="email"]', email);
      await page.type('input[name="password"]', password);
      await page.click('button[type="submit"]');

      sendLogToClients("⌛ Waiting for MFA input field...");
      await page.waitForSelector('input[name="mfa_code"]', { timeout: 5000 });

      const mfaCode = speakeasy.totp({ secret: mfaSecret, encoding: "base32" });

      sendLogToClients(`🔑 Entering MFA code: ${mfaCode}`);
      await page.type('input[name="mfa_code"]', mfaCode);
      await page.click('button[type="submit"]');

      sendLogToClients("🔄 Waiting for redirection...");
      await page.waitForNavigation({ waitUntil: "networkidle2" });

      await browser.close();
      sendLogToClients("✅ Phishing attack completed successfully!");
      runningAttacks.delete(emailBody);

      res.json({ message: "Phishing attack successful!" });
    });
  } catch (error) {
    sendLogToClients("❌ Phishing attack failed.");
    console.error(error);
    runningAttacks.delete(emailBody);
    res.status(500).json({ error: "Phishing attack failed" });
  }
};
