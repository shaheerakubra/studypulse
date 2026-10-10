function isoDate(offsetDays, hour = 23, minute = 59) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
}

function buildSeed() {
  const courses = [
    {
      id: "course-cs201",
      code: "CS 201",
      name: "Data Structures",
      instructor: "Dr. Elena Park",
      credits: 4,
      color: "#1B6B93",
      term: "Fall 2026",
    },
    {
      id: "course-hist110",
      code: "HIST 110",
      name: "World History: Modern Era",
      instructor: "Prof. James Okonkwo",
      credits: 3,
      color: "#8C4A2F",
      term: "Fall 2026",
    },
    {
      id: "course-bio220",
      code: "BIO 220",
      name: "Cell Biology",
      instructor: "Dr. Maya Chen",
      credits: 4,
      color: "#2F6B4F",
      term: "Fall 2026",
    },
    {
      id: "course-stat301",
      code: "STAT 301",
      name: "Probability & Inference",
      instructor: "Dr. Aaron Blake",
      credits: 3,
      color: "#5B4B8A",
      term: "Fall 2026",
    },
  ];

  const tasks = [
    {
      id: "task-1",
      courseId: "course-cs201",
      title: "Programming Assignment 4 — Balanced Trees",
      type: "assignment",
      dueDate: isoDate(2, 23, 59),
      estimatedHours: 8,
      weight: 12,
      status: "in_progress",
      notes: "Need to finish AVL rotations and write test cases.",
    },
    {
      id: "task-2",
      courseId: "course-cs201",
      title: "Midterm Exam",
      type: "exam",
      dueDate: isoDate(5, 9, 0),
      estimatedHours: 10,
      weight: 25,
      status: "not_started",
      notes: "Covers heaps, hashing, and trees. Practice previous exams.",
    },
    {
      id: "task-3",
      courseId: "course-hist110",
      title: "Primary Source Analysis Essay",
      type: "assignment",
      dueDate: isoDate(3, 17, 0),
      estimatedHours: 6,
      weight: 15,
      status: "not_started",
      notes: "Compare two 19th-century political pamphlets.",
    },
    {
      id: "task-4",
      courseId: "course-bio220",
      title: "Lab Report: Membrane Transport",
      type: "assignment",
      dueDate: isoDate(2, 17, 0),
      estimatedHours: 4,
      weight: 10,
      status: "in_progress",
      notes: "Figures are done; discussion section remaining.",
    },
    {
      id: "task-5",
      courseId: "course-bio220",
      title: "Unit Quiz — Organelles",
      type: "exam",
      dueDate: isoDate(4, 11, 0),
      estimatedHours: 3,
      weight: 8,
      status: "not_started",
      notes: "",
    },
    {
      id: "task-6",
      courseId: "course-stat301",
      title: "Problem Set 6",
      type: "assignment",
      dueDate: isoDate(1, 23, 59),
      estimatedHours: 5,
      weight: 8,
      status: "not_started",
      notes: "MLE and confidence intervals.",
    },
    {
      id: "task-7",
      courseId: "course-stat301",
      title: "Midterm Exam",
      type: "exam",
      dueDate: isoDate(6, 14, 0),
      estimatedHours: 8,
      weight: 30,
      status: "not_started",
      notes: "Closed book. Formula sheet provided.",
    },
    {
      id: "task-8",
      courseId: "course-hist110",
      title: "Weekly Reading Response",
      type: "assignment",
      dueDate: isoDate(0, 23, 59),
      estimatedHours: 1.5,
      weight: 3,
      status: "not_started",
      notes: "Chapter 12 discussion questions.",
    },
    {
      id: "task-9",
      courseId: "course-cs201",
      title: "Recitation worksheet",
      type: "assignment",
      dueDate: isoDate(8, 12, 0),
      estimatedHours: 2,
      weight: 2,
      status: "completed",
      notes: "Submitted.",
    },
  ];

  const availability = {
    weeklyHours: 22,
    preferredStartHour: 9,
    preferredEndHour: 22,
    days: {
      monday: { hours: 3, available: true },
      tuesday: { hours: 4, available: true },
      wednesday: { hours: 2, available: true },
      thursday: { hours: 4, available: true },
      friday: { hours: 3, available: true },
      saturday: { hours: 4, available: true },
      sunday: { hours: 2, available: true },
    },
    notes: "Evenings after 6pm work best on weekdays. Saturday mornings are free.",
  };

  const student = {
    name: "Alex Rivera",
    program: "Computer Science, B.S.",
    year: "Junior",
    term: "Fall 2026",
  };

  return { courses, tasks, availability, student };
}

module.exports = { buildSeed };
