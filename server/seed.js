require("dotenv").config();
const mongoose = require("mongoose");
const Organization = require("./models/Organization");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to DB for Seeding"))
  .catch((err) => console.log(err));

const seedOrgs = [
  {
    name: "Central Police Station",
    type: "POLICE",
    accessCode: "police123",
    location: "Douala",
    status: "APPROVED",
    allowedCategories: [
      "Domestic Violence",
      "Sexual Assault",
      "Physical Abuse",
      "Stalking",
    ],
  },
  {
    name: "Safe Haven Women's Shelter",
    type: "SHELTER",
    accessCode: "safe123",
    location: "Buea",
    status: "APPROVED",
    allowedCategories: ["Domestic Violence", "Stalking", "Other"],
  },
  {
    name: "St. Mary's Community Center",
    type: "COMMUNITY",
    accessCode: "help123",
    location: "Limbe",
    status: "APPROVED",
    allowedCategories: ["Other", "Physical Abuse"],
  },
];

const seedDB = async () => {
  console.log("🌱 Seeding Database (Safe Mode)...");

 
  for (const org of seedOrgs) {
    await Organization.findOneAndUpdate(
      { accessCode: org.accessCode }, // Find by access code
      org, // Update with new data 
      { upsert: true, new: true } // Create if doesn't exist
    );
  }

  console.log("✅ Core Accounts Updated/Restored!");
  mongoose.connection.close();
};


seedDB();
