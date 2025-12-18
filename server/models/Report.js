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
    required: true,
  },
  media: [String],

  location: {
    lat: Number,
    lng: Number,
    address: String,
  },

  //To choose whether to involve police
  contactPolice: {
    type: Boolean,
    default: false, // Default is NO police
  },

  status: {
    type: String,
    default: "Pending",
    enum: ["Pending", "Reviewed", "Action Taken"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Report", ReportSchema);
