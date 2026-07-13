const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

let tasks = [
  { id: 1, title: "Learn JavaScript Foundations", completed: true },
  { id: 2, title: "Build a Node.js Server with Express", completed: false },
];

// 1. Welcome Endpoint
app.get("/api/welcome", (req, res) => {
  res.json({
    message: "Welcome to JavaScript 101 Assignment!",
    status: "Success",
    developer: "Mahmoud Mostafa",
  });
});

// 2. GET Endpoint
app.get("/api/tasks", (req, res) => {
  res.json({
    success: true,
    data: tasks,
  });
});

// 3. POST Endpoint
app.post("/api/tasks", (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, error: "Title is required" });
  }

  const newTask = {
    id: tasks.length + 1,
    title: title,
    completed: false,
  };

  tasks.push(newTask);
  res.status(201).json({ success: true, data: newTask });
});

app.listen(PORT, () => {
  console.log(`Server is running perfectly on http://localhost:${PORT}`);
});
