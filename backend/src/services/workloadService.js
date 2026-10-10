const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function openTasks(tasks) {
  return tasks.filter((t) => t.status !== "completed");
}

function hoursInWindow(tasks, from, to) {
  return openTasks(tasks)
    .filter((t) => {
      const due = new Date(t.dueDate).getTime();
      return due >= from && due <= to;
    })
    .reduce((sum, t) => sum + Number(t.estimatedHours || 0), 0);
}

function classifyLevel(hours, availableHours) {
  const ratio = availableHours > 0 ? hours / availableHours : hours / 8;
  if (ratio >= 1.15 || hours >= 14) return "high";
  if (ratio >= 0.65 || hours >= 7) return "medium";
  return "low";
}

function buildWorkloadSummary({ tasks, courses, availability }) {
  const now = Date.now();
  const open = openTasks(tasks);
  const next7 = hoursInWindow(tasks, now, now + 7 * DAY_MS);
  const next3 = hoursInWindow(tasks, now, now + 3 * DAY_MS);
  const weeklyCap = availability?.weeklyHours || 20;
  const threeDayCap = Math.max(4, Math.round((weeklyCap / 7) * 3));

  const overdue = open.filter((t) => new Date(t.dueDate).getTime() < now);
  const completed = tasks.filter((t) => t.status === "completed");
  const inProgress = open.filter((t) => t.status === "in_progress");

  const byCourse = courses.map((course) => {
    const courseTasks = open.filter((t) => t.courseId === course.id);
    const hours = courseTasks.reduce((s, t) => s + Number(t.estimatedHours || 0), 0);
    const nextDue = courseTasks
      .map((t) => new Date(t.dueDate).getTime())
      .sort((a, b) => a - b)[0];
    return {
      courseId: course.id,
      code: course.code,
      name: course.name,
      color: course.color,
      openTasks: courseTasks.length,
      remainingHours: hours,
      nextDue: nextDue ? new Date(nextDue).toISOString() : null,
    };
  });

  const overallHours = open.reduce((s, t) => s + Number(t.estimatedHours || 0), 0);
  const level = classifyLevel(next7, weeklyCap);

  return {
    overallLevel: level,
    remainingOpenHours: overallHours,
    hoursNext3Days: next3,
    hoursNext7Days: next7,
    weeklyCapacityHours: weeklyCap,
    threeDayCapacityHours: threeDayCap,
    openCount: open.length,
    completedCount: completed.length,
    inProgressCount: inProgress.length,
    overdueCount: overdue.length,
    completionRate:
      tasks.length === 0 ? 0 : Math.round((completed.length / tasks.length) * 100),
    byCourse,
    indicators: {
      next3Days: classifyLevel(next3, threeDayCap),
      next7Days: level,
    },
  };
}

module.exports = { buildWorkloadSummary, classifyLevel, hoursInWindow, DAY_MS };
