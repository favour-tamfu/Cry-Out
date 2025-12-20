require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Report = require("./models/Report");
const Organization = require("./models/Organization");

// --- UPLOAD TOOLS ---
const cloudinary = require("cloudinary");
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
// 2. CONFIGURE STORAGE (RELAXED)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, 
  params: {
    folder: "cryout-evidence",
    resource_type: "auto", // Automatically detect Image vs Video vs Audio
    // Remove 'allowed_formats' array to prevent rejection errors
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ==========================================
//  1. VICTIM REPORTING ROUTES (FIXED)
// ==========================================

// --- VICTIM REPORTING ROUTE (SAFER UPLOAD) ---
app.post("/api/reports", (req, res, next) => {
    // 1. Run Upload Middleware manually to catch errors
    upload.array("evidence")(req, res, (err) => {
        if (err) {
            console.error("❌ UPLOAD ERROR:", err);
            return res.status(400).json({ message: "File upload failed", error: err.message });
        }
        next(); // If success, move to the next function (saving logic)
    });
}, async (req, res) => {
  try {
    console.log("📨 Processing Report Logic...");

    // Safe Parsing
    let contactInfoData = {};
    try {
        contactInfoData = req.body.contactInfo ? JSON.parse(req.body.contactInfo) : {};
    } catch (e) { console.log("Error parsing contact"); }

    let locationData = {};
    try {
        locationData = req.body.location ? JSON.parse(req.body.location) : { lat: 0, lng: 0 };
    } catch (e) { console.log("Error parsing location"); }

    const reportData = {
      category: req.body.category,
      description: req.body.description,
      contactPolice: req.body.contactPolice === "true",
      location: locationData,
      contactInfo: contactInfoData,
      // Map files safely
      media: req.files ? req.files.map((file) => file.path || file.secure_url || file.url) : [],
    };

    const newReport = new Report(reportData);
    const savedReport = await newReport.save();

    console.log(`📝 Report Saved! ID: ${savedReport._id}`);
    res.status(201).json(savedReport);
  } catch (err) {
    console.error("Save Error:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// ==========================================
//  2. ORGANIZATION REGISTRATION
// ==========================================

app.post("/api/register-org", upload.array("documents"), async (req, res) => {
  console.log("📝 Registering Org:", req.body.name);

  try {
    if (
      !req.body.name ||
      !req.body.country ||
      !req.body.type ||
      !req.body.accessCode
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const existing = await Organization.findOne({
      accessCode: req.body.accessCode,
    });
    if (existing) {
      return res.status(400).json({ message: "Access Code already taken." });
    }

    // Default Categories Logic
    const type = req.body.type;
    let categories = ["Other"];
    if (type === "POLICE")
      categories = [
        "Domestic Violence",
        "Sexual Assault",
        "Physical Abuse",
        "Stalking",
        "Other",
      ];
    if (type === "SHELTER")
      categories = ["Domestic Violence", "Stalking", "Other"];
    if (type === "MEDICAL") categories = ["Sexual Assault", "Physical Abuse"];
    if (type === "LEGAL") categories = ["Domestic Violence", "Sexual Assault"];

    const newOrg = new Organization({
      name: req.body.name,
      type: req.body.type,
      accessCode: req.body.accessCode,
      country: req.body.country,
      region: req.body.region,
      city: req.body.city,
      address: req.body.address,
      contactEmail: req.body.contactEmail,
      contactPhone: req.body.contactPhone,
      website: req.body.website,
      registrationNumber: req.body.registrationNumber,
      description: req.body.description,
      documents: req.files ? req.files.map((f) => f.path || f.secure_url) : [],
      allowedCategories: categories,
      status: "PENDING",
    });

    await newOrg.save();
    console.log("✅ Org Saved Successfully");
    res.status(201).json({ message: "Application submitted." });
  } catch (err) {
    console.error("🔥 REGISTRATION CRASH:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// ==========================================
//  3. RESPONDER/ADMIN ROUTES
// ==========================================

app.post("/api/login", async (req, res) => {
  try {
    const { accessCode } = req.body;
    const org = await Organization.findOne({ accessCode });

    if (!org) return res.status(401).json({ message: "Invalid Access Code" });
    if (org.status === "PENDING")
      return res.status(403).json({ message: "Account is pending approval." });
    if (org.status === "REJECTED")
      return res.status(403).json({ message: "Account has been rejected." });

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

app.put("/api/reports/:id/claim", async (req, res) => {
  try {
    const { orgId, orgName } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) return res.status(404).json({ message: "Report not found" });
    if (report.assignedTo && report.assignedTo.orgId) {
      return res.status(400).json({ message: "Report already claimed" });
    }

    report.status = "In Progress";
    report.assignedTo = { orgId, orgName, claimedAt: new Date() };

    const updated = await report.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ==========================================
//  4. SUPER ADMIN ROUTES
// ==========================================

app.get("/api/admin/orgs", async (req, res) => {
  try {
    const orgs = await Organization.find().sort({ createdAt: -1 });
    res.json(orgs);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/api/admin/pending-orgs", async (req, res) => {
  try {
    const pending = await Organization.find({ status: "PENDING" }).sort({
      createdAt: -1,
    });
    res.json(pending);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.put("/api/admin/update-status/:id", async (req, res) => {
  try {
    const { status } = req.body;
    await Organization.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.put("/api/admin/approve-org/:id", async (req, res) => {
  try {
    await Organization.findByIdAndUpdate(req.params.id, { status: "APPROVED" });
    res.json({ message: "Organization Approved" });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.put("/api/admin/update-categories/:id", async (req, res) => {
  try {
    const { categories } = req.body;
    await Organization.findByIdAndUpdate(req.params.id, {
      allowedCategories: categories,
    });
    res.json({ message: "Permissions updated" });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete("/api/admin/delete-org/:id", async (req, res) => {
  try {
    await Organization.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete("/api/admin/reject-org/:id", async (req, res) => {
  try {
    await Organization.findByIdAndUpdate(req.params.id, { status: "REJECTED" });
    res.json({ message: "Rejected" });
  } catch (err) {
    res.status(500).json(err);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
