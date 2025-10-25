import { serve } from "bun";
import { ObsidianApi } from "@frankmarazita/node-obsidian-local-rest-api";
import { ENV } from "./env";
import indexHtml from "./index.html";
import { PTVApi } from "./lib/ptv-api";

import * as Sentry from "@sentry/bun";

Sentry.init({
  environment: ENV.ENVIRONMENT,
  dsn: ENV.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

const obsidianApi = new ObsidianApi({
  host: ENV.OBSIDIAN_HOST,
  port: ENV.OBSIDIAN_PORT,
  token: ENV.OBSIDIAN_TOKEN,
  https: ENV.OBSIDIAN_HTTPS,
});

const ptvApi = new PTVApi({
  devId: ENV.PTV_DEV_ID,
  apiKey: ENV.PTV_API_KEY,
});

const server = serve({
  routes: {
    "/api/initial-data": {
      GET(req) {
        const batteryHeader = req.headers.get("x-battery");
        const battery = batteryHeader ? parseInt(batteryHeader, 10) : null;

        return Response.json({ battery });
      },
    },

    "/api/goals": {
      async GET() {
        try {
          const content = await obsidianApi.file.read("Goals.md");

          const lines = content.split("\n");
          const goals: Array<{
            id: string;
            text: string;
          }> = [];

          for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith("- ") && !trimmed.startsWith("**")) {
              const text = trimmed.substring(2).trim();
              if (text) {
                goals.push({
                  id: `goal-${goals.length}`,
                  text,
                });
              }
            }
          }

          return Response.json(goals);
        } catch (error) {
          console.error("Failed to fetch goals:", error);
          return Response.json(
            { error: "Failed to fetch goals" },
            { status: 500 }
          );
        }
      },
    },

    "/api/groceries": {
      async GET() {
        try {
          const content = await obsidianApi.file.read("Groceries.md");

          const lines = content.split("\n");
          const groceries: Array<{
            id: string;
            text: string;
          }> = [];

          for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith("- ") && !trimmed.startsWith("**")) {
              const text = trimmed.substring(2).trim();
              if (text) {
                groceries.push({
                  id: `grocery-${groceries.length}`,
                  text,
                });
              }
            }
          }

          return Response.json(groceries);
        } catch (error) {
          console.error("Failed to fetch groceries:", error);
          return Response.json(
            { error: "Failed to fetch groceries" },
            { status: 500 }
          );
        }
      },
    },

    "/api/chores": {
      async GET() {
        try {
          const content = await obsidianApi.file.read("Chores.md");

          const lines = content.split("\n");
          const chores: Array<{
            id: string;
            text: string;
          }> = [];

          for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith("- ")) {
              const text = trimmed.substring(2).trim();
              if (text) {
                chores.push({
                  id: `chore-${chores.length}`,
                  text,
                });
              }
            }
          }

          return Response.json(chores);
        } catch (error) {
          console.error("Failed to fetch chores:", error);
          return Response.json(
            { error: "Failed to fetch chores" },
            { status: 500 }
          );
        }
      },
    },

    "/api/reminders": {
      async GET() {
        try {
          const content = await obsidianApi.file.read("Reminders.md");

          const lines = content.split("\n");
          const reminders: Array<{
            id: string;
            text: string;
            dueDate?: string;
            completed?: boolean;
          }> = [];

          for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith("- [ ]") || trimmed.startsWith("- [x]")) {
              const isCompleted = trimmed.startsWith("- [x]");
              const contentAfterCheckbox = trimmed.substring(6).trim();

              const match = contentAfterCheckbox.match(
                /^\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})\]\s+(.+)$/
              );

              if (match) {
                const [, dateTimeStr, text] = match;
                if (!dateTimeStr || !text) continue;
                const dueDate = new Date(
                  dateTimeStr.replace(" ", "T") + ":00"
                ).toISOString();

                reminders.push({
                  id: `reminder-${reminders.length}`,
                  text: text.trim(),
                  dueDate,
                  completed: isCompleted,
                });
              }
            }
          }

          return Response.json(reminders.slice(0, 10));
        } catch (error) {
          console.error("Failed to fetch reminders:", error);
          return Response.json(
            { error: "Failed to fetch reminders" },
            { status: 500 }
          );
        }
      },
    },

    "/api/hackernews": {
      async GET() {
        try {
          const bestStoriesResponse = await fetch(
            "https://hacker-news.firebaseio.com/v0/beststories.json"
          );

          if (!bestStoriesResponse.ok) {
            throw new Error("Failed to fetch best stories");
          }

          const bestStoryIds = (await bestStoriesResponse.json()) as number[];

          const last24Hours = Date.now() / 1000 - 24 * 60 * 60;

          const storyPromises = bestStoryIds.slice(0, 50).map(async (id) => {
            const response = await fetch(
              `https://hacker-news.firebaseio.com/v0/item/${id}.json`
            );
            return response.json();
          });

          const stories = await Promise.all(storyPromises);

          const filteredAndSorted = stories
            .filter(
              (story) =>
                story && story.time >= last24Hours && story.type === "story"
            )
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 5);

          const formattedStories = filteredAndSorted.map((story) => ({
            title: story.title,
            url: story.url,
            points: story.score || 0,
            author: story.by,
            comments: story.descendants || 0,
          }));

          return Response.json(formattedStories);
        } catch (error) {
          console.error("HackerNews API error:", error);
          return Response.json(
            { error: "Failed to fetch HackerNews stories" },
            { status: 500 }
          );
        }
      },
    },

    "/api/ptv/departures": {
      async GET() {
        try {
          const JEWEL_STOP_ID = 1103;
          const BARKLY_SQUARE_STOP_ID = 2811;
          const ROUTE_TYPE_TRAIN = 0;
          const ROUTE_TYPE_TRAM = 1;
          const TRAIN_DIRECTION_ID_CITY = 1;
          const TRAM_DIRECTION_ID_CITY = 11;

          const [trainDepartures, tramDepartures] = await Promise.all([
            ptvApi.getDepartures(ROUTE_TYPE_TRAIN, JEWEL_STOP_ID, {
              maxResults: 15,
              directionId: TRAIN_DIRECTION_ID_CITY,
            }),
            ptvApi.getDepartures(ROUTE_TYPE_TRAM, BARKLY_SQUARE_STOP_ID, {
              maxResults: 15,
              directionId: TRAM_DIRECTION_ID_CITY,
            }),
          ]);

          const now = new Date();

          const trains = trainDepartures.departures
            .filter((dep) => dep.direction_id === TRAIN_DIRECTION_ID_CITY)
            .map((dep) => {
              const scheduledTime = new Date(dep.scheduled_departure_utc);
              const minutesUntil = Math.round(
                (scheduledTime.getTime() - now.getTime()) / 60000
              );

              const dayOfWeek = scheduledTime.toLocaleDateString("en-AU", {
                weekday: "short",
                timeZone: "Australia/Melbourne",
              });

              return {
                scheduledTime: scheduledTime.toLocaleTimeString("en-AU", {
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "Australia/Melbourne",
                }),
                dayOfWeek,
                minutesUntil,
              };
            })
            .filter((dep) => dep.minutesUntil >= 0)
            .slice(0, 12);

          const trams = tramDepartures.departures
            .filter((dep) => dep.direction_id === TRAM_DIRECTION_ID_CITY)
            .map((dep) => {
              const scheduledTime = new Date(dep.scheduled_departure_utc);
              const minutesUntil = Math.round(
                (scheduledTime.getTime() - now.getTime()) / 60000
              );

              const dayOfWeek = scheduledTime.toLocaleDateString("en-AU", {
                weekday: "short",
                timeZone: "Australia/Melbourne",
              });

              return {
                scheduledTime: scheduledTime.toLocaleTimeString("en-AU", {
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "Australia/Melbourne",
                }),
                dayOfWeek,
                minutesUntil,
              };
            })
            .filter((dep) => dep.minutesUntil >= 0)
            .slice(0, 12);

          return Response.json({ trains, trams });
        } catch (error) {
          console.error("PTV API error:", error);
          return Response.json(
            { error: "Failed to fetch PTV departures" },
            { status: 500 }
          );
        }
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
