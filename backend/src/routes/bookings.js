const { Router } = require("express");
const { authenticate } = require("../middleware/auth");
const { createBooking, getMyBookings, getBooking, cancelBooking } = require("../controllers/bookings.controller");

const router = Router();

router.use(authenticate);

router.post("/", createBooking);
router.get("/", getMyBookings);
router.get("/:id", getBooking);
router.post("/:id/cancel", cancelBooking);

module.exports = router;
