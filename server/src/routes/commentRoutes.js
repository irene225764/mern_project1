const express = require("express");
const { getComments, addComment } = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware"); // <- use YOUR line from issueRoutes.js

const router = express.Router({ mergeParams: true });

router.use(protect);
router.get("/", getComments);
router.post("/", addComment);

module.exports = router;