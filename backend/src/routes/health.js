const { Router } = require("express");

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "studypulse-api",
    time: new Date().toISOString(),
  });
});

module.exports = router;
