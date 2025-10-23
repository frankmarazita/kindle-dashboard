import { serve } from "bun";
import indexHtml from "./index.html";

const server = serve({
  routes: {
    "/api/initial-data": {
      GET(req) {
        const batteryHeader = req.headers.get("x-battery");
        const battery = batteryHeader ? parseInt(batteryHeader, 10) : null;

        return Response.json({ battery });
      },
    },

    "/*": indexHtml,

    "/api/weather": {
      async GET() {
        try {
          const latitude = -37.8136;
          const longitude = 144.9631;

          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch weather data");
          }

          const data = await response.json();

          const weatherCodeMap: Record<number, string> = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Foggy",
            48: "Foggy",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            71: "Slight snow",
            73: "Moderate snow",
            75: "Heavy snow",
            77: "Snow grains",
            80: "Slight rain showers",
            81: "Moderate rain showers",
            82: "Violent rain showers",
            85: "Slight snow showers",
            86: "Heavy snow showers",
            95: "Thunderstorm",
            96: "Thunderstorm with hail",
            99: "Thunderstorm with hail",
          };

          return Response.json({
            location: "Melbourne, Australia",
            temperature: data.current.temperature_2m,
            condition: weatherCodeMap[data.current.weather_code] || "Unknown",
            humidity: data.current.relative_humidity_2m,
            windSpeed: Math.round(data.current.wind_speed_10m),
          });
        } catch (error) {
          console.error("Weather API error:", error);
          return Response.json(
            { error: "Failed to fetch weather data" },
            { status: 500 }
          );
        }
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
