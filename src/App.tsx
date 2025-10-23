import "./index.css";
import { WeatherWidget } from "./components/WeatherWidget";
import { DebugBar } from "./components/DebugBar";

export function App() {
  return (
    <div className="min-h-screen bg-white p-6 pb-16">
      <div className="flex flex-wrap gap-6">
        <WeatherWidget />
      </div>
      <DebugBar />
    </div>
  );
}

export default App;
