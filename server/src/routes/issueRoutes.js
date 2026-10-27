const express = require("express");
const {
  createIssue, getIssues, getIssue, updateIssue, deleteIssue,
} = require("../controllers/issueController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.route("/").post(createIssue).get(getIssues);
router.route("/:id").get(getIssue).patch(updateIssue).delete(deleteIssue);

module.exports = router;