const express = require("express");
const app = express();
const PORT = 3000;

// Stage 1: Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"],
  });
});

// Stage 1: Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:3000`);
});
