import fetch from "node-fetch"; // needed for OpenWeather
import { Configuration, OpenAIApi } from "openai";

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_KEY,
  })
);

app.get("/api/weather", async (req, res) => {
  const { location } = req.query;

  if (!location) return res.status(400).json({ error: "Location required" });

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      location
    )}&units=metric&appid=${process.env.OPENWEATHER_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) return res.status(400).json({ error: data.message });

    const weather = {
      location: data.name,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      condition: data.weather[0].main,
      alerts: "No major risks ✅", // optional: you can integrate weather alerts API later
    };

    res.json(weather);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});
