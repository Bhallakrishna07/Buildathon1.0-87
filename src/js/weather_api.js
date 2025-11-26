// ================================
// CONFIG
// ================================
const BACKEND_URL = "http://localhost:5000"; // Backend URL

let tempChart = null;

/* -----------------------
   CROP TIPS DATABASE
   ----------------------- */
const cropTips = {
  Wheat: [
    "Maintain moderate watering during early growth.",
    "Avoid waterlogging—wheat is sensitive to excess moisture.",
    "Use nitrogen fertilizers at tillering and jointing stages.",
  ],
  Rice: [
    "Keep fields flooded 2–3 cm during early growth.",
    "Ensure proper drainage before harvest.",
    "High humidity may increase pest risk—monitor regularly.",
  ],
  Maize: [
    "Ensure good sunlight exposure for strong growth.",
    "Do not over-irrigate—maize prefers well-drained soil.",
    "Strong winds may damage stems—support if needed.",
  ],
  Sugarcane: [
    "Irrigate every 10–12 days in summer.",
    "Maintain soil moisture but prevent stagnation.",
    "Apply potassium-rich fertilizer for better yields.",
  ],
};

/* -----------------------
   Inject Crop Selector
   ----------------------- */
function injectCropSelector() {
  const form = document.getElementById("searchForm");
  if (!form) return;

  const cropDiv = document.createElement("div");
  cropDiv.className = "mt-4 w-full";

  cropDiv.innerHTML = `
    <select id="cropSelector"
      class="w-full px-4 py-3 rounded-lg border-2 border-gray-300
             focus:border-green-600 focus:outline-none text-gray-800">
      <option value="">Select Crop (Optional)</option>
      ${Object.keys(cropTips)
        .map((c) => `<option value="${c}">${c}</option>`)
        .join("")}
    </select>
  `;

  form.appendChild(cropDiv);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  injectCropSelector();
});

/* -----------------------
   Form Submit
   ----------------------- */
document.getElementById("searchForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = document.getElementById("cityInput").value.trim();
  if (city) await fetchWeather(city);
});

/* -----------------------
   Fetch Weather (Backend + Forecast)
   ----------------------- */
