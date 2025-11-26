import express from "express";
import * as weatherController from "../controller/weatherController.js";

const router = express.Router();

// Get weather by city name or pincode
router.get("/:location", weatherController.getWeather);

export default router;
