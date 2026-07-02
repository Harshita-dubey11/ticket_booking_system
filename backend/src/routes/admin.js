const { Router } = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const {
  getVenues, getVenue, createVenue, updateVenue, deleteVenue,
  createCategory, updateCategory, deleteCategory,
  generateSeats, updateSeatCategory,
} = require("../controllers/venues.controller");

const router = Router();

router.get("/venues", authenticate, authorize("admin", "organiser"), getVenues);
router.get("/venues/:id", authenticate, authorize("admin", "organiser"), getVenue);

router.post("/venues", authenticate, authorize("admin"), createVenue);
router.put("/venues/:id", authenticate, authorize("admin"), updateVenue);
router.delete("/venues/:id", authenticate, authorize("admin"), deleteVenue);

router.post("/venues/:id/categories", authenticate, authorize("admin"), createCategory);
router.put("/categories/:id", authenticate, authorize("admin"), updateCategory);
router.delete("/categories/:id", authenticate, authorize("admin"), deleteCategory);

router.post("/venues/:id/generate-seats", authenticate, authorize("admin"), generateSeats);
router.put("/seats/:id", authenticate, authorize("admin"), updateSeatCategory);

module.exports = router;
