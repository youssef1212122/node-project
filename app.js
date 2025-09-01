require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/usersRoutes");
const postRoutes = require("./routes/postsRoutes");

const AppError = require("./utils/AppError");
const limiter = require("./utils/rate-limit");
const User = require("./models/User");

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(limiter);

// Connect to Mongo
connectDB().then(async () => {
  // Create first admin if not exists
  const user = await User.findOne({ email: process.env.FIRST_ADMIN_EMAIL });
  if (!user) {
    const hashedPassword = await bcrypt.hash(process.env.FIRST_ADMIN_PASSWORD, 10);
    await User.create({
      name: process.env.FIRST_ADMIN_NAME,
      email: process.env.FIRST_ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
    });
    console.log("First admin created");
  }
}).catch((error) => console.error("Failed to connect to MongoDB", error));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// Error handler (واحد بس)
app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ status: "error", message: err.message });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ status: "error", message: `Duplicate value ${field}` });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ status: "error", message: `Invalid ID format` });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ status: "error", message: err.message });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ status: "error", message: "Invalid or expired token" });
  }

  res.status(500).json({ status: "error", message: "Something went wrong!" });
});

// Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
