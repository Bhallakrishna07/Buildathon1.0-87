import axios from "axios";

const API_KEY =
  process.env.OPENWEATHER_API_KEY || "eebc3d7adb97cc6343c734f635643a6e";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export const getWeather = async (req, res) => {
  try {
    const { location } = req.params;

    // Check if location is a 6-digit pincode
    const isPincode = /^\d{6}$/.test(location);

    let query;
    if (isPincode) {
      query = `zip=${location},in`;
    } else {
      query = `q=${encodeURIComponent(location)}`;
    }

    const response = await axios.get(
      `${BASE_URL}?${query}&appid=${API_KEY}&units=metric`
    );

    res.json(response.data);
  } catch (error) {
    console.error("Weather API Error:", error.message);

    if (error.response) {
      res.status(error.response.status).json({
        error: "Location not found",
        message: error.response.data.message,
      });
    } else {
      res.status(500).json({
        error: "Server error",
        message: "Unable to fetch weather data",
      });
    }
  }
};
