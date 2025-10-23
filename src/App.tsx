import "./index.css";
import { WeatherWidget } from "./components/WeatherWidget";
import { HackerNewsWidget } from "./components/HackerNewsWidget";
import { RemindersWidget } from "./components/RemindersWidget";
import { ChoresWidget } from "./components/ChoresWidget";
import { GroceriesWidget } from "./components/GroceriesWidget";
import { GoalsWidget } from "./components/GoalsWidget";
import { DebugBar } from "./components/DebugBar";

export function App() {
  return (
    <div className="min-h-screen bg-white p-6 pb-16">
      <div className="grid grid-cols-2 gap-6 max-w-5xl mx-auto">
        <div className="flex flex-col gap-6">
          <WeatherWidget />
          <RemindersWidget />
          <GroceriesWidget />
        </div>
        <div className="flex flex-col gap-6">
          <HackerNewsWidget />
          <ChoresWidget />
          <GoalsWidget />
        </div>
      </div>
      <DebugBar />
    </div>
  );
}

export default App;
