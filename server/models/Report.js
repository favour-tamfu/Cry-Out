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

  description: {
    type: String,
    default: "No text description provided.",
  },

  media: [String],

  location: {
    lat: Number,
    lng: Number,
    address: String,
  },

  contactPolice: { type: Boolean, default: false },

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

  isPriority: { type: Boolean, default: false },

  isEscalated: { type: Boolean, default: false },

  resolution: {
    resolvedBy: String,
    resolvedAt: Date,
    notes: String,
    proof: [String],
  },

  contactInfo: {
    method: { type: String, enum: ["PHONE", "EMAIL", "NONE"], default: "NONE" },
    value: String,
    safeToVoicemail: Boolean,
    safeTime: String,
    immediateHelp: Boolean,
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", ReportSchema);
