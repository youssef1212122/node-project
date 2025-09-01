const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("./config/db"); 

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/usersRoutes");
const postRoutes = require("./routes/postsRoutes");

dotenv.config();
const app = express();

// Connect to Mongo
connectDB();

// Middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
