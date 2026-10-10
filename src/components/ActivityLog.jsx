import { Clock, Download } from "lucide-react";

export default function ActivityLog({ entries }) {
  const exportLogCSV = () => {
    if (!entries || entries.length === 0) return;
    const headers = ["Timestamp", "Activity Description"];
    const rows = entries.map(e => [e.time, `"${(e.msg || e.message || "").replace(/"/g, '""')}"`]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `jalloop_activity_log_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">Recent Activity</h2>
        <button
          onClick={exportLogCSV}
          title="Export Activity Log CSV"
          className="flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
        >
          <Download size={12} />
          <span>Export</span>
        </button>
      </div>
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
