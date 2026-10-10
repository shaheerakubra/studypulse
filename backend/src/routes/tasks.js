const { Router } = require("express");
const { createId } = require("../utils/id");
const { validateTask } = require("../middleware/validate");
const { httpError } = require("../middleware/errorHandler");

function tasksRouter(store) {
  const router = Router();

  router.get("/", (req, res) => {
    const { courseId, status, type } = req.query;
    let tasks = [...store.tasks];
    if (courseId) tasks = tasks.filter((t) => t.courseId === courseId);
    if (status) tasks = tasks.filter((t) => t.status === status);
    if (type) tasks = tasks.filter((t) => t.type === type);
    tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    res.json({ tasks });
  });

  router.get("/upcoming", (req, res) => {
    const requestedDays = Number(req.query.days || 14);
    if (!Number.isInteger(requestedDays) || requestedDays < 1 || requestedDays > 90) {
      throw httpError(400, "days must be an integer between 1 and 90.");
    }
    const days = requestedDays;
    const now = Date.now();
    const until = now + days * 24 * 60 * 60 * 1000;
    const tasks = store.tasks
      .filter((t) => t.status !== "completed")
      .filter((t) => {
        const due = new Date(t.dueDate).getTime();
        return due >= now && due <= until;
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    res.json({ tasks, days });
  });

  router.get("/:id", (req, res) => {
    const task = store.tasks.find((t) => t.id === req.params.id);
    if (!task) throw httpError(404, "Task not found.");
    res.json({ task });
  });

  router.post("/", (req, res) => {
    const data = validateTask(req.body);
    const course = store.courses.find((c) => c.id === data.courseId);
    if (!course) throw httpError(400, "Selected course does not exist.");
    const task = {
      id: createId(),
      status: data.status || "not_started",
      notes: data.notes || "",
      ...data,
    };
    store.tasks.push(task);
    res.status(201).json({ task });
  });

  router.put("/:id", (req, res) => {
    const index = store.tasks.findIndex((t) => t.id === req.params.id);
    if (index === -1) throw httpError(404, "Task not found.");
    const data = validateTask(req.body, { partial: true });
    if (data.courseId) {
      const course = store.courses.find((c) => c.id === data.courseId);
      if (!course) throw httpError(400, "Selected course does not exist.");
    }
    store.tasks[index] = { ...store.tasks[index], ...data };
    res.json({ task: store.tasks[index] });
  });

  router.patch("/:id/status", (req, res) => {
    const index = store.tasks.findIndex((t) => t.id === req.params.id);
    if (index === -1) throw httpError(404, "Task not found.");
    const data = validateTask({ status: req.body.status }, { partial: true });
    store.tasks[index] = { ...store.tasks[index], ...data };
    res.json({ task: store.tasks[index] });
  });

  router.delete("/:id", (req, res) => {
    const index = store.tasks.findIndex((t) => t.id === req.params.id);
    if (index === -1) throw httpError(404, "Task not found.");
    const [removed] = store.tasks.splice(index, 1);
    res.json({ ok: true, task: removed });
  });

  return router;
}

module.exports = { tasksRouter };
