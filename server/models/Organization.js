const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["POLICE", "SHELTER", "MEDICAL", "COMMUNITY"],
  },
  accessCode: {
    type: String,
    required: true,
  },
  allowedCategories: [String],
});

module.exports = mongoose.model("Organization", OrganizationSchema);
