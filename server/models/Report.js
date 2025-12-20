const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: [
      "Domestic Violence",
      "Sexual Assault",
      "Physical Abuse",
      "Stalking",
      "Other",
    ],
  },
  description: { type: String, required: true },
  media: [String],

  location: {
    lat: Number,
    lng: Number,
    address: String,
  },

  contactPolice: { type: Boolean, default: false },

  // --- NEW: SAFE CONTACT INFO ---
  contactInfo: {
    method: { type: String, enum: ["PHONE", "EMAIL", "NONE"], default: "NONE" },
    value: String, // The actual number or email
    safeToVoicemail: { type: Boolean, default: false },
    safeTime: { type: String, default: null },
    immediateHelp: { type: Boolean, default: false },
  },
  // ------------------------------

  // --- NEW FIELDS FOR CASE MANAGEMENT ---
  status: {
    type: String,
    default: "Pending",
    enum: ["Pending", "In Progress", "Resolved"],
  },
  assignedTo: {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    orgName: String,
    claimedAt: Date,
  },
  // --------------------------------------

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", ReportSchema);
