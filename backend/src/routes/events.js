const { Router } = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const {
  browseEvents, getMyEvents, getEvent, getSeatMap,
  createEvent, updateEvent, deleteEvent,
  setPricing, getRevenue,
} = require("../controllers/events.controller");

const router = Router();

router.get("/", browseEvents);
router.get("/my", authenticate, authorize("organiser", "admin"), getMyEvents);
router.get("/:id", getEvent);
router.get("/:id/seats", getSeatMap);

router.post("/", authenticate, authorize("organiser"), createEvent);
router.put("/:id", authenticate, authorize("organiser", "admin"), updateEvent);
router.delete("/:id", authenticate, authorize("organiser", "admin"), deleteEvent);

router.put("/:id/pricing", authenticate, authorize("organiser"), setPricing);
router.get("/:id/revenue", authenticate, authorize("organiser", "admin"), getRevenue);

module.exports = router;
