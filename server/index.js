require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Report = require("./models/Report");
const Organization = require("./models/Organization");

// --- UPLOAD TOOLS (FINAL CONFIGURATION) ---
const cloudinary = require("cloudinary");
// Logic to handle different library versions (Constructor vs Function)
const CloudinaryStorage =
  require("multer-storage-cloudinary").CloudinaryStorage ||
  require("multer-storage-cloudinary");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());

// 1. CONFIGURE CLOUDINARY
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. CONFIGURE STORAGE
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Pass the ROOT object
  params: {
    folder: "cryout-evidence",
    allowed_formats: ["jpg", "png", "jpeg", "mp3", "wav", "mp4", "m4a"],
    resource_type: "auto",
  },
});

const upload = multer({ storage: storage });

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// --- REPORT ROUTE (FIXED) ---
app.post("/api/reports", upload.array("evidence"), async (req, res) => {
  try {
    console.log("📨 Receiving Report...");

    // Debug: Log the file object to confirm Cloudinary response
    if (req.files && req.files.length > 0) {
      console.log("🔍 File Details:", req.files[0]);
    }

    const reportData = {
      category: req.body.category,
      description: req.body.description,
      contactPolice: req.body.contactPolice === "true",
      location: req.body.location
        ? JSON.parse(req.body.location)
        : { lat: 0, lng: 0, address: "Not provided" },

      // --- THE FIX IS HERE ---
      // Checks multiple properties to find the real URL
      media: req.files
        ? req.files.map((file) => file.path || file.secure_url || file.url)
        : [],
      // -----------------------
    };

    const newReport = new Report(reportData);
    const savedReport = await newReport.save();

    console.log(`📝 Report Saved! ID: ${savedReport._id}`);
    console.log(`📸 Media Links Saved:`, reportData.media);

    res.status(201).json(savedReport);
  } catch (err) {
    console.error("Save Error:", err);
    res
      .status(500)
      .json({ message: "Error saving report", error: err.message });
  }
});

// --- ADMIN ROUTES ---
app.post("/api/login", async (req, res) => {
  try {
    const { accessCode } = req.body;
    const org = await Organization.findOne({ accessCode });
    if (!org) return res.status(401).json({ message: "Invalid Access Code" });
    res.json(org);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/api/org-reports/:orgId", async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org) return res.status(404).json({ message: "Org not found" });

    let filter = { category: { $in: org.allowedCategories } };
    if (org.type === "POLICE") filter.contactPolice = true;

    const reports = await Report.find(filter).sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json(err);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
