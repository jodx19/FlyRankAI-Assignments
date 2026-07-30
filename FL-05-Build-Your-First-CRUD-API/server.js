const express = require("express");
const app = express();
const PORT = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

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

// Stage 2: GET /tasks & GET /tasks/:id
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

app.get("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return res.status(404).json({ error: `Task ${taskId} not found` });
  }

  res.json(task);
});

// Stage 3: POST /tasks - Create a new task with validation
app.post("/tasks", (req, res) => {
  const { title } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res
      .status(400)
      .json({ error: "Title is required and must not be empty" });
  }

  const newId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
  const newTask = {
    id: newId,
    title: title.trim(),
    done: false,
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Stage 4: PUT /tasks/:id - Update an existing task
app.put("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return res.status(404).json({ error: `Task ${taskId} not found` });
  }

  const { title, done } = req.body;

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      return res
        .status(400)
        .json({ error: "Title is required and must not be empty" });
    }
    task.title = title.trim();
  }

  if (done !== undefined) {
    if (typeof done !== "boolean") {
      return res.status(400).json({ error: "Done must be a boolean" });
    }
    task.done = done;
  }

  res.json(task);
});

// Stage 5: DELETE /tasks/:id - Remove a task
app.delete("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task ${taskId} not found` });
  }

  const [deletedTask] = tasks.splice(taskIndex, 1);
  res.json(deletedTask);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:3000`);
});
