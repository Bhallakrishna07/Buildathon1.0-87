import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors()); // allow cross-origin requests
app.use(express.json()); // parse JSON body

app.get("/", (req, res) => res.send("AgroAlert API Running ✅"));

app.get("/api/weather", (req, res) => {
  const { location } = req.query;
  res.json({
    location,
    temperature: 30,
    humidity: 60,
    condition: "Sunny",
    alerts: "No major risks ✅",
  });
});

app.post("/api/ai", (req, res) => {
  const { crop, weather } = req.body || {};
  if (!crop || !weather) {
    return res.status(400).json({ error: "crop and weather required" });
  }
  res.json({
    suggestion: `For ${crop}: monitor irrigation; temperature ${weather.temperature}°C, humidity ${weather.humidity}%.`,
  });
});

app.listen(5000, () => console.log("Server is running on port: 5000"));
