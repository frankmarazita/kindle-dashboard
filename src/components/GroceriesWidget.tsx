import { useState, useEffect } from "react";

interface GroceryItem {
  id: string;
  text: string;
}

export function GroceriesWidget() {
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroceries = async () => {
      try {
        const response = await fetch("/api/groceries");
        if (!response.ok) {
          throw new Error("Failed to fetch groceries");
        }
        const data = await response.json();
        setGroceries(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchGroceries();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-32"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-5 bg-neutral-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-300 rounded-lg p-6 shadow w-full">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Groceries</h2>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (groceries.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow w-full">
        <h2 className="text-2xl font-semibold text-black mb-4">Groceries</h2>
        <p className="text-neutral-500 text-sm">No groceries to buy</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow hover:shadow-md transition-shadow w-full">
      <h2 className="text-2xl font-semibold text-black mb-4">Groceries</h2>

      <div className="space-y-1">
        {groceries.map((item) => (
          <div
            key={item.id}
            className="py-2 border-b border-neutral-100 last:border-b-0"
          >
            <p className="text-base text-black leading-tight">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
