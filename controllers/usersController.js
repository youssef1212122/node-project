const User = require("../models/User");

// Get all users (admins only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};

// Get single user (admin or the same user)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // لو اللي بيطلب مش ادمن ولا صاحب الاكونت نفسه
    if (req.user.role !== "admin" && req.user.id !== user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
};

// Create user (only admin can set role, others default to "user")
exports.createUser = async (req, res) => {
  try {
    const { name, email, age, bio, password, role } = req.body;

    const newUser = new User({
      name,
      email,
      age,
      bio,
      password,
      avatar: req.file ? req.file.path : null,
      role: req.user?.role === "admin" && role ? role : "user", // لو الادمن هو اللي بيسجل يقدر يحدد رول
    });

    await newUser.save();

    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;

    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: "Failed to create user", error: err.message });
  }
};

// Update user (admin or the same user)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, age, bio, password, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // لو مش ادمن ولا صاحب الاكونت نفسه
    if (req.user.role !== "admin" && req.user.id !== user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name,
          email,
          age,
          bio,
          password,
          avatar: req.file ? req.file.path : user.avatar,
          updatedAt: new Date(),
          role: req.user.role === "admin" && role ? role : user.role, // الرول يتغير بس لو ادمن
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Failed to update user", error: err.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can delete users" });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id).select("-password");
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json(deletedUser);
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
};
