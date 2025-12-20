const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema({
  // ... existing fields ...
  name: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["POLICE", "SHELTER", "MEDICAL", "COMMUNITY", "LEGAL"],
  },
  country: { type: String },
  region: { type: String },
  city: { type: String },
  address: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  website: { type: String },
  registrationNumber: { type: String },
  description: { type: String },
  documents: [String],
  accessCode: { type: String, required: true, unique: true },

  // --- UPDATED FIELDS ---
  status: {
    type: String,
    default: "PENDING",
    enum: ["PENDING", "APPROVED", "REJECTED"],
  },
  allowedCategories: [String], // You can now edit this
  // ---------------------

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Organization", OrganizationSchema);
