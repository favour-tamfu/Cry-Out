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
    allowedCategories: ["Domestic Violence", "Stalking", "Other"],
  },
  {
    name: "St. Mary's Community Center",
    type: "COMMUNITY",
    accessCode: "help123",
    allowedCategories: ["Other", "Physical Abuse", "Domestic Violence"],
  },
];

const seedDB = async () => {
  await Organization.deleteMany({}); // Clear old data
  await Organization.insertMany(seedOrgs); // Add new data
  console.log("🌱 Database Seeded with Organizations!");
  mongoose.connection.close();
};

seedDB();
