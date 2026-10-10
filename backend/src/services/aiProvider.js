/**
 * AI provider adapter.
 *
 * Local mode uses a deterministic mock so the app works without a paid API.
 * Swap `getProvider()` later to call an LLM while keeping the same contract:
 *   recommend({ tasks, courses, availability, collisions, workload })
 */

function rankScore(task, now, collisionMap) {
  if (task.status === "completed") return -Infinity;

  const due = new Date(task.dueDate).getTime();
  const hoursUntilDue = (due - now) / 36e5;
  const urgency = hoursUntilDue <= 0 ? 120 : Math.max(0, 100 - hoursUntilDue / 2);
  const weightScore = Number(task.weight) * 1.6;
  const effortScore = Math.min(Number(task.estimatedHours) * 4, 40);
  const progressBoost = task.status === "in_progress" ? 12 : 0;
  const examBoost = task.type === "exam" ? 18 : 0;
  const collisionBoost = (collisionMap.get(task.id) || 0) * 10;
  const overduePenalty = hoursUntilDue < 0 ? 40 : 0;

  return urgency + weightScore + effortScore + progressBoost + examBoost + collisionBoost + overduePenalty;
}

function explain(task, course, now, collisionMap, availability) {
  const due = new Date(task.dueDate);
  const hoursUntilDue = (due.getTime() - now) / 36e5;
  const days = hoursUntilDue / 24;
  const reasons = [];

  if (hoursUntilDue < 0) {
    reasons.push("This item is past its listed due date.");
  } else if (days <= 1) {
    reasons.push("It is due within the next 24 hours.");
  } else if (days <= 3) {
    reasons.push("The deadline is within three days.");
  } else {
    reasons.push(`It is due in about ${Math.ceil(days)} days.`);
  }

  if (task.weight >= 20) {
    reasons.push(`It carries a high grading weight (${task.weight}%).`);
  } else if (task.weight >= 10) {
    reasons.push(`It has meaningful grade impact (${task.weight}%).`);
  }

  if (task.type === "exam") {
    reasons.push("Exams usually need distributed review time.");
  }

  if (task.status === "in_progress") {
    reasons.push("You already started it, so finishing now reduces context switching.");
  }

  const collisions = collisionMap.get(task.id) || 0;
  if (collisions >= 2) {
    reasons.push("It sits in a dense deadline cluster with other courses.");
  }

  const weekly = availability?.weeklyHours || 0;
  if (weekly && task.estimatedHours >= weekly * 0.25) {
    reasons.push(
      `Estimated effort (${task.estimatedHours}h) is a large share of your weekly study capacity (${weekly}h).`
    );
  }

  if (course) {
    reasons.push(`Course context: ${course.code} — ${course.name}.`);
  }

  return reasons.join(" ");
}

async function mockRecommend(context) {
  const now = Date.now();
  const collisionMap = new Map();
  for (const cluster of context.collisions?.clusters || []) {
    for (const taskId of cluster.taskIds) {
      collisionMap.set(taskId, (collisionMap.get(taskId) || 0) + cluster.taskIds.length - 1);
    }
  }

  const courseById = new Map((context.courses || []).map((c) => [c.id, c]));
  const ranked = [...(context.tasks || [])]
    .filter((t) => t.status !== "completed")
    .map((task) => {
      const course = courseById.get(task.courseId);
      const score = rankScore(task, now, collisionMap);
      return {
        taskId: task.id,
        score: Math.round(score * 10) / 10,
        title: task.title,
        courseCode: course?.code || "Course",
        type: task.type,
        dueDate: task.dueDate,
        estimatedHours: task.estimatedHours,
        weight: task.weight,
        status: task.status,
        explanation: explain(task, course, now, collisionMap, context.availability),
      };
    })
    .sort((a, b) => b.score - a.score);

  const next = ranked[0] || null;
  const summary = next
    ? `Start with ${next.courseCode}: ${next.title}. ${next.explanation}`
    : "You have no open assignments or exams. Add coursework to get a study plan.";

  return {
    provider: "mock",
    generatedAt: new Date().toISOString(),
    next,
    ranked,
    summary,
    disclaimer:
      "These suggestions are generated from due dates, weights, effort, collisions, and your availability. They are not official academic advice. Always verify deadlines and requirements with your syllabus and course portal.",
  };
}

function getProvider() {
  const name = (process.env.AI_PROVIDER || "mock").toLowerCase();
  if (name === "mock") {
    return { name: "mock", recommend: mockRecommend };
  }
  // Placeholder for a future LLM adapter (OpenAI, etc.)
  return { name: "mock", recommend: mockRecommend };
}

module.exports = { getProvider, mockRecommend };
