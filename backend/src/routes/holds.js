const { Router } = require("express");
const { authenticate } = require("../middleware/auth");
const { placeHold, releaseHold, getHolds } = require("../controllers/holds.controller");

const router = Router();

router.use(authenticate);

router.post("/", placeHold);
router.delete("/", releaseHold);
router.get("/", getHolds);

module.exports = router;
