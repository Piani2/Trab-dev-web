const express = require("express");
const { listMeasures, saveMeasure } = require("../controllers/measureController");

const router = express.Router();

router.get("/", listMeasures);
router.post("/", saveMeasure);

module.exports = router;
