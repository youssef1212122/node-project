const express = require("express");
const router = express.Router();
const postsController = require("../controllers/postsController");
const auth = require("../middlewares/auth");
const restrictTo = require("../middlewares/restrictTo");
const validate = require("../middlewares/validate");
const uploadLocal = require("../middlewares/uploadLocal");

const {
  createPostSchema,
  updatePostSchema,
} = require("../validation/post.schema");

// Get all posts
router.get("/", postsController.getAllPosts);

// Get single post
router.get("/:id", postsController.getPostById);

// Create post (أي يوزر يقدر يعمل)
router.post(
  "/",
  auth,
  uploadLocal.single("image"),
  validate(createPostSchema),
  postsController.createPost
);

// Update post (صاحب البوست أو أدمن)
router.put(
  "/:id",
  auth,
  uploadLocal.single("image"),
  validate(updatePostSchema),
  postsController.updatePost
);

// Delete post (صاحب البوست أو أدمن)
router.delete("/:id", auth, postsController.deletePost);

module.exports = router;
