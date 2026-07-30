const express = require("express");
const app = express();
const PORT = 3000;

// Stage 2: In-memory task database
const tasks = [
  { id: 1, title: "Complete Stage 0 & 1", done: true },
  { id: 2, title: "Build Read endpoints", done: false },
  { id: 3, title: "Test API using curl", done: false },
];

// Stage 1: Root & Health
app.get("/", (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"],
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Stage 2: GET /tasks - Return all tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// Stage 2: GET /tasks/:id - Return a single task by ID
app.get("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return res.status(404).json({ error: `Task ${taskId} not found` });
  }

  res.json(task);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:3000`);
});
