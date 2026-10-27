require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

connectDB();
const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/issues/:issueId/comments", require("./routes/commentRoutes"));
app.use("/api/issues", require("./routes/issueRoutes"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CampusFix API is running" });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});