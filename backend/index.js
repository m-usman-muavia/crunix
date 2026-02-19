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
const depositRoutes = require("./routes/depositroutes");
const withdrawalRoutes = require("./routes/withdrawalroutes");
const notificationRoutes = require("./routes/notificationroutes");
const bonusCodeRoutes = require("./routes/bonuscoderoutes");
const UserPlan = require("./models/userplan");
const Wallet = require("./models/wallet");

require("dotenv").config();

const app = express();

// CORS Configuration for development and production
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json());

// Ensure uploads directory exists
if (!fs.existsSync('uploads/deposits')) {
  fs.mkdirSync('uploads/deposits', { recursive: true });
}
if (!fs.existsSync('uploads/plans')) {
  fs.mkdirSync('uploads/plans', { recursive: true });
}
if (!fs.existsSync('uploads/accounts')) {
  fs.mkdirSync('uploads/accounts', { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/investments", planRoutes); // Investment routes use planRoutes
app.use("/api/wallet", walletRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/deposits", depositRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/bonus", bonusCodeRoutes);

// SERVING THE FRONTEND
const buildPath = path.join(__dirname, "..", "frontend", "build");

// Serve static files from build folder if it exists
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  console.log("Serving static files from:", buildPath);
}

// Catch-all route: serve index.html for SPA routing
app.get(/^(?!\/api).*/, (req, res) => {
  const indexPath = path.join(buildPath, "index.html");
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error("Error sending index.html:", err);
        res.status(500).json({ error: "Error loading page" });
      }
    });
  } else {
    // Fallback message if build doesn't exist
    res.status(200).json({ message: "Backend API is running. Frontend build not found.", apis: ["/api/auth", "/api/plans", "/api/wallet", "/api/accounts", "/api/referral"] });
  }
});

// Error handling middleware (must come after all routes)
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

// Start server and connect to database
const startServer = async () => {
  try {
    await connectDB();
    // Manual collection system used at /collect-income - no automatic scheduler
  } catch (err) {
    console.error("Database connection failed:", err.message);
    // Continue anyway - app can run without DB
  }

  try {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Handle unhandled rejections - log but don't crash
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err);
    });

    // Handle uncaught exceptions - log but don't crash  
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();