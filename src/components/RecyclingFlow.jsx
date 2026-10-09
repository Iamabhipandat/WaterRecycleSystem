import { Droplets, Filter, Zap, Container } from "lucide-react";

function FlowNode({ icon: Icon, label, sublabel, active, color = "blue" }) {
  const ringColor = color === "green" ? "ring-green-300 bg-green-50 border-green-200" : "ring-blue-300 bg-blue-50 border-blue-200";
  const iconColor = color === "green" ? "text-green-600" : "text-blue-600";
  return (
    <div className={`flex flex-col items-center gap-2 min-w-[80px]`}>
      <div className={`relative w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all duration-500 ${active ? ringColor + " ring-2" : "bg-gray-50 border-gray-200"}`}>
        <Icon size={22} className={active ? iconColor : "text-gray-400"} />
        {active && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white animate-pulse"></span>
        )}
      </div>
      <div className="text-center">
        <p className={`text-xs font-semibold ${active ? "text-gray-800" : "text-gray-400"}`}>{label}</p>
        <p className="text-[10px] text-gray-400">{sublabel}</p>
      </div>
    </div>
  );
}

function FlowArrow({ active, vertical = false }) {
  return (
    <div className={`flex items-center justify-center ${vertical ? "flex-col" : ""}`}>
      <svg width={vertical ? 24 : 60} height={vertical ? 40 : 24} viewBox={vertical ? "0 0 24 40" : "0 0 60 24"}>
        {vertical ? (
          <>
            <line x1="12" y1="2" x2="12" y2="32" stroke={active ? "#42A5F5" : "#D1D5DB"} strokeWidth="2" strokeDasharray="6 4" className={active ? "animate-flow-down" : ""} />
            <polygon points="7,30 12,38 17,30" fill={active ? "#42A5F5" : "#D1D5DB"} />
          </>
        ) : (
          <>
            <line x1="2" y1="12" x2="50" y2="12" stroke={active ? "#42A5F5" : "#D1D5DB"} strokeWidth="2" strokeDasharray="8 5" className={active ? "animate-flow-right" : ""} />
            <polygon points="48,7 58,12 48,17" fill={active ? "#42A5F5" : "#D1D5DB"} />
          </>
        )}
      </svg>
    </div>
  );
}

export default function RecyclingFlow({ pumpRunning, collectionLiters }) {
  const hasWater = collectionLiters > 0;
  const active = pumpRunning && hasWater;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Water Recycling Process</h2>
          <p className="text-xs text-gray-400 mt-0.5">Greywater treatment pipeline</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${active ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></span>
          {active ? "Pump Running" : "Pump Idle"}
        </div>
      </div>

      {/* Flow diagram — horizontal on desktop */}
      <div className="flex flex-wrap items-center justify-center gap-1 md:gap-0">
        {/* Source */}
        <FlowNode icon={Droplets} label="Greywater" sublabel="Source" active={active} color="blue" />
        <FlowArrow active={active} />

        {/* Collection tank with liter display */}
        <div className="flex flex-col items-center gap-2 min-w-[80px]">
          <div className={`relative w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-500 ${active ? "ring-2 ring-blue-300 bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}>
            <Container size={18} className={active ? "text-blue-600" : "text-gray-400"} />
            <span className={`text-[10px] font-bold mt-0.5 ${active ? "text-blue-700" : "text-gray-400"}`}>{collectionLiters}L</span>
            {active && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white animate-pulse"></span>
            )}
          </div>
          <div className="text-center">
            <p className={`text-xs font-semibold ${active ? "text-gray-800" : "text-gray-400"}`}>Collection</p>
            <p className="text-[10px] text-gray-400">Tank</p>
          </div>
        </div>
        <FlowArrow active={active} />

        {/* Filtration */}
        <FlowNode icon={Filter} label="Filtration" sublabel="Active" active={active} color="blue" />
        <FlowArrow active={active} />

        {/* Pump */}
        <FlowNode icon={Zap} label="Pump" sublabel={active ? "Running" : "Standby"} active={active} color="green" />
        <FlowArrow active={active} />

        {/* Recycled Tank */}
        <FlowNode icon={Droplets} label="Recycled" sublabel="Tank" active={active} color="green" />
      </div>

      {/* Droplet animation bar */}
      {active && (
        <div className="mt-4 flex items-center justify-center gap-3">
          {[0, 1, 2, 3, 4].map(i => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-droplet" style={{ animationDelay: `${i * 0.28}s` }}></span>
          ))}
          <span className="text-[11px] text-blue-500 font-medium ml-1">Transferring water…</span>
          {[0, 1, 2].map(i => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-green-400 animate-droplet" style={{ animationDelay: `${0.6 + i * 0.28}s` }}></span>
          ))}
        </div>
      )}
    </div>
  );
}
