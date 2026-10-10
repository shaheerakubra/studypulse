const { httpError } = require("./errorHandler");

const TASK_TYPES = new Set(["assignment", "exam"]);
const TASK_STATUSES = new Set(["not_started", "in_progress", "completed"]);
const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function requireString(value, field, { min = 1, max = 200 } = {}) {
  if (typeof value !== "string" || !value.trim()) {
    throw httpError(400, `${field} is required.`);
  }
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw httpError(400, `${field} must be between ${min} and ${max} characters.`);
  }
  return trimmed;
}

function optionalString(value, field, { max = 2000 } = {}) {
  if (value == null || value === "") return "";
  if (typeof value !== "string") {
    throw httpError(400, `${field} must be text.`);
  }
  if (value.length > max) {
    throw httpError(400, `${field} must be ${max} characters or fewer.`);
  }
  return value.trim();
}

function requireNumber(value, field, { min, max } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw httpError(400, `${field} must be a number.`);
  }
  if (min != null && n < min) {
    throw httpError(400, `${field} must be at least ${min}.`);
  }
  if (max != null && n > max) {
    throw httpError(400, `${field} must be at most ${max}.`);
  }
  return n;
}

function requireDate(value, field) {
  if (!value) throw httpError(400, `${field} is required.`);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw httpError(400, `${field} must be a valid date.`);
  }
  return d.toISOString();
}

function validateCourse(body, { partial = false } = {}) {
  const data = {};
  if (!partial || body.code !== undefined) {
    data.code = requireString(body.code, "Course code", { max: 24 });
  }
  if (!partial || body.name !== undefined) {
    data.name = requireString(body.name, "Course name", { max: 120 });
  }
  if (!partial || body.instructor !== undefined) {
    data.instructor = optionalString(body.instructor, "Instructor", { max: 120 });
  }
  if (!partial || body.credits !== undefined) {
    data.credits = requireNumber(body.credits ?? 3, "Credits", { min: 0, max: 12 });
  }
  if (!partial || body.color !== undefined) {
    data.color = optionalString(body.color, "Color", { max: 16 }) || "#1B6B93";
  }
  if (!partial || body.term !== undefined) {
    data.term = optionalString(body.term, "Term", { max: 40 }) || "Current term";
  }
  return data;
}

function validateTask(body, { partial = false } = {}) {
  const data = {};
  if (!partial || body.courseId !== undefined) {
    data.courseId = requireString(body.courseId, "Course", { max: 80 });
  }
  if (!partial || body.title !== undefined) {
    data.title = requireString(body.title, "Title", { max: 160 });
  }
  if (!partial || body.type !== undefined) {
    const type = String(body.type || "").toLowerCase();
    if (!TASK_TYPES.has(type)) {
      throw httpError(400, "Type must be assignment or exam.");
    }
    data.type = type;
  }
  if (!partial || body.dueDate !== undefined) {
    data.dueDate = requireDate(body.dueDate, "Due date");
  }
  if (!partial || body.estimatedHours !== undefined) {
    data.estimatedHours = requireNumber(body.estimatedHours, "Estimated hours", {
      min: 0.25,
      max: 80,
    });
  }
  if (!partial || body.weight !== undefined) {
    data.weight = requireNumber(body.weight, "Grading weight", { min: 0, max: 100 });
  }
  if (!partial || body.status !== undefined) {
    const status = String(body.status || "not_started");
    if (!TASK_STATUSES.has(status)) {
      throw httpError(400, "Status must be not_started, in_progress, or completed.");
    }
    data.status = status;
  }
  if (!partial || body.notes !== undefined) {
    data.notes = optionalString(body.notes, "Notes");
  }
  return data;
}

function validateAvailability(body) {
  const weeklyHours = requireNumber(body.weeklyHours, "Weekly study hours", {
    min: 1,
    max: 80,
  });
  const preferredStartHour = requireNumber(
    body.preferredStartHour ?? 8,
    "Preferred start hour",
    { min: 0, max: 23 }
  );
  const preferredEndHour = requireNumber(
    body.preferredEndHour ?? 22,
    "Preferred end hour",
    { min: 1, max: 24 }
  );
  if (preferredEndHour <= preferredStartHour) {
    throw httpError(400, "Preferred end hour must be after start hour.");
  }

  const days = {};
  const incoming = body.days || {};
  for (const day of DAYS) {
    const slot = incoming[day] || {};
    const hours = requireNumber(slot.hours ?? 0, `${day} hours`, { min: 0, max: 16 });
    days[day] = {
      hours,
      available: slot.available !== false && hours > 0,
    };
  }

  const summed = Object.values(days).reduce((sum, d) => sum + d.hours, 0);
  if (Math.abs(summed - weeklyHours) > 8) {
    throw httpError(
      400,
      `Daily hours (currently ${summed}) should roughly match weekly hours (${weeklyHours}).`
    );
  }

  return {
    weeklyHours,
    preferredStartHour,
    preferredEndHour,
    days,
    notes: optionalString(body.notes, "Availability notes"),
  };
}

module.exports = {
  validateCourse,
  validateTask,
  validateAvailability,
  TASK_TYPES,
  TASK_STATUSES,
  DAYS,
};
