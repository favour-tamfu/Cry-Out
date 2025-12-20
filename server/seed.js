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
    status: "APPROVED", // <--- Quotes added here
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
    status: "APPROVED", // <--- Quotes added here
    allowedCategories: ["Domestic Violence", "Stalking", "Other"],
  },
  {
    name: "St. Mary's Community Center",
    type: "COMMUNITY",
    accessCode: "help123",
    location: "Limbe",
    status: "APPROVED", // <--- Quotes added here
    allowedCategories: ["Other", "Physical Abuse"],
  },
];

const seedDB = async () => {
  await Organization.deleteMany({});
  await Organization.insertMany(seedOrgs);
  console.log("🌱 Database Seeded & Approved!");
  mongoose.connection.close();
};

seedDB();
