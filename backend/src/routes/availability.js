const { Router } = require("express");
const { validateAvailability } = require("../middleware/validate");

function availabilityRouter(store) {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json({ availability: store.availability, student: store.student });
  });

  router.put("/", (req, res) => {
    store.availability = validateAvailability(req.body);
    res.json({ availability: store.availability });
  });

  return router;
}

module.exports = { availabilityRouter };
