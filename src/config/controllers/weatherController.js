const axios = require("axios");

const getWeatherData = async (req, res) => {
  const city = req.params.city;
  const API_Key = process.env.OPENWEATHER_API_KEY;
};
if (!API_Key) {
  return res.status(500).json({ error: "API Key not configured" });
}
try {
  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_Key}&units=metric`
  );
  return res.json(response.data);
} catch (error) {
  console.error("Error fetching weather data:", error.message);
  res.status(500).json({ error: "Failed to fetch weather data" });
}
