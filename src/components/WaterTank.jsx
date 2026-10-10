export default function WaterTank({ label, percent, capacity, maxCapacity, status, color = "blue" }) {
  const clampedPct = Math.min(100, Math.max(0, percent));
  const colorMap = {
    blue:  { water: "#64B5F6", wave: "#42A5F5", border: "#BBDEFB", text: "#1565C0", bg: "#E3F2FD" },
    green: { water: "#81C784", wave: "#66BB6A", border: "#C8E6C9", text: "#2E7D32", bg: "#E8F5E9" },
    teal:  { water: "#4DD0E1", wave: "#26C6DA", border: "#B2EBF2", text: "#00695C", bg: "#E0F7FA" },
  };
  const c = colorMap[color] || colorMap.blue;

  const statusStyles = {
    Normal:    "bg-green-50 text-green-700 border-green-200",
    Available: "bg-blue-50 text-blue-700 border-blue-200",
    Good:      "bg-teal-50 text-teal-700 border-teal-200",
    Low:       "bg-yellow-50 text-yellow-700 border-yellow-200",
    Full:      "bg-orange-50 text-orange-700 border-orange-200",
    Warning:   "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col items-center gap-3">
      <p className="text-sm font-semibold text-gray-700">{label}</p>

      {/* SVG Tank */}
      <div className="relative w-24 h-48">
        <svg viewBox="0 0 96 192" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Tank body */}
          <rect x="4" y="4" width="88" height="184" rx="8" fill={c.bg} stroke={c.border} strokeWidth="2.5" />

          {/* Clip for water level */}
          <defs>
            <clipPath id={`clip-${label.replace(/\s/g,"-")}`}>
              <rect x="4" y="4" width="88" height="184" rx="8" />
            </clipPath>
          </defs>

          {/* Water fill */}
          <g clipPath={`url(#clip-${label.replace(/\s/g,"-")})`}>
            <rect
              x="4"
              y={4 + (184 * (1 - clampedPct / 100))}
              width="88"
              height={184 * (clampedPct / 100)}
              fill={c.water}
              opacity="0.85"
              style={{ transition: "y 0.8s cubic-bezier(0.4,0,0.2,1), height 0.8s cubic-bezier(0.4,0,0.2,1)" }}
            />
            {/* Wave top */}
            <g style={{ transition: "transform 0.8s cubic-bezier(0.4,0,0.2,1)", transform: `translateY(${4 + 184 * (1 - clampedPct / 100) - 6}px)` }}>
              <path d="M4 6 Q28 0 52 6 Q76 12 92 6 L92 12 Q68 18 44 12 Q20 6 4 12 Z" fill={c.wave} opacity="0.6" className="animate-wave" style={{ animationDuration: "3s" }} />
            </g>
          </g>

          {/* Percentage text */}
          <text x="48" y="100" textAnchor="middle" dominantBaseline="middle" fill={clampedPct > 50 ? "white" : c.text} fontSize="20" fontWeight="700" fontFamily="Inter,sans-serif">
            {clampedPct}%
          </text>

          {/* Level lines */}
          {[25, 50, 75].map(lvl => (
            <line key={lvl} x1="6" y1={4 + 184 * (1 - lvl / 100)} x2="16" y2={4 + 184 * (1 - lvl / 100)} stroke={c.border} strokeWidth="1.5" />
          ))}
        </svg>
      </div>

      {/* Capacity */}
      <div className="text-center">
        <p className="text-lg font-bold text-gray-900">{capacity} <span className="text-sm font-medium text-gray-400">/ {maxCapacity} L</span></p>
        <div className="flex flex-col items-center gap-1 mt-1">
          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded border ${statusStyles[status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
            {status}
          </span>
          <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
            ⚡ AWS: DynamoDB &bull; OpenSearch
          </span>
        </div>
      </div>
    </div>
  );
}
