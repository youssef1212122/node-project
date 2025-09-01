require("dotenv").config();

const express = require("express");
const userRoutes = require("./routes/usersRoutes");
const postRoutes = require("./routes/postsRoutes");
const authRoutes = require("./routes/authRoutes");

const AppError = require("./utils/AppError");
const cors = require("cors");
const morgan = require("morgan");
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

app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/auth", authRoutes);
app.use("/",(req,res)=>{
  res.send("server running")
})

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
// app.listen(process.env.PORT || 3000, () => {
//   console.log(`Example app listening on port ${process.env.PORT || 3000}`);
// });

module.exports=app