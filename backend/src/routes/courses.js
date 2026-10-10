const { Router } = require("express");
const { createId } = require("../utils/id");
const { validateCourse } = require("../middleware/validate");
const { httpError } = require("../middleware/errorHandler");

function coursesRouter(store) {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json({ courses: store.courses });
  });

  router.get("/:id", (req, res) => {
    const course = store.courses.find((c) => c.id === req.params.id);
    if (!course) throw httpError(404, "Course not found.");
    res.json({ course });
  });

  router.post("/", (req, res) => {
    const data = validateCourse(req.body);
    const course = { id: createId(), ...data };
    store.courses.push(course);
    res.status(201).json({ course });
  });

  router.put("/:id", (req, res) => {
    const index = store.courses.findIndex((c) => c.id === req.params.id);
    if (index === -1) throw httpError(404, "Course not found.");
    const data = validateCourse(req.body);
    store.courses[index] = { ...store.courses[index], ...data };
    res.json({ course: store.courses[index] });
  });

  router.delete("/:id", (req, res) => {
    const index = store.courses.findIndex((c) => c.id === req.params.id);
    if (index === -1) throw httpError(404, "Course not found.");
    const [removed] = store.courses.splice(index, 1);
    store.tasks = store.tasks.filter((t) => t.courseId !== removed.id);
    res.json({ ok: true, course: removed });
  });

  return router;
}

module.exports = { coursesRouter };
