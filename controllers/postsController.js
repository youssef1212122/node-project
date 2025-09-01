const Post = require("../models/Post");

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("authorId", "name email role");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch posts", error: error.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("authorId", "name email role");
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch post", error: error.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newPost = new Post({
      title,
      content,
      authorId: req.user.id,
      image: req.file ? req.file.path : null,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Failed to create post", error: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // تحقق من الصلاحيات
    if (req.user.role !== "admin" && req.user.id !== post.authorId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // حدّث البوست
    post.title = title || post.title;
    post.content = content || post.content;
    post.image = req.file ? req.file.path : post.image;
    post.updatedAt = new Date();

    await post.save(); // هنا مش بيطلب authorId جديد، بيستخدم القديم

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Failed to update post", error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // تحقق من الملكية أو لو Admin
    if (
      req.user.role !== "admin" &&
      post.authorId?.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete post", error: err.message });
  }
};
