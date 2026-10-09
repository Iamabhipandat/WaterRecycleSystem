import { Cpu, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { isFirebaseReady } from "../services/firebase";

export default function ModeToggle({ liveMode, connected, error, onToggle }) {
  if (!isFirebaseReady && !liveMode) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700">
        <Cpu size={13} />
        Demo Mode
        <span className="text-amber-400 ml-1">·</span>
        <span className="text-amber-500 text-[10px]">Add Firebase config to enable live</span>
      </div>
    );
  }

  return (
    <button
      onClick={onToggle}
      title={liveMode ? "Switch to Demo Mode" : "Switch to Live Hardware Mode"}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
        liveMode
          ? connected
            ? "bg-blue-600 text-white border-blue-700 shadow-md"
            : error
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-blue-50 text-blue-700 border-blue-200 animate-pulse"
          : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
      }`}
    >
      {liveMode ? (
        connected
          ? <Wifi size={13} />
          : error
            ? <AlertCircle size={13} />
            : <WifiOff size={13} />
      ) : (
        <Cpu size={13} />
      )}
      {liveMode
        ? connected
          ? "Live · Hardware"
          : error
            ? "Connection Error"
            : "Connecting…"
        : "Demo Mode"
      }
    </button>
  );
}
