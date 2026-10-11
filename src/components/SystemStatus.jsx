import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

function Row({ label, value, level }) {
  const cfg = {
    ok:      { Icon: CheckCircle2, dot: "bg-green-500",  text: "text-green-700",  bg: "bg-green-50"  },
    warning: { Icon: AlertTriangle, dot: "bg-yellow-500", text: "text-yellow-700", bg: "bg-yellow-50" },
    error:   { Icon: XCircle,       dot: "bg-red-500",    text: "text-red-700",    bg: "bg-red-50"    },
  }[level] || { Icon: CheckCircle2, dot: "bg-gray-400", text: "text-gray-600", bg: "bg-gray-50" };

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${cfg.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        <span className={`text-xs font-semibold ${cfg.text}`}>{value}</span>
      </div>
    </div>
  );
}

function ActivityEntry({ time, msg }) {
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-1 shrink-0 mt-0.5">
        <Clock size={10} className="text-gray-300" />
        <span className="text-[10px] font-mono text-gray-400">{time}</span>
      </div>
      <span className="text-xs text-gray-600 leading-relaxed">{msg}</span>
    </div>
  );
}

export default function SystemStatus({ pumpRunning, filtrationStage, recycledPct, collectionLiters, reuseActive, activity }) {
  const recycledWarning = recycledPct >= 90;
  const collLow = collectionLiters < 10;

  return (
    <div id="status" className="space-y-4">
      {/* System Status */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">System Status</h2>
        <Row label="Collection Tank"  value={collLow ? "Low" : "Active"}                  level={collLow ? "warning" : "ok"} />
        <Row label="Filtration"       value={filtrationStage > 0 ? "Active" : "Ready"}    level={filtrationStage > 0 ? "ok" : "ok"} />
        <Row label="Water Pump"       value={pumpRunning ? "Running" : "Standby"}         level={pumpRunning ? "ok" : "ok"} />
        <Row label="Recycled Tank"    value={recycledWarning ? `${Math.round(recycledPct)}% — Full` : `${Math.round(recycledPct)}%`} level={recycledWarning ? "warning" : "ok"} />
        <Row label="Reuse System"     value={reuseActive ? "Active" : "Idle"}             level={reuseActive ? "ok" : "ok"} />
        <Row label="Water Quality"    value="Good"                                         level="ok" />
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Recent Activity</h2>
        <div className="max-h-52 overflow-y-auto">
          {activity.length === 0 ? (
            <p className="text-xs text-gray-400">No activity yet. Use controls to simulate.</p>
          ) : (
            activity.slice(0, 14).map((e, i) => (
              <ActivityEntry key={i} time={e.time} msg={e.msg} />
            ))
          )}
        </div>
      </div>

      {/* Cedar Policy Safety Guardrails */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <div>
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Safety Policies &amp; Invariants</h2>
            <p className="text-xs text-gray-400 mt-0.5">Formal verification guardrails evaluated via Cedar Policy engine.</p>
          </div>
          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Cedar Verified
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800">Policy 4: High Turbidity Lockout</p>
              <p className="text-[11px] text-gray-500 font-mono">forbid StartRecycling when turbidity &gt; 85 NTU</p>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800">
              ACTIVE
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800">Policy 5: Low Reserve Cavitation Protection</p>
              <p className="text-[11px] text-gray-500 font-mono">forbid UseRecycledWater when recycled &lt; 5 L</p>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800">
              ACTIVE
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800">Policy 1 &amp; 2: Role-Based Action Permits</p>
              <p className="text-[11px] text-gray-500 font-mono">permit Operator for telemetry, pumps &amp; valves</p>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800">
              ENFORCED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
