require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Report = require("./models/Report");
const Organization = require("./models/Organization"); // Import Org Model

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// 1. PUBLIC ROUTE: SUBMIT REPORT
app.post("/api/reports", async (req, res) => {
  try {

    // spy 
     console.log("📨 RECEIVED REPORT:", req.body); 

    const newReport = new Report(req.body);
    const savedReport = await newReport.save();
    res.status(201).json(savedReport);
    console.log("📝 New Report Saved:", savedReport._id);
  } catch (err) {
    res.status(500).json(err);
    console.error("Save Error:", err);
  }
});

// 2. ADMIN ROUTE: LOGIN (Simple check)
app.post("/api/login", async (req, res) => {
  try {
    const { accessCode } = req.body;
    // Find Org by the access code
    const org = await Organization.findOne({ accessCode });

    if (!org) {
      return res.status(401).json({ message: "Invalid Access Code" });
    }
    res.json(org); // Send back Org details
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. ADMIN ROUTE: FETCH REPORTS (With Safety Logic)
app.get("/api/org-reports/:orgId", async (req, res) => {
  try {
    // A. Identify who is asking
    const org = await Organization.findById(req.params.orgId);
    if (!org) return res.status(404).json({ message: "Org not found" });

    // B. Build the Filter
    // Rule 1: Only show categories this Org is allowed to handle
    let filter = {
      category: { $in: org.allowedCategories },
    };

    // Rule 2: SAFETY CHECK - If Police, only show if user consented
    if (org.type === "POLICE") {
      filter.contactPolice = true;
    }

    // C. Execute Query
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
