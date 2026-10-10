import React from "react";
import { getActivePhase, PHASE_COLORS } from "../utils/hardware";

const PIPE = {
  roToMerge:       "M 140 60 H 185 V 200",
  washingToMerge:  "M 140 320 H 185 V 200",
  rainToMerge:     "M 140 190 H 185 V 200",
  mergeToCol:      "M 185 200 H 255 V 105",
  colToFilter:     "M 300 200 H 340",
  f1:              "M 344 197 H 411",
  f2:              "M 415 197 H 483",
  f3:              "M 487 197 H 557",
  filterToPump:    "M 560 200 H 593",
  pumpToRecycled:  "M 699 200 H 765 V 105",
  recToJunction:   "M 810 200 H 855",
  jToToilet:       "M 855 200 V 91 H 905",
  jToGarden:       "M 855 200 H 905",
  jToCleaning:     "M 855 200 V 362 H 905",
};

function FlowDots({ path, active, color = "#2563EB", n = 4, dur = 1.8, r = 4 }) {
  if (!active) return null;
  return Array.from({ length: n }, (_, i) => (
    <circle key={i} r={r} fill={color} opacity={0.9}>
      <animateMotion dur={`${dur}s`} begin={`${(i * dur) / n}s`} repeatCount="indefinite" path={path} />
    </circle>
  ));
}

