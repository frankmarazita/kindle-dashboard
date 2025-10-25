import { useState, useEffect } from "react";

interface Departure {
  scheduledTime: string;
  dayOfWeek: string;
}

interface PTVData {
  trains: Departure[];
  trams: Departure[];
}

export function PTVWidget() {
  const [data, setData] = useState<PTVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartures = async () => {
      try {
        const response = await fetch("/api/ptv/departures");
        if (!response.ok) {
          throw new Error("Failed to fetch departure data");
        }
        const fetchedData = await response.json();
        setData(fetchedData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartures();
    const interval = setInterval(fetchDepartures, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-black rounded-lg p-6 shadow w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-3/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-5 bg-neutral-200 rounded w-32"></div>
                <div className="h-5 bg-neutral-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-300 rounded-lg p-6 shadow w-full">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Departures</h2>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!data || (data.trains.length === 0 && data.trams.length === 0)) {
    return (
      <div className="bg-white border border-black rounded-lg p-6 shadow w-full">
        <h2 className="text-2xl font-semibold text-black mb-4">Departures</h2>
        <p className="text-black">No departures available</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-black rounded-lg p-6 shadow hover:shadow-md transition-shadow w-full">
      <h2 className="text-2xl font-semibold text-black mb-4">Departures</h2>

      <div className="space-y-3">
        {data.trains.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-black uppercase mb-1.5">
              Train - Jewell → City
            </h3>
            <div className="grid grid-cols-4 gap-x-2 gap-y-1">
              {data.trains.map((departure, index) => (
                <div key={index} className="text-black font-medium text-xs">
                  {departure.dayOfWeek} {departure.scheduledTime}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.trams.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-black uppercase mb-1.5">
              Tram 19 - Barkly Sq → City
            </h3>
            <div className="grid grid-cols-4 gap-x-2 gap-y-1">
              {data.trams.map((departure, index) => (
                <div key={index} className="text-black font-medium text-xs">
                  {departure.dayOfWeek} {departure.scheduledTime}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
