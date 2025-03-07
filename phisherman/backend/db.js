const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const speakeasy = require("speakeasy");

const dbPath = path.resolve(__dirname, "database.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

/**
 * Initializes the database by creating tables if they don't exist
 * and inserting initial fake data if necessary.
 */
const initializeDatabase = async () => {
  db.serialize(() => {
    createTables();
    ensureSensitiveDataExists();
    ensureVictimUserExists();
  });
};

/**
 * Creates the required tables in the database if they don't exist.
 */
const createTables = () => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT,
    lastName TEXT,
    email TEXT UNIQUE,
    password TEXT, -- Stored in plain text for the victim user (required for phishing simulation)
    mfaSecret TEXT,
    isMfaEnabled BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS sensitive_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT,
    ssn TEXT,
    creditCardNumber TEXT,
    bankAccountNumber TEXT,
    phoneNumber TEXT,
    address TEXT,
    email TEXT,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
};

/**
 * Checks if sensitive data exists. If not, populates the database with fake data.
 */
const ensureSensitiveDataExists = () => {
  db.get(`SELECT COUNT(*) AS count FROM sensitive_data`, (err, row) => {
    if (err) {
      console.error("Error checking sensitive_data table:", err.message);
    } else if (row.count === 0) {
      console.log("No sensitive data found. Populating with fake data...");
      insertFakeSensitiveData();
    } else {
      console.log("Sensitive data already exists. Skipping data population.");
    }
  });
};

/**
 * Checks if the victim user exists. If not, creates a new victim user with MFA enabled.
 */
const ensureVictimUserExists = () => {
  db.get(`SELECT COUNT(*) AS count FROM users WHERE email = 'victim@sec565.rocks'`, (err, row) => {
    if (err) {
      console.error("Error checking users table:", err.message);
    } else if (row.count === 0) {
      console.log("No victim user found. Creating victim user...");
      insertVictimUser();
    } else {
      console.log("Victim user already exists. Skipping creation.");
    }
  });
};

/**
 * Inserts a test victim user with a **plain-text** password to simulate phishing later.
 * @note The password is NOT hashed for testing purposes.
 */
const insertVictimUser = () => {
  const email = "victim@sec565.rocks";
  const password = "password123"; // Stored in plain text for phishing simulation
  const mfaSecret = speakeasy.generateSecret({ length: 20 }).base32;

  db.run(
    `INSERT INTO users (firstName, lastName, email, password, mfaSecret, isMfaEnabled)
     VALUES ('Victim', 'User', ?, ?, ?, 1)`,
    [email, password, mfaSecret],
    function (err) {
      if (err) {
        console.error("Error inserting victim user:", err.message);
      } else {
        console.log(`Victim user created with MFA enabled. Secret: ${mfaSecret}`);
      }
    }
  );
};

/**
 * Inserts initial fake sensitive data into the database if none exists.
 */
const insertFakeSensitiveData = () => {
  const fakeData = [
    ["John Doe", "123-45-6789", "4111-1111-1111-1111", "9876543210", "555-1234", "123 Main St, NY", "john.doe@example.com", "VIP Customer"],
    ["Jane Smith", "234-56-7890", "5500-2222-3333-4444", "1234567890", "555-5678", "456 Elm St, CA", "jane.smith@example.com", "Prefers email contact"],
    ["Alice Johnson", "345-67-8901", "6011-3333-4444-5555", "2345678901", "555-7890", "789 Oak St, TX", "alice.j@example.com", "Premium account"],
    ["Bob Brown", "456-78-9012", "3056-4444-5555-6666", "3456789012", "555-0000", "111 Maple St, FL", "bob.brown@example.com", "Security risk"],
    ["Charlie Wilson", "567-89-0123", "3723-5555-6666-7777", "4567890123", "555-1111", "222 Pine St, WA", "charlie.w@example.com", "Blacklisted"],
    ["David Lee", "678-90-1234", "6011-6666-7777-8888", "5678901234", "555-2222", "333 Cedar St, OR", "david.lee@example.com", "Frequent flyer"],
    ["Emily Davis", "789-01-2345", "5555-7777-8888-9999", "6789012345", "555-3333", "444 Birch St, NV", "emily.d@example.com", "High-value target"],
    ["Frank Harris", "890-12-3456", "4111-8888-9999-0000", "7890123456", "555-4444", "555 Walnut St, AZ", "frank.h@example.com", "Foreign client"],
    ["Grace Miller", "901-23-4567", "5500-9999-0000-1111", "8901234567", "555-5555", "666 Spruce St, IL", "grace.m@example.com", "Loyal customer"],
    ["Henry Moore", "012-34-5678", "6011-0000-1111-2222", "9012345678", "555-6666", "777 Redwood St, OH", "henry.mo@example.com", "Suspicious activity"],
  ];

  const stmt = db.prepare(
    `INSERT INTO sensitive_data (fullName, ssn, creditCardNumber, bankAccountNumber, phoneNumber, address, email, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  fakeData.forEach((record) => {
    stmt.run(record);
  });

  stmt.finalize();
  console.log("Fake sensitive data inserted successfully.");
};

// ✅ Call initialization function
initializeDatabase();

module.exports = db;
