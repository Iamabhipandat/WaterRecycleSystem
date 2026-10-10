import { LED_LABELS } from "../utils/hardware";

const LED_PHASE_CONFIG = {
  ro: { phase: "COLLECTION", bgOn: "bg-amber-50 border-amber-200", dotOn: "bg-amber-500 shadow-[0_0_8px_#f59e0b]", textOn: "text-amber-900" },
  washing: { phase: "COLLECTION", bgOn: "bg-amber-50 border-amber-200", dotOn: "bg-amber-500 shadow-[0_0_8px_#f59e0b]", textOn: "text-amber-900" },
  rain: { phase: "COLLECTION", bgOn: "bg-amber-50 border-amber-200", dotOn: "bg-amber-500 shadow-[0_0_8px_#f59e0b]", textOn: "text-amber-900" },
  collection: { phase: "COLLECTION", bgOn: "bg-amber-50 border-amber-200", dotOn: "bg-amber-500 shadow-[0_0_8px_#f59e0b]", textOn: "text-amber-900" },
  filter1: { phase: "RECYCLING", bgOn: "bg-cyan-50 border-cyan-200", dotOn: "bg-cyan-500 shadow-[0_0_8px_#06b6d4]", textOn: "text-cyan-900" },
  filter2: { phase: "RECYCLING", bgOn: "bg-cyan-50 border-cyan-200", dotOn: "bg-cyan-500 shadow-[0_0_8px_#06b6d4]", textOn: "text-cyan-900" },
  filter3: { phase: "RECYCLING", bgOn: "bg-cyan-50 border-cyan-200", dotOn: "bg-cyan-500 shadow-[0_0_8px_#06b6d4]", textOn: "text-cyan-900" },
  pump: { phase: "RECYCLING", bgOn: "bg-cyan-50 border-cyan-200", dotOn: "bg-cyan-500 shadow-[0_0_8px_#06b6d4]", textOn: "text-cyan-900" },
  recycled: { phase: "RECYCLING", bgOn: "bg-sky-50 border-sky-300 ring-1 ring-sky-300", dotOn: "bg-sky-500 shadow-[0_0_10px_#0284c7]", textOn: "text-sky-950 font-semibold" },
  reuse: { phase: "DISTRIBUTION", bgOn: "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300", dotOn: "bg-emerald-500 shadow-[0_0_10px_#10b981]", textOn: "text-emerald-950 font-semibold" },
};

export default function HardwareLeds({ liveMode, connected, leds }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Hardware LED Indicators</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {connected
              ? "Synced with ESP32 microcontroller pins via Firebase Realtime Database."
              : liveMode
              ? "Connecting to ESP32 hardware via Firebase..."
              : "Live LED states mapped directly to the hardware schematic and ESP32 pins."}
          </p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
          connected
            ? "bg-blue-50 text-blue-700 border-blue-200"
            : liveMode
            ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
            : "bg-green-50 text-green-700 border-green-200"
        }`}>
          {connected ? "ESP32 Synced" : liveMode ? "Connecting ESP32…" : "Hardware Active"}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {LED_LABELS.map(({ key, label }) => {
          const on = !!leds?.[key];
          const cfg = LED_PHASE_CONFIG[key] || { bgOn: "bg-green-50 border-green-200", dotOn: "bg-green-500", textOn: "text-green-800" };
          return (
            <div key={key} className={`rounded-xl border px-3 py-2.5 transition-all ${on ? cfg.bgOn : "bg-gray-50 border-gray-100"}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${on ? cfg.dotOn : "bg-gray-300"}`} />
                <span className={`text-xs ${on ? cfg.textOn : "text-gray-500 font-medium"}`}>{label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
