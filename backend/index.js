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

// Daily profit accrual scheduler
const startProfitScheduler = () => {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const run = async () => {
    try {
      const now = new Date();
      const activePlans = await UserPlan.find({ status: 'active' });
      for (const plan of activePlans) {
        const cutoff = plan.endDate && plan.endDate < now ? plan.endDate : now;
        const last = plan.lastAccruedAt || plan.investmentDate || now;
        let daysToAccrue = Math.floor((cutoff - last) / MS_PER_DAY);
        if (daysToAccrue <= 0) {
          // If end reached or profit cap achieved, mark complete
          if ((plan.totalEarned || 0) >= (plan.total_profit || 0) || now >= plan.endDate) {
            plan.status = 'completed';
            await plan.save();
          }
          continue;
        }

        const remainingProfit = (plan.total_profit || 0) - (plan.totalEarned || 0);
        const maxDaysByProfit = Math.floor(remainingProfit / (plan.daily_profit || 0));
        const actualDays = Math.min(daysToAccrue, Math.max(0, maxDaysByProfit));
        if (actualDays <= 0) {
          // No profit left to accrue
          plan.status = 'completed';
          await plan.save();
          continue;
        }

        const increment = actualDays * (plan.daily_profit || 0);
        await Wallet.updateOne({ userId: plan.userId }, { $inc: { main_balance: increment } });
        plan.totalEarned = (plan.totalEarned || 0) + increment;
        plan.lastAccruedAt = new Date(last.getTime() + actualDays * MS_PER_DAY);
        plan.accrualHistory = plan.accrualHistory || [];
        plan.accrualHistory.push({ timestamp: new Date(), daysAccrued: actualDays, amountAdded: increment });

        if (plan.totalEarned >= plan.total_profit || plan.lastAccruedAt >= plan.endDate) {
          plan.status = 'completed';
        }
        await plan.save();
      }
    } catch (err) {
      console.error('Profit scheduler error:', err);
    }
  };

  const PKT_OFFSET_MINUTES = 5 * 60;
  const getNextRunDelayMs = () => {
    const now = new Date();
    const nowUtcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const nowPkt = new Date(nowUtcMs + PKT_OFFSET_MINUTES * 60000);
    const nextPkt = new Date(nowPkt);
    nextPkt.setHours(2, 0, 0, 0);
    if (nextPkt <= nowPkt) {
      nextPkt.setDate(nextPkt.getDate() + 1);
    }
    const nextUtcMs = nextPkt.getTime() - PKT_OFFSET_MINUTES * 60000;
    return Math.max(0, nextUtcMs - now.getTime());
  };

  const scheduleNextRun = () => {
    const delay = getNextRunDelayMs();
    setTimeout(async () => {
      await run();
      scheduleNextRun();
    }, delay);
  };

  // Run daily at 2:00 AM Pakistan time (UTC+5)
  scheduleNextRun();
};

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
    // Start profit accrual scheduler after DB connects
    startProfitScheduler();
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