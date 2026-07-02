const { Router } = require("express");
const { authenticate } = require("../middleware/auth");
const { joinWaitlist, getMyWaitlist, leaveWaitlist } = require("../controllers/waitlist.controller");

const router = Router();

router.use(authenticate);

router.post("/events/:id/waitlist", joinWaitlist);
router.get("/", getMyWaitlist);
router.delete("/:id", leaveWaitlist);

module.exports = router;
