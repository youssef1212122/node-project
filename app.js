require("dotenv").config();
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("./config/db"); 

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/usersRoutes");
const postRoutes = require("./routes/postsRoutes");

const AppError = require("./utils/AppError");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const limiter = require("./utils/rate-limit");

app.use(express.static(path.join(__dirname, "uploads")));

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(limiter)

// Connect to Mongo
connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.use((err, req, res, next) => {
  console.log(err);
  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json({ status: "error", message: err.message });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    res
      .status(400)
      .json({ status: "error", message: `Duplicate value ${field}` });
  }
  if (err.name === "CastError") {
    res.status(400).json({ status: "error", message: `invalid id fromat` });
  }
  if (err.name === "ValidationError") {
    res.status(400).json({ status: "error", message: err.message });
  }
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({ status: "error", message: "invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    res.status(401).json({ status: "error", message: "invalid token" });
  }

  res.status(500).json({ status: "error", message: err.message });
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(async () => {
    const user = await User.findOne({ email:process.env.FIRST_ADMIN_EMAIL });
    if (!user) {
      const saltRounds = 10;

      const hashedPassword = await bcrypt.hash(process.env.FIRST_ADMIN_PASSWORD, saltRounds);

      await User.create({
        name:process.env.FIRST_ADMIN_NAME,
        email:process.env.FIRST_ADMIN_EMAIL ,
        password: hashedPassword,
        role: "admin",
      });
    }
    console.log("connected to mongodb");
  })
  .catch((error) => console.log("filed connect to mongodb", error));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
