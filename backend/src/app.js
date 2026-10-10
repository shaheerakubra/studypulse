const express = require("express");
const cors = require("cors");
const path = require("path");
const healthRouter = require("./routes/health");
const { coursesRouter } = require("./routes/courses");
const { tasksRouter } = require("./routes/tasks");
const { availabilityRouter } = require("./routes/availability");
const { insightsRouter } = require("./routes/insights");
const { notFound, errorHandler } = require("./middleware/errorHandler");

function createApp(store) {
  const app = express();
  const origin = process.env.CORS_ORIGIN || "http://localhost:5174";

  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
  });
  app.use(cors({ origin }));
  app.use(express.json({ limit: "50kb" }));

  app.use(healthRouter);
  app.use("/api/courses", coursesRouter(store));
  app.use("/api/tasks", tasksRouter(store));
  app.use("/api/availability", availabilityRouter(store));
  app.use("/api/insights", insightsRouter(store));

  const frontendDist = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(frontendDist));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/") || req.path === "/health") {
      return next();
    }
    return res.sendFile(path.join(frontendDist, "index.html"));
  });

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
