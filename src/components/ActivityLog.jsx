import { Clock } from "lucide-react";

export default function ActivityLog({ entries }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h2>
        <p className="text-xs text-gray-400">No activity yet. Use simulation controls to start.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h2>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scroll">
        {entries.slice(0, 12).map((entry, i) => (
          <div key={i} className="flex items-start gap-2.5 py-1.5 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
              <Clock size={11} className="text-gray-300" />
              <span className="text-[10px] font-mono text-gray-400">{entry.time}</span>
            </div>
            <span className="text-xs text-gray-600">{entry.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
