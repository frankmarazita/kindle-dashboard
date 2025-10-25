import { useState, useEffect } from "react";

export function DebugBar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [battery, setBattery] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/initial-data")
      .then((res) => res.json())
      .then((data) => setBattery(data.battery))
      .catch((err) => console.error("Failed to fetch initial data:", err));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    const dateStr = date.toLocaleDateString("en-AU", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const timeStr = date.toLocaleTimeString("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    return `${dateStr}, ${timeStr}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black px-4 py-2">
      <div className="flex justify-between items-center text-sm text-black">
        <div className="flex gap-4">
          {battery !== null && <span>Battery: {battery}%</span>}
        </div>
        <div>{formatDateTime(currentTime)}</div>
      </div>
    </div>
  );
}
