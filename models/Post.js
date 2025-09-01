const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, minlength: 3, maxlength: 100 },
    content: { type: String, required: true, unique: true, minlength: 10 },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
