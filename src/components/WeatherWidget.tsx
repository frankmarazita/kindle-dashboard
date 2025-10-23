import { useState, useEffect } from "react";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch("/api/weather");
        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }
        const data = await response.json();
        setWeather(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow w-80 h-64">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-3/4"></div>

          <div className="space-y-4">
            <div>
              <div className="h-14 bg-neutral-200 rounded w-32 mb-2"></div>
              <div className="h-7 bg-neutral-200 rounded w-40"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
              <div className="space-y-2">
                <div className="h-4 bg-neutral-200 rounded w-16"></div>
                <div className="h-6 bg-neutral-200 rounded w-12"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-neutral-200 rounded w-20"></div>
                <div className="h-6 bg-neutral-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-300 rounded-lg p-6 shadow w-80 h-64">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Weather</h2>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow hover:shadow-md transition-shadow w-80 h-64">
      <h2 className="text-2xl font-semibold text-black mb-4">
        {weather.location}
      </h2>

      <div className="space-y-4">
        <div>
          <div className="text-5xl font-bold text-black">
            {Math.round(weather.temperature)}°C
          </div>
          <div className="text-xl text-neutral-600 mt-2">
            {weather.condition}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
          <div>
            <div className="text-sm text-neutral-500">Humidity</div>
            <div className="text-lg text-black">{weather.humidity}%</div>
          </div>
          <div>
            <div className="text-sm text-neutral-500">Wind Speed</div>
            <div className="text-lg text-black">{weather.windSpeed} km/h</div>
          </div>
        </div>
      </div>
    </div>
  );
}
