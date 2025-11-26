const API_KEY = "eebc3d7adb97cc6343c734f635643a6e";
let tempChart = null;

document.getElementById("searchForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = document.getElementById("cityInput").value.trim();
  if (city) await fetchWeather(city);
});

async function fetchWeather(city) {
  const loadingSpinner = document.getElementById("loadingSpinner");
  const weatherInfo = document.getElementById("weatherInfo");
  const infoCards = document.getElementById("infoCards");
  const errorMessage = document.getElementById("errorMessage");

  loadingSpinner.classList.remove("hidden");
  weatherInfo.classList.add("hidden");
  infoCards.classList.add("hidden");
  errorMessage.classList.add("hidden");

  try {
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric`
    );
    if (!currentRes.ok) throw new Error("City not found");
    const currentData = await currentRes.json();

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
        city
      )}&appid=${API_KEY}&units=metric`
    );
    const forecastData = await forecastRes.json();

    updateUI(currentData, forecastData.list);
    loadingSpinner.classList.add("hidden");
    weatherInfo.classList.remove("hidden");
    infoCards.classList.add("hidden");
  } catch (error) {
    loadingSpinner.classList.add("hidden");
    errorMessage.classList.remove("hidden");
    document.getElementById("errorText").textContent =
      "City not found. Please try again.";
  }
}

function updateUI(current, forecast) {
  const temp = current.main.temp;
  const hum = current.main.humidity;
  const wind = current.wind.speed;

  document.getElementById(
    "cityName"
  ).textContent = `${current.name}, ${current.sys.country}`;
  document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  document.getElementById("temperature").textContent = Math.round(temp) + "°C";
  document.getElementById("feelsLike").textContent =
    "Feels like " + Math.round(current.main.feels_like) + "°C";
  document.getElementById("weatherCondition").textContent =
    current.weather[0].main;
  document.getElementById("humidity").textContent = hum + "%";
  document.getElementById("windSpeed").textContent = wind.toFixed(1) + " m/s";
  document.getElementById("pressure").textContent =
    current.main.pressure + " mb";
  document.getElementById("visibility").textContent =
    (current.visibility / 1000).toFixed(1) + " km";
  document.getElementById("cloudCover").textContent = current.clouds.all + "%";

  const rainChance = Math.round(
    (forecast.slice(0, 4).filter((i) => i.rain && i.rain["3h"] > 0).length /
      4) *
      100
  );
  document.getElementById("rainChance").textContent = rainChance + "%";

  generateAdvice(current, forecast);
  generateChart(forecast);
  generate5DayForecast(forecast);
}

function generateAdvice(current, forecast) {
  const advice = [];
  const temp = current.main.temp;
  const hum = current.main.humidity;
  const wind = current.wind.speed;

  if (temp >= 35)
    advice.push("🔥 Very hot — Water crops early morning & evening");
  else if (temp >= 30) advice.push("☀️ Hot — Check irrigation regularly");
  else if (temp <= 2) advice.push("❄️ Frost risk — Cover sensitive crops");
  else advice.push("✓ Good temperature — Continue normal practices");

  if (hum >= 80) advice.push("💧 High humidity — Watch for fungal disease");
  else if (hum <= 40) advice.push("🌧️ Low humidity — Increase irrigation");

  if (wind >= 8) advice.push("💨 Strong wind — Secure structures");
  if (forecast.slice(0, 4).some((i) => i.rain && i.rain["3h"] > 1))
    advice.push("🌧️ Rain expected — Delay spraying");

  const ul = document.getElementById("adviceList");
  ul.innerHTML = "";
  advice.forEach((a) => {
    const li = document.createElement("li");
    li.className =
      "flex gap-3 bg-green-50 p-4 rounded-lg border border-green-200";
    li.innerHTML = `<span class="text-green-600 font-bold">•</span><span class="text-gray-700">${a}</span>`;
    ul.appendChild(li);
  });
}

function generateChart(forecast) {
  const next12h = forecast.slice(0, 4);
  const labels = next12h.map((i) =>
    new Date(i.dt * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
  const temps = next12h.map((i) => i.main.temp);
  const humidity = next12h.map((i) => i.main.humidity);

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
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          labels: { font: { size: 12, weight: "bold" } },
        },
      },
      scales: {
        y: {
          type: "linear",
          display: true,
          position: "left",
          title: { display: true, text: "Temperature (°C)" },
          ticks: { color: "#f97316" },
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          title: { display: true, text: "Humidity (%)" },
          ticks: { color: "#0ea5e9" },
          min: 0,
          max: 100,
          grid: { display: false },
        },
      },
    },
  });
}

function generate5DayForecast(forecast) {
  const daily = [];
  for (let i = 0; i < forecast.length; i += 8) daily.push(forecast[i]);

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
    };
    const icon = icons[day.weather[0].main] || "🌤️";

    const card = document.createElement("div");
    card.className =
      "bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200";
    card.innerHTML = `
            <p class="text-sm font-bold text-gray-700 mb-2">${date.toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric" }
            )}</p>
            <div class="text-3xl mb-2">${icon}</div>
            <p class="text-xs text-gray-600 mb-2 capitalize">${
              day.weather[0].main
            }</p>
            <div class="flex justify-center gap-2 text-sm">
              <span class="font-bold text-gray-800">${Math.round(
                day.main.temp_max
              )}°</span>
              <span class="text-gray-500">${Math.round(
                day.main.temp_min
              )}°</span>
            </div>
          `;
    grid.appendChild(card);
  });
}
