import { useState, useEffect } from "react";

interface HackerNewsStory {
  title: string;
  url?: string;
  points: number;
  author: string;
  comments: number;
  timeAgo: string;
}

export function HackerNewsWidget() {
  const [stories, setStories] = useState<HackerNewsStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch("/api/hackernews");
        if (!response.ok) {
          throw new Error("Failed to fetch HackerNews stories");
        }
        const data = await response.json();
        setStories(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-black rounded-lg p-6 shadow w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-48"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="space-y-2 py-3 border-b border-neutral-100 last:border-b-0"
              >
                <div className="h-5 bg-neutral-200 rounded w-full"></div>
                <div className="h-4 bg-neutral-200 rounded w-32"></div>
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
        <h2 className="text-xl font-semibold text-red-600 mb-2">HackerNews</h2>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-black rounded-lg p-6 shadow hover:shadow-md transition-shadow w-full">
      <h2 className="text-2xl font-semibold text-black mb-4">
        HackerNews Top Stories
      </h2>

      <div className="space-y-1">
        {stories.map((story, index) => (
          <div
            key={index}
            className="py-3 border-b border-neutral-100 last:border-b-0"
          >
            <div className="flex items-start gap-3">
              <span className="text-lg font-semibold text-black min-w-6">
                {index + 1}.
              </span>
              <div className="flex-1 space-y-1">
                <h3 className="text-base font-medium text-black leading-tight">
                  {story.title}
                </h3>
                <div className="flex gap-3 text-xs text-black">
                  <span>{story.points} points</span>
                  <span>by {story.author}</span>
                  <span>{story.timeAgo}</span>
                  <span>{story.comments} comments</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
