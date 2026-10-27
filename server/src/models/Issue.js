const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    category: {
      type: String,
      enum: ["Electrical", "Network", "Plumbing", "Lab Equipment", "Other"],
      required: true,
    },
    location: { type: String, required: true, trim: true, maxlength: 100 },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

issueSchema.index({ createdBy: 1, status: 1 });

module.exports = mongoose.model("Issue", issueSchema);