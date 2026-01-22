const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const authRoutes = require("./routes/authroutes"); // 1. Import your routes
const planRoutes = require("./routes/planroutes");
const walletRoutes = require("./routes/walletroutes");
const accountRoutes = require("./routes/accountroutes");
const referralRoutes = require("./routes/referralroutes");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json()); // Essential for reading JSON body

connectDB();

// 2. Use your routes
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/referral", referralRoutes); 


app.get("/", (req, res) => {
  res.send("Backend + mongodb is running!");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));