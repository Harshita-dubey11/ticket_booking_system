const { Router } = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const {
  getVenues, getVenue, createVenue, updateVenue, deleteVenue,
  createCategory, updateCategory, deleteCategory,
  generateSeats, updateSeatCategory,
} = require("../controllers/venues.controller");

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/venues", getVenues);
router.post("/venues", createVenue);
router.get("/venues/:id", getVenue);
router.put("/venues/:id", updateVenue);
router.delete("/venues/:id", deleteVenue);

router.post("/venues/:id/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

router.post("/venues/:id/generate-seats", generateSeats);
router.put("/seats/:id", updateSeatCategory);

module.exports = router;
