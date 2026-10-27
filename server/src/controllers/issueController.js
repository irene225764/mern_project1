const mongoose = require("mongoose");
const Issue = require("../models/Issue");

const CATEGORIES = ["Electrical", "Network", "Plumbing", "Lab Equipment", "Other"];
const STATUSES = ["Open", "In Progress", "Resolved"];

const isText = (v) => typeof v === "string" && v.trim().length > 0;
const validId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.createIssue = async (req, res) => {
  try {
    const { title, description, category, location } = req.body;
    if (![title, description, location].every(isText) || !CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Title, description, location and a valid category are required",
      });
    }
    const issue = await Issue.create({
      title, description, category, location, createdBy: req.user._id,
    });
    res.status(201).json(issue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getIssues = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

    const filter = {};
    if (req.user.role !== "admin") filter.createdBy = req.user._id;
    if (typeof req.query.status === "string" && STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const [issues, total] = await Promise.all([
      Issue.find(filter)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Issue.countDocuments(filter),
    ]);

    res.json({ issues, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getIssue = async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(404).json({ message: "Issue not found" });
    const issue = await Issue.findById(req.params.id).populate("createdBy", "name email");
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const isOwner = String(issue.createdBy._id) === String(req.user._id);
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }
    res.json(issue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateIssue = async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(404).json({ message: "Issue not found" });
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const isAdmin = req.user.role === "admin";
    const isOwner = String(issue.createdBy) === String(req.user._id);
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not allowed" });

    const { title, description, category, location, status } = req.body;
    const wasOpen = issue.status === "Open";
    const editsDetails = [title, description, category, location].some((v) => v !== undefined);

    if (status !== undefined) {
      if (!isAdmin) return res.status(403).json({ message: "Only admins can change status" });
      if (!STATUSES.includes(status)) return res.status(400).json({ message: "Invalid status" });
      issue.status = status;
    }

    if (editsDetails) {
      if (!isOwner) return res.status(403).json({ message: "Only the reporter can edit issue details" });
      if (!wasOpen) return res.status(403).json({ message: "Issue can no longer be edited" });

      if (title !== undefined) {
        if (!isText(title)) return res.status(400).json({ message: "Invalid title" });
        issue.title = title;
      }
      if (description !== undefined) {
        if (!isText(description)) return res.status(400).json({ message: "Invalid description" });
        issue.description = description;
      }
      if (location !== undefined) {
        if (!isText(location)) return res.status(400).json({ message: "Invalid location" });
        issue.location = location;
      }
      if (category !== undefined) {
        if (!CATEGORIES.includes(category)) return res.status(400).json({ message: "Invalid category" });
        issue.category = category;
      }
    }

    await issue.save();
    await issue.populate("createdBy", "name email");
    res.json(issue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteIssue = async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(404).json({ message: "Issue not found" });
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const isOwner = String(issue.createdBy) === String(req.user._id);
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }
    await issue.deleteOne();
    res.json({ message: "Issue deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
