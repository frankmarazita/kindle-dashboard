import { useState, useEffect } from "react";

declare global {
  interface Window {
    __INITIAL_DATA__?: {
      battery: number | null;
    };
  }
}

export function DebugBar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [battery] = useState<number | null>(
    typeof window !== "undefined" && window.__INITIAL_DATA__?.battery !== undefined
      ? window.__INITIAL_DATA__.battery
      : null
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-300 px-4 py-2">
      <div className="flex justify-between items-center text-sm text-black">
        <div className="flex gap-4">
          {battery !== null && (
            <span>Battery: {battery}%</span>
          )}
        </div>
        <div>
          {formatTime(currentTime)}
        </div>
      </div>
    </div>
  );
}
