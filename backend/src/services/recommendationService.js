const { getProvider } = require("./aiProvider");
const { buildCollisionRadar } = require("./collisionService");
const { buildWorkloadSummary } = require("./workloadService");

async function buildRecommendation({ tasks, courses, availability }) {
  const collisions = buildCollisionRadar({ tasks, courses });
  const workload = buildWorkloadSummary({ tasks, courses, availability });
  const provider = getProvider();
  const ai = await provider.recommend({
    tasks,
    courses,
    availability,
    collisions,
    workload,
  });
  return { ai, collisions, workload };
}

module.exports = { buildRecommendation };
