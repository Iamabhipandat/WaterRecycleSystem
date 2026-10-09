import React from "react";

const PIPE = {
  roToMerge:       "M 140 60 H 185 V 200",
  washingToMerge:  "M 140 320 H 185 V 200",
  rainToMerge:     "M 140 190 H 185 V 200",
  mergeToCol:      "M 185 200 H 210",
  colToFilter:     "M 300 200 H 340",
  f1:              "M 344 197 H 411",
  f2:              "M 415 197 H 483",
  f3:              "M 487 197 H 557",
  filterToPump:    "M 560 200 H 593",
  pumpToRecycled:  "M 699 200 H 720",
  recToJunction:   "M 810 200 H 855",
  jToToilet:       "M 855 200 V 82 H 905",
  jToGarden:       "M 855 200 H 905",
  jToCleaning:     "M 855 200 V 362 H 905",
};

function FlowDots({ path, active, color = "#60A5FA", n = 3, dur = 2, r = 4 }) {
  if (!active) return null;
  return Array.from({ length: n }, (_, i) => (
    <circle key={i} r={r} fill={color} opacity={0.88}>
      <animateMotion dur={`${dur}s`} begin={`${(i * dur) / n}s`} repeatCount="indefinite" path={path} />
    </circle>
  ));
}

function PipePath({ d, active, color = "#93C5FD" }) {
  return (
    <path d={d} fill="none"
      stroke={active ? color : "#E5E7EB"}
      strokeWidth={active ? 8 : 6}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: "stroke 0.5s, stroke-width 0.3s" }}
    />
  );
}

function Tank({ id, x, y, w, h, pct, fillColor = "#60A5FA", bg = "#EFF6FF", border = "#93C5FD", label, sub }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);
  const clamped = Math.min(100, Math.max(0, pct));
  const innerH  = h - 8;
  return (
    <g>
      <defs>
        <clipPath id={`cp-${id}`}>
          <rect x={x + 4} y={y + 4} width={w - 8} height={innerH} rx="7" />
        </clipPath>
      </defs>
      <rect x={x} y={y} width={w} height={h} rx="10" fill={bg} stroke={border} strokeWidth="2.5" />
      <rect x={x + 4} y={y + 4} width={w - 8} height={innerH}
        fill={fillColor} opacity="0.82" clipPath={`url(#cp-${id})`}
        style={{
          transformOrigin: `${x + 4}px ${y + 4 + innerH}px`,
          transform: `scaleY(${clamped / 100})`,
          transition: mounted ? "transform 0.9s cubic-bezier(0.4,0,0.2,1)" : "none",
        }}
      />
      {[25, 50, 75].map(t => (
        <line key={t} x1={x + 4} y1={y + 4 + innerH * (1 - t / 100)} x2={x + 18} y2={y + 4 + innerH * (1 - t / 100)}
          stroke={clamped > t ? "rgba(255,255,255,0.45)" : border} strokeWidth="1.5" />
      ))}
      <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="middle"
        fill={clamped > 45 ? "white" : "#1E40AF"} fontSize="15" fontWeight="700" fontFamily="Inter,sans-serif">
        {Math.round(clamped)}%
      </text>
      {label && <text x={x + w / 2} y={y - 14} textAnchor="middle" fontSize="10" fontWeight="700" fill="#374151" fontFamily="Inter,sans-serif">{label}</text>}
      {sub && <text x={x + w / 2} y={y - 4} textAnchor="middle" fontSize="8" fill="#9CA3AF" fontFamily="Inter,sans-serif">{sub}</text>}
    </g>
  );
}

function SourceBox({ x, y, emoji, label, liters, active }) {
  return (
    <g>
      <rect x={x} y={y} width={130} height={82} rx="10"
        fill={active ? "#EFF6FF" : "#F9FAFB"}
        stroke={active ? "#60A5FA" : "#E5E7EB"} strokeWidth="2"
        style={{ transition: "fill 0.5s, stroke 0.5s" }}
      />
      {active && <rect x={x - 3} y={y - 3} width={136} height={88} rx="13" fill="none" stroke="#93C5FD" strokeWidth="1.5" opacity="0.5" />}
      <text x={x + 65} y={y + 30} textAnchor="middle" fontSize="22"
        fontFamily="Segoe UI Emoji,Apple Color Emoji,Noto Color Emoji,sans-serif">{emoji}</text>
      <text x={x + 65} y={y + 52} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#374151" fontFamily="Inter,sans-serif">{label}</text>
      <text x={x + 65} y={y + 67} textAnchor="middle" fontSize="9" fontWeight="700"
        fill={active ? "#3B82F6" : "#9CA3AF"} fontFamily="Inter,sans-serif">{liters} L</text>
    </g>
  );
}