async function fetchWeather(cityOrPin) {
  const loadingSpinner = document.getElementById("loadingSpinner");
  const weatherInfo = document.getElementById("weatherInfo");
  const errorMessage = document.getElementById("errorMessage");
  const errorText = document.getElementById("errorText");

  // Show loading
  loadingSpinner.classList.remove("hidden");
  weatherInfo.classList.add("hidden");
  errorMessage.classList.add("hidden");

  try {
    console.log(`🔍 Fetching weather for: ${cityOrPin}`);

    // --- 1. Current weather from YOUR backend ---
    const currentRes = await fetch(
      `${BACKEND_URL}/api/weather/${encodeURIComponent(cityOrPin)}`
    );

    if (!currentRes.ok) {
      const errorData = await currentRes.json();
      throw new Error(errorData.message || "Location not found");
    }

    const currentData = await currentRes.json();
    console.log("✅ Current weather data received:", currentData.name);

    // --- 2. Forecast from OpenWeather (direct call) ---
    const API_KEY = "eebc3d7adb97cc6343c734f635643a6e";

    // Build forecast query
    let forecastQuery;
    if (/^\d{6}$/.test(cityOrPin)) {
      forecastQuery = `zip=${cityOrPin},in`;
    } else {
      forecastQuery = `q=${encodeURIComponent(cityOrPin)}`;
    }

    console.log("🔍 Fetching 5-day forecast...");
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?${forecastQuery}&appid=${API_KEY}&units=metric`
    );

    if (!forecastRes.ok) {
      throw new Error("Forecast not available");
    }

    const forecastData = await forecastRes.json();
    console.log("✅ Forecast data received");

    // Calculate rain chance for next 12 hours (4 data points, 3h each)
    const rainChance = calculateRainChance(forecastData.list.slice(0, 4));

    // Update UI with all data
    updateUI(currentData, forecastData.list, rainChance);

    // Hide loading, show weather info
    loadingSpinner.classList.add("hidden");
    weatherInfo.classList.remove("hidden");
  } catch (err) {
    console.error("❌ Error fetching weather:", err);
    loadingSpinner.classList.add("hidden");
    errorMessage.classList.remove("hidden");

    if (
      err.message.includes("Failed to fetch") ||
      err.message.includes("NetworkError")
    ) {
      errorText.textContent =
        "Cannot connect to server. Make sure the backend is running on http://localhost:5000";
    } else {
      errorText.textContent =
        err.message || "City or PINCODE invalid. Please try again.";
    }
  }
}

/* -----------------------
   Calculate Rain Chance
   ----------------------- */
function calculateRainChance(forecastList) {
  const rainyPeriods = forecastList.filter(
    (item) => item.rain && item.rain["3h"] > 0
  ).length;
  return Math.round((rainyPeriods / forecastList.length) * 100);
}

/* -----------------------
   Update UI
   ----------------------- */
function updateUI(current, forecast, rainChance) {
  console.log("🎨 Updating UI...");

  const temp = current.main.temp;
  const hum = current.main.humidity;
  const wind = current.wind.speed;

  // City and Date
  document.getElementById(
    "cityName"
  ).textContent = `${current.name}, ${current.sys.country}`;
  document.getElementById("currentDate").textContent =
    new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Temperature and Weather
  document.getElementById("temperature").textContent = Math.round(temp) + "°C";
  document.getElementById("feelsLike").textContent =
    "Feels like " + Math.round(current.main.feels_like) + "°C";
  document.getElementById("weatherCondition").textContent =
    current.weather[0].main;

  // Metrics
  document.getElementById("humidity").textContent = hum + "%";
  document.getElementById("windSpeed").textContent = wind.toFixed(1) + " m/s";
  document.getElementById("pressure").textContent =
    current.main.pressure + " mb";
  document.getElementById("visibility").textContent =
    (current.visibility / 1000).toFixed(1) + " km";
  document.getElementById("cloudCover").textContent = current.clouds.all + "%";
  document.getElementById("rainChance").textContent = rainChance + "%";

  // Generate dynamic content
  generateAdvice(current, forecast);
  generateCautions(current, forecast, rainChance);
  generateChart(forecast);
  generate5DayForecast(forecast);

  console.log("✅ UI updated successfully");
}

/* -----------------------
   Crop-Specific Advice
   ----------------------- */
function generateAdvice(current, forecast) {
  const advice = [];
  const crop = document.getElementById("cropSelector")?.value || "";

  if (crop && cropTips[crop]) {
    advice.push(`<strong>${crop}</strong>`);
    cropTips[crop].forEach((tip) => advice.push(tip));
  }

  const ul = document.getElementById("adviceList");
  ul.innerHTML = "";

  if (advice.length === 0) {
    ul.innerHTML = `
      <li class='flex gap-3 bg-green-50 p-4 rounded-lg border border-green-200'>
        <span class='text-green-600 font-bold'>✓</span>
        <span class='text-gray-700'>Select a crop above to get specific farming advice.</span>
      </li>`;
    return;
  }

  advice.forEach((item) => {
    const li = document.createElement("li");
    li.className =
      "flex gap-3 bg-green-50 p-4 rounded-lg border border-green-200";
    li.innerHTML = `<span class="text-green-600 font-bold">•</span><span class="text-gray-700">${item}</span>`;
    ul.appendChild(li);
  });
}

/* -----------------------
   Weather Cautions/Alerts
   ----------------------- */
function generateCautions(current, forecast, rainChance) {
  const cautions = [];
  const temp = current.main.temp;
  const hum = current.main.humidity;
  const wind = current.wind.speed;

  if (temp > 37) cautions.push("Heatwave risk — Extra watering recommended.");
  if (temp < 5) cautions.push("Frost conditions — Protect young plants.");
  if (hum > 85) cautions.push("Very high humidity — Fungal disease risk.");
  if (rainChance > 50)
    cautions.push("Heavy rainfall expected — Secure stored crops.");
  if (wind > 10) cautions.push("High winds — Avoid spraying pesticides today.");

  const ul = document.getElementById("cautionList");
  ul.innerHTML = "";

  if (cautions.length === 0) {
    ul.innerHTML = `
      <li class='p-4 bg-green-50 rounded-lg border border-green-200'>
        <span class='text-green-700 font-semibold'>✓ No major weather risks detected today.</span>
      </li>`;
    return;
  }

  cautions.forEach((caution) => {
    const li = document.createElement("li");
    li.className = "flex gap-3 bg-red-50 p-4 rounded-lg border border-red-300";
    li.innerHTML = `<span class="text-red-600 font-bold text-xl">⚠</span><span class="text-gray-700">${caution}</span>`;
    ul.appendChild(li);
  });
}

/* -----------------------
   Temperature Chart (12h)
   ----------------------- */
function generateChart(forecast) {
  const next12h = forecast.slice(0, 4);
  const labels = next12h.map((item) =>
    new Date(item.dt * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
  const temps = next12h.map((item) => item.main.temp);
  const humidity = next12h.map((item) => item.main.humidity);

  const ctx = document.getElementById("tempChart").getContext("2d");
  if (tempChart) tempChart.destroy();

  tempChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temps,
          borderColor: "#f97316",
          backgroundColor: "rgba(249, 115, 22, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointBackgroundColor: "#f97316",
          yAxisID: "y",
        },
        {
          label: "Humidity (%)",
          data: humidity,
          borderColor: "#0ea5e9",
          backgroundColor: "rgba(14, 165, 233, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointBackgroundColor: "#0ea5e9",
          yAxisID: "y1",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          display: true,
          labels: { font: { size: 12, weight: "bold" } },
        },
      },
      scales: {
        y: { position: "left", ticks: { color: "#f97316" } },
        y1: {
          position: "right",
          ticks: { color: "#0ea5e9" },
          min: 0,
          max: 100,
          grid: { display: false },
        },
      },
    },
  });
}

/* -----------------------
   5-Day Forecast
   ----------------------- */
function generate5DayForecast(forecast) {
  const daily = [];
  for (let i = 0; i < forecast.length; i += 8) {
    daily.push(forecast[i]);
  }

  const grid = document.getElementById("forecastGrid");
  grid.innerHTML = "";

  daily.slice(0, 5).forEach((day) => {
    const date = new Date(day.dt * 1000);
    const icons = {
      Clear: "☀️",
      Clouds: "☁️",
      Rain: "🌧️",
      Drizzle: "🌦️",
      Thunderstorm: "⛈️",
      Snow: "❄️",
      Mist: "🌫️",
      Haze: "🌫️",
    };
    const icon = icons[day.weather[0].main] || "🌤️";

    const card = document.createElement("div");
    card.className =
      "bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200 hover:shadow-md transition";
    card.innerHTML = `
      <p class="text-sm font-bold text-gray-700 mb-2">
        ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </p>
      <div class="text-4xl mb-2">${icon}</div>
      <p class="text-xs text-gray-600 mb-2 capitalize">${
        day.weather[0].description
      }</p>
      <div class="flex justify-center gap-2 text-sm">
        <span class="font-bold text-gray-800">${Math.round(
          day.main.temp_max
        )}°</span>
        <span class="text-gray-500">${Math.round(day.main.temp_min)}°</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Log when s
