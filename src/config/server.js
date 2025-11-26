require("dotenv").config();
const express = require("express");
const cors = require("cors");

const weatherRoutes = require("./routes/weatherRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Logging middleware to debug requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/weather", weatherRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "AgroAlert API is running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
