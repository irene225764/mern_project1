const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    issue: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

commentSchema.index({ issue: 1, createdAt: 1 });

module.exports = mongoose.model("Comment", commentSchema);