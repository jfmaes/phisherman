const db = require("../db");
const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");

class User {
  /**
   * Creates a new user with a hashed password.
   * @param {string} firstName
   * @param {string} lastName
   * @param {string} email
   * @param {string} password
   * @returns {Promise<number>} - Returns the user ID.
   */
  static async createUser(firstName, lastName, email, password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      return new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)`,
          [firstName, lastName, email, hashedPassword],
          function (err) {
            if (err) {
              console.error("Database Error (createUser):", err.message);
              return reject(err);
            }
            resolve(this.lastID);
          }
        );
      });
    } catch (error) {
      console.error("Error hashing password:", error.message);
      throw new Error("Internal server error");
    }
  }

  /**
   * Finds a user by email.
   * @param {string} email
   * @returns {Promise<object|null>} - Returns user object or null if not found.
   */
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err) {
          console.error("Database Error (findByEmail):", err.message);
          return reject(err);
        }
        resolve(user || null);
      });
    });
  }

  /**
   * Updates the MFA secret and enables MFA for a user.
   * @param {string} email
   * @param {string} secret
   * @returns {Promise<boolean>} - Returns true if update was successful.
   */
  static async updateMFASecret(email, secret) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE users SET mfaSecret = ?, isMfaEnabled = 1 WHERE email = ?`,
        [secret, email],
        function (err) {
          if (err) {
            console.error("Database Error (updateMFASecret):", err.message);
            return reject(err);
          }
          resolve(this.changes > 0);
        }
      );
    });
  }

  /**
   * Verifies the MFA token for a user.
   * @param {string} email
   * @param {string} token
   * @returns {Promise<boolean>} - Returns true if the token is valid.
   */
  static async verifyMFA(email, token) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err) {
          console.error("Database Error (verifyMFA):", err.message);
          return reject(err);
        }
        if (!user) {
          console.warn(`MFA verification failed - User not found: ${email}`);
          return resolve(false);
        }
        if (!user.mfaSecret) {
          console.warn(`MFA verification failed - MFA not enabled: ${email}`);
          return resolve(false);
        }

        console.log(`Verifying MFA for user: ${email}, with secret ${user.mfaSecret}`);

        //this is a debug function to generate the token on the server side
        const generatedbackendtoken = speakeasy.totp({
          secret: user.mfaSecret,
          encoding: "base32",
          algorithm: "sha1"
        });

        console.log(`Generated token: ${generatedbackendtoken}`);
        console.log(`Received token: ${token}`);

        const verified = speakeasy.totp.verify({
          secret: user.mfaSecret,
          encoding: "base32",
          algorithm: "sha1",
          token,
          window: 2,
        });

        if (!verified) {
          console.warn(`MFA verification failed - Invalid code for user: ${email}`);
        }

        resolve(verified);
      });
    });
  }

  /**
   * Validates user login credentials.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object|null>} - Returns the user if credentials are correct, otherwise null.
   */
  static async validateLogin(email, password) {
    const user = await User.findByEmail(email);
    if (!user) {
      console.warn(`Login failed - User not found: ${email}`);
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.warn(`Login failed - Incorrect password for: ${email}`);
      return null;
    }

    return user;
  }

  /**
   * Updates a user's password.
   * @param {string} email
   * @param {string} newPassword
   * @returns {Promise<boolean>} - Returns true if password was updated.
   */
  static async updatePassword(email, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      return new Promise((resolve, reject) => {
        db.run(
          `UPDATE users SET password = ? WHERE email = ?`,
          [hashedPassword, email],
          function (err) {
            if (err) {
              console.error("Database Error (updatePassword):", err.message);
              return reject(err);
            }
            resolve(this.changes > 0);
          }
        );
      });
    } catch (error) {
      console.error("Error hashing new password:", error.message);
      throw new Error("Internal server error");
    }
  }
}

module.exports = User;
