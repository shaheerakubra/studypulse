const { DAY_MS } = require("./workloadService");

function dayKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function buildCollisionRadar({ tasks, courses, horizonDays = 10 }) {
  const now = Date.now();
  const horizon = now + horizonDays * DAY_MS;
  const courseById = new Map(courses.map((c) => [c.id, c]));

  const open = tasks.filter((t) => t.status !== "completed");
  const upcoming = open.filter((t) => {
    const due = new Date(t.dueDate).getTime();
    return due <= horizon;
  });

  const byDay = new Map();
  for (const task of upcoming) {
    const key = dayKey(task.dueDate);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(task);
  }

  const days = [];
  for (let i = 0; i < horizonDays; i += 1) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    const key = dayKey(d);
    const items = byDay.get(key) || [];
    const hours = items.reduce((s, t) => s + Number(t.estimatedHours || 0), 0);
    const uniqueCourses = new Set(items.map((t) => t.courseId));
    let intensity = "low";
    if (items.length >= 3 || hours >= 10 || uniqueCourses.size >= 3) intensity = "high";
    else if (items.length >= 2 || hours >= 5 || uniqueCourses.size >= 2) intensity = "medium";

    days.push({
      date: key,
      label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      taskCount: items.length,
      hours,
      courseCount: uniqueCourses.size,
      intensity,
      tasks: items.map((t) => ({
        id: t.id,
        title: t.title,
        type: t.type,
        estimatedHours: t.estimatedHours,
        weight: t.weight,
        courseCode: courseById.get(t.courseId)?.code || "",
        color: courseById.get(t.courseId)?.color || "#1B6B93",
      })),
    });
  }

  const clusters = [];
  for (let i = 0; i < days.length; i += 1) {
    const window = days.slice(i, i + 2);
    const allTasks = window.flatMap((d) => d.tasks);
    const hours = window.reduce((s, d) => s + d.hours, 0);
    const courseCount = new Set(
      window.flatMap((d) => d.tasks.map((t) => t.courseCode))
    ).size;
    if (allTasks.length >= 2 && (hours >= 8 || courseCount >= 2)) {
      clusters.push({
        id: `cluster-${window[0].date}`,
        start: window[0].date,
        end: window[window.length - 1].date,
        hours,
        courseCount,
        severity: hours >= 12 || allTasks.length >= 3 ? "high" : "medium",
        taskIds: [...new Set(window.flatMap((d) => days.find((x) => x.date === d.date)?.tasks.map((t) => t.id) || []))],
        label: `${allTasks.length} deadlines between ${window[0].label} and ${window[window.length - 1].label}`,
      });
    }
  }

  const uniqueClusters = [];
  const seen = new Set();
  for (const c of clusters) {
    const key = c.taskIds.slice().sort().join(",");
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueClusters.push(c);
  }

  const peak = [...days].sort((a, b) => b.hours - a.hours || b.taskCount - a.taskCount)[0];
  const highDays = days.filter((d) => d.intensity === "high").length;

  return {
    horizonDays,
    days,
    clusters: uniqueClusters,
    peakDay: peak?.taskCount ? peak : null,
    highIntensityDays: highDays,
    narrative:
      highDays > 0
        ? `${highDays} day(s) in the next ${horizonDays} look overloaded. Protect study blocks before ${peak?.label || "the peak"}.`
        : uniqueClusters.length
          ? "A few deadlines overlap, but the next stretch is manageable if you start the heaviest items first."
          : "Deadlines are relatively spread out. Use the quieter days to get ahead on high-weight work.",
  };
}

module.exports = { buildCollisionRadar };