function TankDrips({ cx, startY = 95, endY = 240, active, color = "#2563EB", count = 3 }) {
  if (!active) return null;
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <path
          key={i}
          d="M 0 0 C -2.5 -4, -3.5 -8, 0 -12 C 3.5 -8, 2.5 -4, 0 0 Z"
          fill={color}
          opacity="0.9"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            from={`${cx} ${startY}`}
            to={`${cx} ${endY}`}
            dur="1.2s"
            begin={`${i * 0.4}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="1;1;0.1"
            keyTimes="0;0.8;1"
            dur="1.2s"
            begin={`${i * 0.4}s`}
            repeatCount="indefinite"
          />
        </path>
      ))}
    </g>
  );
}

function PipePath({ d, active }) {
  return (
    <g>
      {/* Transparent outer glass pipe border */}
      <path
        d={d}
        fill="none"
        stroke={active ? "rgba(147, 197, 253, 0.55)" : "rgba(229, 231, 235, 0.4)"}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: "stroke 0.5s, stroke-width 0.3s" }}
      />
      {/* Transparent inner hollow pipe channel */}
      <path
        d={d}
        fill="none"
        stroke={active ? "rgba(239, 246, 255, 0.3)" : "rgba(249, 250, 251, 0.15)"}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: "stroke 0.5s" }}
      />
    </g>
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
  onInspectTank,
}) {
  const mergeActive = roActive || washingActive || rainActive;
  const fActive     = filtrationStage > 0;
  const collPct     = Math.min(100, (collectionLiters / collectionCapacity) * 100);

  const currentPhaseKey = getActivePhase({ roActive, washingActive, rainActive, pumpRunning, filtrationStage, reuseActive });
  const activePhase = PHASE_COLORS[currentPhaseKey];

  return (
    <div id="flow" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 overflow-x-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 min-w-[900px]">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Live Hardware Schematic</p>
          <h2 className="text-xl font-bold text-gray-900 mt-0.5">Wastewater → Collection → Treatment → Recycled Reuse</h2>
        </div>
        
        {/* Dynamic Phase Indicator Badges: Amber (Collection), Cyan (Recycling), Emerald (Distribution) */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
            currentPhaseKey === "COLLECTION" ? "bg-amber-50 border-amber-300 text-amber-800 shadow-xs"
            : currentPhaseKey === "RECYCLING" ? "bg-cyan-50 border-cyan-300 text-cyan-800 shadow-xs"
            : currentPhaseKey === "DISTRIBUTION" ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs"
            : "bg-gray-50 border-gray-200 text-gray-600"
          }`}>
            <span
              className={`w-2.5 h-2.5 rounded-full ${activePhase.pulse}`}
              style={{ backgroundColor: activePhase.primary }}
            />
            <span>{activePhase.name}</span>
          </div>
        </div>
      </div>

      <svg viewBox="0 0 1060 460" xmlns="http://www.w3.org/2000/svg" className="w-full min-w-[900px]">
        <rect width="1060" height="460" fill="#F8FAFB" rx="14" />

        {/* Column headers */}
        {[
          { x: 65,  label: "SOURCES (COLLECTION)"    },
          { x: 255, label: "COLLECTION TANK" },
          { x: 450, label: "TREATMENT (RECYCLING)"  },
          { x: 647, label: "PUMP"       },
          { x: 765, label: "RECYCLED TANK"   },
          { x: 972, label: "REUSE (DISTRIBUTION)"      },
        ].map(({ x, label }) => (
          <text key={label} x={x} y={16} textAnchor="middle" fontSize="8" fontWeight="700" fill="#94A3B8" letterSpacing="1.8" fontFamily="Inter,sans-serif">{label}</text>
        ))}

        {/* Vertical separators */}
        {[160, 320, 598, 702, 878].map(sx => (
          <line key={sx} x1={sx} y1={22} x2={sx} y2={450} stroke="#F1F5F9" strokeWidth="1" />
        ))}

        {/* ── TRANSPARENT PIPES ── */}
        <PipePath d={PIPE.roToMerge}       active={roActive}      />
        <PipePath d={PIPE.washingToMerge}  active={washingActive} />
        <PipePath d={PIPE.rainToMerge}     active={rainActive}    />
        <PipePath d={PIPE.mergeToCol}      active={mergeActive}   />
        <PipePath d={PIPE.colToFilter}     active={fActive}       />
        <PipePath d={PIPE.f1}              active={filtrationStage>0} />
        <PipePath d={PIPE.f2}              active={filtrationStage>1} />
        <PipePath d={PIPE.f3}              active={filtrationStage>2} />
        <PipePath d={PIPE.filterToPump}    active={pumpRunning}   />
        <PipePath d={PIPE.pumpToRecycled}  active={pumpRunning}   />
        <PipePath d={PIPE.recToJunction}   active={reuseActive}   />
        <PipePath d={PIPE.jToToilet}       active={reuseActive}   />
        <PipePath d={PIPE.jToGarden}       active={reuseActive}   />
        <PipePath d={PIPE.jToCleaning}     active={reuseActive}   />

        {/* ── ANIMATED DROPLETS WITH DISTINCT PHASE COLORS ── */}
        {/* ── ANIMATED WATER BLUE DROPLETS ── */}
        {/* Inflow Collection Droplets (Water Blue #2563EB / #3B82F6) */}
        <FlowDots path={PIPE.roToMerge}      active={roActive}          color="#2563EB" dur={2.0} n={4} />
        <FlowDots path={PIPE.washingToMerge} active={washingActive}     color="#3B82F6" dur={2.2} n={4} />
        <FlowDots path={PIPE.rainToMerge}    active={rainActive}        color="#60A5FA" dur={2.8} n={3} r={3} />
        <FlowDots path={PIPE.mergeToCol}     active={mergeActive}       color="#2563EB" dur={1.1} n={3} r={3.5} />

        {/* Treatment & Pump Droplets (Cyan / Blue #0284C7) */}
        <FlowDots path={PIPE.colToFilter}    active={fActive}           color="#0284C7" dur={1.1} n={2} />
        <FlowDots path={PIPE.f1}             active={filtrationStage>0} color="#0284C7" dur={0.8} n={2} r={3.5} />
        <FlowDots path={PIPE.f2}             active={filtrationStage>1} color="#0284C7" dur={0.8} n={2} r={3.5} />
        <FlowDots path={PIPE.f3}             active={filtrationStage>2} color="#0284C7" dur={0.8} n={2} r={3.5} />
        <FlowDots path={PIPE.filterToPump}   active={pumpRunning}       color="#2563EB" dur={1}   n={2} />
        <FlowDots path={PIPE.pumpToRecycled} active={pumpRunning}       color="#2563EB" dur={1.1} n={3} r={3.5} />

        {/* Reuse Distribution Droplets (Emerald Blue/Green #10B981) */}
        <FlowDots path={PIPE.recToJunction}  active={reuseActive}       color="#10B981" dur={1.5} n={2} />
        <FlowDots path={PIPE.jToToilet}      active={reuseActive}       color="#10B981" dur={2.2} n={2} />
        <FlowDots path={PIPE.jToGarden}      active={reuseActive}       color="#10B981" dur={1.8} n={2} />
        <FlowDots path={PIPE.jToCleaning}    active={reuseActive}       color="#10B981" dur={2.6} n={2} />

        {/* ── DROP-BY-DROP WATER ANIMATION INTO TANKS ── */}
        <TankDrips cx={255} startY={105} endY={270} active={mergeActive} color="#2563EB" count={3} />
        <TankDrips cx={765} startY={105} endY={275} active={pumpRunning} color="#0284C7" count={3} />

        {/* ── SOURCES ── */}
        <SourceBox x={10}  y={20}  emoji="🚰" label="RO Wastewater"   liters={roLiters}      active={roActive} />
        <SourceBox x={10}  y={272} emoji="🫧" label="Washing Machine" liters={washingLiters} active={washingActive} />
        <RainBox   x={10}  y={160} active={rainActive} />

        {/* Merge junction */}
        <circle cx={185} cy={200} r={8} fill={mergeActive ? "#2563EB" : "#E5E7EB"} style={{ transition: "fill 0.5s" }} />

        {/* ── COLLECTION TANK ── */}
        <Tank id="col" x={210} y={80} w={90} h={240}
          pct={collPct} fillColor="#2563EB" bg="#EFF6FF" border="#93C5FD"
          label="Collection" sub="Tank"
        />
        <text x={255} y={332} textAnchor="middle" fontSize="9" fill="#6B7280" fontFamily="Inter,sans-serif">
          {Math.round(collectionLiters * 10) / 10} / {collectionCapacity} L
        </text>
        {mergeActive && (
          <text x={255} y={344} textAnchor="middle" fontSize="8" fill="#3B82F6" fontWeight="600" fontFamily="Inter,sans-serif">Collecting…</text>
        )}

        {/* Collection Tank AWS Storage Pill */}
        <g
          className="cursor-pointer"
          onClick={() => onInspectTank && onInspectTank("collection")}
        >
          <rect
            x={184}
            y={356}
            width={142}
            height={22}
            rx={11}
            fill="#EFF6FF"
            stroke="#93C5FD"
            strokeWidth="1.2"
          />
          <circle cx={196} cy={367} r={4} fill="#2563EB" />
          <text
            x={208}
            y={370.5}
            fontSize="7.5"
            fontWeight="700"
            fill="#1E40AF"
            fontFamily="Inter,sans-serif"
          >
            AWS: DynamoDB • Search
          </text>
        </g>

        {/* ── FILTRATION ── */}
        <FilterBox x={340} y={145} stage={filtrationStage} />

        {/* ── PUMP ── */}
        <PumpSVG cx={647} cy={200} active={pumpRunning} />

        {/* ── RECYCLED TANK & HARDWARE LED 1 (RECYCLE STORING) ── */}
        <g>
          {/* Hardware LED 1: Recycled Storing Indicator Badge */}
          <rect
            x={695}
            y={26}
            width={140}
            height={22}
            rx={11}
            fill={recycledPct > 0 || pumpRunning ? "#F0F9FF" : "#F9FAFB"}
            stroke={recycledPct > 0 || pumpRunning ? "#38BDF8" : "#E5E7EB"}
            strokeWidth="1.2"
          />
          <circle cx={708} cy={37} r={4.5} fill={recycledPct > 0 || pumpRunning ? "#0284C7" : "#9CA3AF"} />
          {(recycledPct > 0 || pumpRunning) && (
            <circle cx={708} cy={37} r={7} fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.7">
              <animate attributeName="r" values="4.5;8;4.5" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="1.8s" repeatCount="indefinite" />
            </circle>
          )}
          <text
            x={720}
            y={40.5}
            fontSize="7.5"
            fontWeight="700"
            fill={recycledPct > 0 || pumpRunning ? "#0369A1" : "#6B7280"}
            fontFamily="Inter,sans-serif"
          >
            LED 1: RECYCLE STORING
          </text>

          {/* Clean Non-Overlapping Tank Titles */}
          <text x={765} y={63} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#374151" fontFamily="Inter,sans-serif">
            Recycled Tank
          </text>
          <text x={765} y={74} textAnchor="middle" fontSize="8" fontWeight="500" fill="#9CA3AF" fontFamily="Inter,sans-serif">
            Storage Unit
          </text>
        </g>

        <Tank
          id="rec"
          x={720}
          y={80}
          w={90}
          h={240}
          pct={recycledPct}
          fillColor="#34D399"
          bg="#F0FDF4"
          border="#86EFAC"
        />
        <text x={765} y={332} textAnchor="middle" fontSize="9" fill="#6B7280" fontFamily="Inter,sans-serif">
          {Math.round(recycledLiters)} / {recycledCapacity} L
        </text>
        <rect x={700} y={344} width={130} height={22} rx="6" fill="#FEF3C7" stroke="#FCD34D" strokeWidth="1.5" />
        <text x={765} y={359} textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#D97706" fontFamily="Inter,sans-serif">
          NON-POTABLE WATER
        </text>

        {/* Recycled Tank AWS Storage Pill */}
        <g
          className="cursor-pointer"
          onClick={() => onInspectTank && onInspectTank("recycled")}
        >
          <rect
            x={694}
            y={372}
            width={142}
            height={22}
            rx={11}
            fill="#ECFDF5"
            stroke="#6EE7B7"
            strokeWidth="1.2"
          />
          <circle cx={706} cy={383} r={4} fill="#059669" />
          <text
            x={718}
            y={386.5}
            fontSize="7.5"
            fontWeight="700"
            fill="#065F46"
            fontFamily="Inter,sans-serif"
          >
            ⚡ AWS: DynamoDB &amp; S3
          </text>
        </g>

        {/* Reuse junction */}
        <circle cx={855} cy={200} r={8} fill={reuseActive ? "#34D399" : "#E5E7EB"} style={{ transition: "fill 0.5s" }} />

        {/* ── HARDWARE LED 2 (REUSED DISTRIBUTION) & REUSE BOXES ── */}
        <g>
          {/* Hardware LED 2: Reused Distribution Indicator Badge */}
          <rect
            x={895}
            y={26}
            width={145}
            height={22}
            rx={11}
            fill={reuseActive ? "#ECFDF5" : "#F9FAFB"}
            stroke={reuseActive ? "#34D399" : "#E5E7EB"}
            strokeWidth="1.2"
          />
          <circle cx={908} cy={37} r={4.5} fill={reuseActive ? "#10B981" : "#9CA3AF"} />
          {reuseActive && (
            <circle cx={908} cy={37} r={7} fill="none" stroke="#34D399" strokeWidth="1.5" opacity="0.7">
              <animate attributeName="r" values="4.5;8;4.5" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="1.8s" repeatCount="indefinite" />
            </circle>
          )}
          <text
            x={920}
            y={40.5}
            fontSize="7.5"
            fontWeight="700"
            fill={reuseActive ? "#065F46" : "#6B7280"}
            fontFamily="Inter,sans-serif"
          >
            LED 2: REUSED OUTLET
          </text>
        </g>

        <ReuseBox x={905} y={56}  emoji="🚽" label="Toilet Flushing" active={reuseActive} />
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
