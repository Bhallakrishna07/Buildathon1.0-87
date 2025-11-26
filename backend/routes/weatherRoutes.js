const express = require("express");
const router = express.Router();

const { getWeatherData } = require("../controllers/weatherController");

router.get("/:city", getWeatherData);

module.exports = router;
