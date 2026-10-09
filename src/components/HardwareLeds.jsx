import { LED_LABELS } from "../utils/hardware";

export default function HardwareLeds({ liveMode, connected, leds }) {
  if (!liveMode) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Hardware LEDs</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {connected
              ? "These flags are written to Firebase so the ESP32 matches the water-flow diagram."
              : "Waiting for ESP32. LEDs update as soon as hardware is connected."}
          </p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
          connected ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-500 border-gray-200"
        }`}>
          {connected ? "Synced" : "Not connected"}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {LED_LABELS.map(({ key, label }) => {
          const on = !!leds?.[key];
          return (
            <div key={key} className={`rounded-xl border px-3 py-2.5 ${on ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-100"}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${on ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-gray-300"}`} />
                <span className={`text-xs font-semibold ${on ? "text-green-800" : "text-gray-500"}`}>{label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
