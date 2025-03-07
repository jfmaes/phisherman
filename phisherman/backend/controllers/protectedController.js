const db = require('../db');

// Get ALL sensitive data (Admin View)
exports.getAllSensitiveData = (req, res) => {
  db.all(`SELECT * FROM sensitive_data`, [], (err, data) => {
    if (err || !data) {
      return res.status(500).json({ error: "Error retrieving sensitive data" });
    }
    res.json({ message: "All sensitive data retrieved successfully", data });
  });
};

// Create a New Sensitive Data Entry
exports.createSensitiveData = (req, res) => {
  const {fullName, ssn, creditCardNumber, bankAccountNumber, phoneNumber, address, email, notes } = req.body;
  
  if (!fullName || !ssn || !creditCardNumber || !bankAccountNumber) {
    return res.status(400).json({ error: "Missing required fields: required fields are fullname,ssn,cc number,bankaccount" });
  }

  db.run(
    `INSERT INTO sensitive_data (fullName, ssn, creditCardNumber, bankAccountNumber, phoneNumber, address, email, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [fullName, ssn, creditCardNumber, bankAccountNumber, phoneNumber, address, email, notes],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Error inserting sensitive data" });
      }
      res.json({message: "Sensitive data created successfully" });
    }
  );
};

// Update Sensitive Data
exports.updateSensitiveData = (req, res) => {
  const { id } = req.params;
  const { fullName, ssn, creditCardNumber, bankAccountNumber, phoneNumber, address, email, notes } = req.body;

  db.run(
    `UPDATE sensitive_data SET fullName = ?, ssn = ?, creditCardNumber = ?, bankAccountNumber = ?, 
     phoneNumber = ?, address = ?, email = ?, notes = ? WHERE id = ?`,
    [fullName, ssn, creditCardNumber, bankAccountNumber, phoneNumber, address, email, notes, id],
    function (err) {
      if (err || this.changes === 0) {
        return res.status(500).json({ error: "Error updating sensitive data or record not found" });
      }
      res.json({ message: "Sensitive data updated successfully" });
    }
  );
};

// Delete Sensitive Data
exports.deleteSensitiveData = (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM sensitive_data WHERE id = ?`, [id], function (err) {
    if (err || this.changes === 0) {
      return res.status(500).json({ error: "Error deleting sensitive data or record not found" });
    }
    res.json({ message: "Sensitive data deleted successfully" });
  });
};
