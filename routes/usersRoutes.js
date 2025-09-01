const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const validate = require("../middlewares/validate");
const { createUserSchema, updateUserSchema } = require("../validation/user.schema");
const uploadLocal = require("../middlewares/uploadLocal");
const protect = require("../middlewares/auth");
const restrictTo = require("../middlewares/restrictTo");

// Get all users (Admin only)
router.get("/", protect, restrictTo("admin"), usersController.getAllUsers);

// Get single user (Admin or the same user)
router.get("/:id", protect, usersController.getUserById);

// Create user (Admin only)
router.post(
  "/",
  protect,
  restrictTo("admin"),
  uploadLocal.single("avatar"),
  validate(createUserSchema),
  usersController.createUser
);

// Update user (Admin or the same user)
router.put(
  "/:id",
  protect,
  uploadLocal.single("avatar"),
  validate(updateUserSchema),
  usersController.updateUser
);

// Delete user (Admin only)
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  usersController.deleteUser
);

module.exports = router;
