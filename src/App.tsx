import "./index.css";
import { WeatherWidget } from "./components/WeatherWidget";
import { HackerNewsWidget } from "./components/HackerNewsWidget";
import { DebugBar } from "./components/DebugBar";

export function App() {
  return (
    <div className="min-h-screen bg-white p-6 pb-16">
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <WeatherWidget />
        <HackerNewsWidget />
      </div>
      <DebugBar />
    </div>
  );
}

export default App;
