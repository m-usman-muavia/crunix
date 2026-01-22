const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const authRoutes = require("./routes/authroutes");
const planRoutes = require("./routes/planroutes");
const walletRoutes = require("./routes/walletroutes");
const accountRoutes = require("./routes/accountroutes");
const referralRoutes = require("./routes/referralroutes");
const path = require("path");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

// 1. API Routes
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/referral", referralRoutes);

// 2. Serve Static Assets in Production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"));
  });
} else {
  // Default route for development
  app.get("/", (req, res) => {
    res.send("Backend + mongodb is running!");
  });
}

// 3. Error handling middleware (Must be after routes)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// 4. Start Server (Must be at the VERY bottom)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  