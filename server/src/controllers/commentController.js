const mongoose = require("mongoose");
const Issue = require("../models/Issue");
const Comment = require("../models/Comment");

async function loadAccessibleIssue(req, res) {
  const { issueId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(issueId)) {
    res.status(404).json({ message: "Issue not found" });
    return null;
  }
  const issue = await Issue.findById(issueId);
  if (!issue) {
    res.status(404).json({ message: "Issue not found" });
    return null;
  }
  const isOwner = String(issue.createdBy) === String(req.user._id);
  if (!isOwner && req.user.role !== "admin") {
    res.status(403).json({ message: "Not allowed" });
    return null;
  }
  return issue;
}

exports.getComments = async (req, res) => {
  try {
    const issue = await loadAccessibleIssue(req, res);
    if (!issue) return;
    const comments = await Comment.find({ issue: issue._id })
      .populate("author", "name role")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const issue = await loadAccessibleIssue(req, res);
    if (!issue) return;

    const { text } = req.body;
    if (typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ message: "Comment text is required" });
    }
    if (text.trim().length > 500) {
      return res.status(400).json({ message: "Comment must be 500 characters or less" });
    }

    const comment = await Comment.create({
      issue: issue._id,
      author: req.user._id,
      text,
    });
    await comment.populate("author", "name role");
    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};