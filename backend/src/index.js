const express = require("express");
const cors = require("cors");
const { config } = require("./config");
const { errorHandler } = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
