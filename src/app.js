const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const routes = require("./routes");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "User Registration API is running.",
  });
});

app.use("/api", routes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

module.exports = app;
