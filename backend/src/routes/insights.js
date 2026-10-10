const { Router } = require("express");
const { buildCollisionRadar } = require("../services/collisionService");
const { buildWorkloadSummary } = require("../services/workloadService");
const { buildRecommendation } = require("../services/recommendationService");

function insightsRouter(store) {
  const router = Router();

  router.get("/dashboard", async (_req, res, next) => {
    try {
      const { ai, collisions, workload } = await buildRecommendation(store);
      const upcoming = [...store.tasks]
        .filter((t) => t.status !== "completed")
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 8);
      res.json({
        student: store.student,
        courses: store.courses,
        upcoming,
        workload,
        collisions,
        recommendation: ai,
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/workload", (_req, res) => {
    res.json({
      workload: buildWorkloadSummary(store),
    });
  });

  router.get("/collisions", (_req, res) => {
    res.json({
      collisions: buildCollisionRadar(store),
    });
  });

  router.get("/next", async (_req, res, next) => {
    try {
      const { ai } = await buildRecommendation(store);
      res.json({ recommendation: ai });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { insightsRouter };