function RainBox({ x, y, active }) {
  return (
    <g>
      <rect x={x} y={y} width={130} height={62} rx="10"
        fill={active ? "#EFF6FF" : "#F9FAFB"}
        stroke={active ? "#60A5FA" : "#E5E7EB"} strokeWidth="2"
        style={{ transition: "all 0.5s" }}
      />
      <text x={x + 65} y={y + 24} textAnchor="middle" fontSize="18"
        fontFamily="Segoe UI Emoji,Apple Color Emoji,Noto Color Emoji,sans-serif">🌧️</text>
      <text x={x + 65} y={y + 44} textAnchor="middle" fontSize="9.5" fontWeight="600"
        fill={active ? "#3B82F6" : "#9CA3AF"} fontFamily="Inter,sans-serif">Rainwater</text>
    </g>
  );
}

function FilterBox({ x, y, stage }) {
  const STAGES = [
    { emoji: "🔍", label: "Pre-Filter",  sub: "Particles" },
    { emoji: "💧", label: "Sediment",    sub: "Suspended" },
    { emoji: "⚗️",  label: "Treatment",  sub: "Carbon"    },
  ];
  const W = 220, H = 110, sw = Math.floor(W / 3);
  return (
    <g>
      <rect x={x} y={y} width={W} height={H} rx="10" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="2" />
      <text x={x + W / 2} y={y - 8} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#16A34A" letterSpacing="1.5" fontFamily="Inter,sans-serif">FILTRATION UNIT</text>
      {STAGES.map((s, i) => {
        const isActive = stage > i;
        const sx = x + i * sw;
        return (
          <g key={i}>
            {i > 0 && <line x1={sx} y1={y + 6} x2={sx} y2={y + H - 6} stroke="#D1FAE5" strokeWidth="1" strokeDasharray="5 4" />}
            <rect x={sx + 2} y={y + 2} width={sw - 4} height={H - 4} rx="7" fill={isActive ? "#DCFCE7" : "transparent"} style={{ transition: "fill 0.5s" }} />
            <text x={sx + sw / 2} y={y + 35} textAnchor="middle" fontSize="16"
              fontFamily="Segoe UI Emoji,Apple Color Emoji,Noto Color Emoji,sans-serif">{s.emoji}</text>
            <text x={sx + sw / 2} y={y + 58} textAnchor="middle" fontSize="9" fontWeight="700"
              fill={isActive ? "#15803D" : "#9CA3AF"} fontFamily="Inter,sans-serif" style={{ transition: "fill 0.5s" }}>{s.label}</text>
            <text x={sx + sw / 2} y={y + 70} textAnchor="middle" fontSize="7.5"
              fill={isActive ? "#4ADE80" : "#D1D5DB"} fontFamily="Inter,sans-serif">{s.sub}</text>
            {isActive && <circle cx={sx + sw - 8} cy={y + 10} r="4" fill="#22C55E" opacity="0.9" />}
          </g>
        );
      })}
    </g>
  );
}

function PumpSVG({ cx, cy, active }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={52}
        fill={active ? "#EFF6FF" : "#F9FAFB"}
        stroke={active ? "#60A5FA" : "#E5E7EB"} strokeWidth="2.5"
        style={{ transition: "all 0.5s" }}
      />
      <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: active ? "spin 1.3s linear infinite" : "none" }}>
        {[0, 45, 90, 135].map(deg => (
          <ellipse key={deg} cx={cx} cy={cy} rx="26" ry="10"
            fill={active ? "#BFDBFE" : "#E5E7EB"} opacity="0.9"
            transform={`rotate(${deg}, ${cx}, ${cy})`}
            style={{ transition: "fill 0.5s" }}
          />
        ))}
      </g>
      <circle cx={cx} cy={cy} r={13} fill={active ? "#2563EB" : "#CBD5E1"} style={{ transition: "fill 0.5s" }} />
      <text x={cx} y={cy + 70} textAnchor="middle" fontSize="10" fontWeight="700"
        fill={active ? "#1D4ED8" : "#9CA3AF"} fontFamily="Inter,sans-serif">PUMP</text>
      <text x={cx} y={cy + 82} textAnchor="middle" fontSize="8"
        fill={active ? "#60A5FA" : "#D1D5DB"} fontFamily="Inter,sans-serif">
        {active ? "RUNNING" : "STANDBY"}
      </text>
    </g>
  );
}

function ReuseBox({ x, y, emoji, label, active }) {
  return (
    <g>
      <rect x={x} y={y} width={130} height={70} rx="10"
        fill={active ? "#F0FDF4" : "#F9FAFB"}
        stroke={active ? "#86EFAC" : "#E5E7EB"} strokeWidth="2"
        style={{ transition: "all 0.5s" }}
      />
      <text x={x + 65} y={y + 27} textAnchor="middle" fontSize="18"
        fontFamily="Segoe UI Emoji,Apple Color Emoji,Noto Color Emoji,sans-serif">{emoji}</text>
      <text x={x + 65} y={y + 48} textAnchor="middle" fontSize="9.5" fontWeight="600"
        fill={active ? "#16A34A" : "#9CA3AF"} fontFamily="Inter,sans-serif"
        style={{ transition: "fill 0.5s" }}>{label}</text>
    </g>
  );
}

