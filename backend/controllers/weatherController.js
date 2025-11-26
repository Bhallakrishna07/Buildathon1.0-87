const axios = require("axios");

const getWeatherData = async (req, res) => {
  const city = req.params.city;
  const API_Key = process.env.OPENWEATHER_API_KEY;

  if (!API_Key) {
    return res.status(500).json({ error: "API Key not configured" });
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_Key}&units=metric`
    );

    // Return the FULL response from OpenWeather
    return res.json(response.data);
  } catch (error) {
    console.error("Weather API Error:", error.message);
    return res.status(500).json({
      error: "Failed to fetch weather data",
      details: error.response?.data?.message || error.message,
    });
  }
};

module.exports = { getWeatherData };
