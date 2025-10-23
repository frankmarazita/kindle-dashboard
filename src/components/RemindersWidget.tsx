import { useState, useEffect } from "react";

interface Reminder {
  id: string;
  text: string;
  dueDate?: string;
  completed?: boolean;
}

export function RemindersWidget() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await fetch("/api/reminders");
        if (!response.ok) {
          throw new Error("Failed to fetch reminders");
        }
        const data = await response.json();
        setReminders(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null;

    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return "Today";
    if (isTomorrow) return "Tomorrow";

    return date.toLocaleDateString("en-AU", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-32"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2 py-2">
                <div className="h-5 bg-neutral-200 rounded w-full"></div>
                <div className="h-4 bg-neutral-200 rounded w-24"></div>
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
        <h2 className="text-xl font-semibold text-red-600 mb-2">Reminders</h2>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow w-full">
        <h2 className="text-2xl font-semibold text-black mb-4">Reminders</h2>
        <p className="text-neutral-500 text-sm">No reminders at the moment</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow hover:shadow-md transition-shadow w-full">
      <h2 className="text-2xl font-semibold text-black mb-4">Reminders</h2>

      <div className="space-y-1">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="py-3 border-b border-neutral-100 last:border-b-0"
          >
            <div className="space-y-1">
              <p
                className={`text-base leading-tight ${
                  reminder.completed
                    ? "text-neutral-400 line-through"
                    : "text-black"
                }`}
              >
                {reminder.text}
              </p>
              {reminder.dueDate && (
                <div className="flex gap-3 text-xs">
                  <span
                    className={
                      reminder.completed
                        ? "text-neutral-400"
                        : "text-neutral-500"
                    }
                  >
                    {formatDueDate(reminder.dueDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