export default function WaterFlowSystem({
  roLiters, washingLiters,
  collectionLiters, collectionCapacity,
  filtrationStage, pumpRunning,
  recycledPct, recycledLiters, recycledCapacity,
  freshWaterSaved,
  roActive, washingActive, rainActive, reuseActive,
}) {
  const mergeActive = roActive || washingActive || rainActive;
  const fActive     = filtrationStage > 0;
  const collPct     = Math.min(100, (collectionLiters / collectionCapacity) * 100);

  return (
    <div id="flow" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 overflow-x-auto">
      <div className="flex items-start justify-between mb-3 min-w-[900px]">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Live Simulation</p>
          <h2 className="text-xl font-bold text-gray-900 mt-0.5">Wastewater → Collection → Treatment → Recycled Reuse</h2>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border mt-1 ${
          pumpRunning ? "bg-blue-50 border-blue-200 text-blue-700"
          : fActive   ? "bg-green-50 border-green-200 text-green-700"
          : mergeActive ? "bg-sky-50 border-sky-200 text-sky-700"
          : "bg-gray-50 border-gray-200 text-gray-500"
        }`}>
          <span className={`w-2 h-2 rounded-full ${mergeActive || pumpRunning || fActive ? "animate-pulse bg-current" : "bg-gray-300"}`} />
          {pumpRunning ? "Pump Running" : fActive ? "Filtration Active" : mergeActive ? "Sources Flowing" : "System Standby"}
        </div>
      </div>

      <svg viewBox="0 0 1060 460" xmlns="http://www.w3.org/2000/svg" className="w-full min-w-[900px]">
        <rect width="1060" height="460" fill="#F8FAFB" rx="14" />

        {/* Column headers */}
        {[
          { x: 65,  label: "SOURCES"    },
          { x: 255, label: "COLLECTION" },
          { x: 450, label: "TREATMENT"  },
          { x: 647, label: "PUMP"       },
          { x: 765, label: "RECYCLED"   },
          { x: 972, label: "REUSE"      },
        ].map(({ x, label }) => (
          <text key={label} x={x} y={16} textAnchor="middle" fontSize="8" fontWeight="700" fill="#CBD5E1" letterSpacing="1.8" fontFamily="Inter,sans-serif">{label}</text>
        ))}

        {/* Vertical separators */}
        {[160, 320, 598, 702, 878].map(sx => (
          <line key={sx} x1={sx} y1={22} x2={sx} y2={450} stroke="#F1F5F9" strokeWidth="1" />
        ))}

        {/* ── PIPES ── */}
        <PipePath d={PIPE.roToMerge}       active={roActive}          />
        <PipePath d={PIPE.washingToMerge}  active={washingActive}     />
        <PipePath d={PIPE.rainToMerge}     active={rainActive}        />
        <PipePath d={PIPE.mergeToCol}      active={mergeActive}       />
        <PipePath d={PIPE.colToFilter}     active={fActive}           />
        <PipePath d={PIPE.f1}              active={filtrationStage>0} color="#6EE7B7" />
        <PipePath d={PIPE.f2}              active={filtrationStage>1} color="#6EE7B7" />
        <PipePath d={PIPE.f3}              active={filtrationStage>2} color="#6EE7B7" />
        <PipePath d={PIPE.filterToPump}    active={pumpRunning}       />
        <PipePath d={PIPE.pumpToRecycled}  active={pumpRunning}       />
        <PipePath d={PIPE.recToJunction}   active={reuseActive}       color="#6EE7B7" />
        <PipePath d={PIPE.jToToilet}       active={reuseActive}       color="#6EE7B7" />
        <PipePath d={PIPE.jToGarden}       active={reuseActive}       color="#6EE7B7" />
        <PipePath d={PIPE.jToCleaning}     active={reuseActive}       color="#6EE7B7" />

        {/* ── ANIMATED DROPLETS ── */}
        <FlowDots path={PIPE.roToMerge}      active={roActive}          color="#60A5FA" dur={2.2} n={4} />
        <FlowDots path={PIPE.washingToMerge} active={washingActive}     color="#60A5FA" dur={2.4} n={4} />
        <FlowDots path={PIPE.rainToMerge}    active={rainActive}        color="#93C5FD" dur={3.0} n={3} r={3} />
        <FlowDots path={PIPE.mergeToCol}     active={mergeActive}       color="#60A5FA" dur={0.9} n={2} r={3} />
        <FlowDots path={PIPE.colToFilter}    active={fActive}           color="#60A5FA" dur={1.1} n={2} />
        <FlowDots path={PIPE.f1}             active={filtrationStage>0} color="#34D399" dur={0.8} n={2} r={3.5} />
        <FlowDots path={PIPE.f2}             active={filtrationStage>1} color="#34D399" dur={0.8} n={2} r={3.5} />
        <FlowDots path={PIPE.f3}             active={filtrationStage>2} color="#34D399" dur={0.8} n={2} r={3.5} />
        <FlowDots path={PIPE.filterToPump}   active={pumpRunning}       color="#60A5FA" dur={1}   n={2} />
        <FlowDots path={PIPE.pumpToRecycled} active={pumpRunning}       color="#34D399" dur={1}   n={2} />
        <FlowDots path={PIPE.recToJunction}  active={reuseActive}       color="#34D399" dur={1.5} n={2} />
        <FlowDots path={PIPE.jToToilet}      active={reuseActive}       color="#34D399" dur={2.2} n={2} />
        <FlowDots path={PIPE.jToGarden}      active={reuseActive}       color="#34D399" dur={1.8} n={2} />
        <FlowDots path={PIPE.jToCleaning}    active={reuseActive}       color="#34D399" dur={2.6} n={2} />

        {/* ── SOURCES ── */}
        <SourceBox x={10}  y={20}  emoji="🚰" label="RO Wastewater"   liters={roLiters}      active={roActive} />
        <SourceBox x={10}  y={272} emoji="🫧" label="Washing Machine" liters={washingLiters} active={washingActive} />
        <RainBox   x={10}  y={160} active={rainActive} />

        {/* Merge junction */}
        <circle cx={185} cy={200} r={8} fill={mergeActive ? "#60A5FA" : "#E5E7EB"} style={{ transition: "fill 0.5s" }} />

        {/* ── COLLECTION TANK ── */}
        <Tank id="col" x={210} y={80} w={90} h={240}
          pct={collPct} fillColor="#60A5FA" bg="#EFF6FF" border="#93C5FD"
          label="Collection" sub="Tank"
        />
        <text x={255} y={332} textAnchor="middle" fontSize="9" fill="#6B7280" fontFamily="Inter,sans-serif">
          {Math.round(collectionLiters * 10) / 10} / {collectionCapacity} L
        </text>
        {mergeActive && (
          <text x={255} y={344} textAnchor="middle" fontSize="8" fill="#3B82F6" fontWeight="600" fontFamily="Inter,sans-serif">Collecting…</text>
        )}

        {/* ── FILTRATION ── */}
        <FilterBox x={340} y={145} stage={filtrationStage} />

        {/* ── PUMP ── */}
        <PumpSVG cx={647} cy={200} active={pumpRunning} />

        {/* ── RECYCLED TANK ── */}
        <Tank id="rec" x={720} y={75} w={90} h={250}
          pct={recycledPct} fillColor="#34D399" bg="#F0FDF4" border="#86EFAC"
          label="Recycled" sub="Tank"
        />
        <text x={765} y={336} textAnchor="middle" fontSize="9" fill="#6B7280" fontFamily="Inter,sans-serif">
          {Math.round(recycledLiters)} / {recycledCapacity} L
        </text>
        <rect x={700} y={344} width={132} height={22} rx="6" fill="#FEF3C7" stroke="#FCD34D" strokeWidth="1.5" />
        <text x={766} y={359} textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#D97706" fontFamily="Inter,sans-serif">NON-POTABLE WATER</text>

        {/* Reuse junction */}
        <circle cx={855} cy={200} r={8} fill={reuseActive ? "#34D399" : "#E5E7EB"} style={{ transition: "fill 0.5s" }} />

        {/* ── REUSE BOXES ── */}
        <ReuseBox x={905} y={47}  emoji="🚽" label="Toilet Flushing" active={reuseActive} />
        <ReuseBox x={905} y={165} emoji="🌱" label="Gardening"       active={reuseActive} />
        <ReuseBox x={905} y={327} emoji="🧹" label="Floor Cleaning"  active={reuseActive} />

        {/* ── FRESH WATER SAVED ── */}
        <rect x={10} y={380} width={200} height={60} rx="10" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="2" />
        <text x={110} y={400} textAnchor="middle" fontSize="8" fontWeight="700" fill="#16A34A" letterSpacing="1" fontFamily="Inter,sans-serif">FRESH WATER SAVED</text>
        <text x={110} y={427} textAnchor="middle" fontSize="28" fontWeight="800" fill="#15803D" fontFamily="Inter,sans-serif">
          {Math.round(freshWaterSaved)} L
        </text>
      </svg>
    </div>
  );
}
