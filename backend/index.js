const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const path = require("path");
const fs = require("fs");
const authRoutes = require("./routes/authroutes");
const planRoutes = require("./routes/planroutes");
const walletRoutes = require("./routes/walletroutes");
const accountRoutes = require("./routes/accountroutes");
const referralRoutes = require("./routes/referralroutes");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/referral", referralRoutes);

// SERVING THE FRONTEND
const buildPath = path.join(__dirname, "..", "frontend", "build");

// Check if build folder exists
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else if (process.env.NODE_ENV === "production") {
  console.warn("Build folder not found at:", buildPath);
  app.get("*", (req, res) => {
    res.status(500).send("Frontend build not found");
  });
} else {
  app.get("/", (req, res) => {
    res.send("Backend is running in development mode");
  });
}

// Error handling middleware (must come after all routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));