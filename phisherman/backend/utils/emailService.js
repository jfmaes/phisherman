const nodemailer = require("nodemailer");

/**
 * Sends a phishing email via MailHog.
 * @param {string} from - The sender's email address.
 * @param {string} subject - The email subject.
 * @param {string} body - The email body.
 * @returns {Promise<Object>} - The result of the email sending.
 */
exports.sendPhishingEmail = async (req, res) => {
  const { from, subject, body } = req.body;
  const to = "victim@sec565.rocks"; // Hardcoded target victim email

  if (!from || !subject || !body) {
    return res.status(400).json({ error: "From address, subject, and body are required." });
  }

  console.log(`🚨 Sending phishing email...`);
  console.log(`From: ${from}`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);

  const transporter = nodemailer.createTransport({
    host: "mailhog", // Use internal Docker container name
    port: 1025, // MailHog SMTP port
    secure: false, // No encryption needed for MailHog
  });

  const mailOptions = {
    from,
    to,
    subject,
    html: body, // Accepts full email body from frontend
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Phishing email sent to ${to}`);
    res.json({ message: "Phishing email sent successfully." });
  } catch (error) {
    console.error("❌ Error sending phishing email:", error.message);
    res.status(500).json({ error: "Failed to send phishing email." });
  }
};

/**
 * Extracts the first URL found in the email body.
 * @param {string} emailBody - The email content to parse.
 * @returns {string} - The extracted phishing URL or an error message.
 */
exports.getPhishingUrl = (emailBody) => {
  if (!emailBody) {
    console.error("❌ No email body provided for parsing.");
    throw new Error("Email body is required to extract phishing URL.");
  }

  console.log(`🔍 Parsing phishing URL from email body...`);

  // ✅ Regular expression to extract the first URL
  const urlRegex = /(https?:\/\/[^\s]+)/;
  const match = emailBody.match(urlRegex);

  if (match && match[0]) {
    //console.log(`✅ Extracted phishing URL: ${match[0]}`);
    return match[0]; // ✅ Return the first extracted URL
  } else {
    console.error("❌ No phishing URL found in email body.");
    throw new Error("No phishing URL found in the email body.");
  }
};
