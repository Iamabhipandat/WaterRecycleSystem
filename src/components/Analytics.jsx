import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingDown, Download, Search, Database } from "lucide-react";
import { searchOpenSearchTelemetry } from "../services/openSearchService";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function baseData() {
  return DAYS.map((day, i) => ({
    day,
    collected: 45 + Math.round(Math.sin(i * 0.8) * 12) + i * 4,
    recycled:  30 + Math.round(Math.cos(i * 0.9) * 8)  + i * 3,
    saved:     28 + Math.round(Math.sin(i * 1.1) * 6)  + i * 3,
  }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-xs min-w-[140px]">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-gray-500">{p.name}</span>
          </div>
          <span className="font-semibold text-gray-800">{p.value} L</span>
        </div>
      ))}
    </div>
  );
};

export default function Analytics({ waterCollected, waterRecycled }) {
  const data = baseData();
  data[6].collected = Math.round(waterCollected);
  data[6].recycled  = Math.round(waterRecycled);
  data[6].saved     = Math.round(waterRecycled * 0.95);

  const totalCollected = data.reduce((s, d) => s + d.collected, 0);
  const totalRecycled  = data.reduce((s, d) => s + d.recycled,  0);
  const pct = Math.round((totalRecycled / totalCollected) * 100);

  const [searchQuery, setSearchQuery] = useState("");
  const [telemetryLogs, setTelemetryLogs] = useState([]);

  useEffect(() => {
    searchOpenSearchTelemetry({ queryText: searchQuery }).then(setTelemetryLogs);
  }, [searchQuery]);

  const exportCSV = () => {
    const headers = ["Day", "Collected (L)", "Recycled (L)", "Saved (L)", "Efficiency (%)"];
    const rows = data.map(d => [
      d.day,
      d.collected,
      d.recycled,
      d.saved,
      Math.round((d.recycled / (d.collected || 1)) * 100)
    ]);
    rows.push(["TOTAL / AVG", totalCollected, totalRecycled, data.reduce((s, d) => s + d.saved, 0), pct]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `jalloop_recycling_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="analytics" className="space-y-4">
      {/* Chart Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Water Recycling Trend</h2>
            <p className="text-xs text-gray-400 mt-0.5">Last 7 days — litres per day</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <TrendingDown size={13} className="text-green-600" />
              <span className="text-xs font-semibold text-green-700">{pct}% recycling efficiency this week</span>
            </div>
            <button
              onClick={exportCSV}
              title="Export CSV Report"
              className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              <Download size={13} />
              <span className="hidden sm:inline font-medium">Export CSV</span>
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
            <Line type="monotone" dataKey="collected" name="Collected" stroke="#60A5FA" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="recycled"  name="Recycled"  stroke="#34D399" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="saved"     name="Saved"     stroke="#2E7D32" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* OpenSearch Telemetry Log Explorer Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Telemetry Index Explorer</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                OpenSearch Query DSL
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Real-time indexed water quality events, flow rates, and sensor snapshots.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by source, quality..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-indigo-400 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Water Source</th>
                <th className="py-2.5 px-3">Turbidity</th>
                <th className="py-2.5 px-3">Quality</th>
                <th className="py-2.5 px-3">Recycled L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[11px]">
              {telemetryLogs.slice(0, 5).map((log) => (
                <tr key={log._id} className="hover:bg-gray-50/60">
                  <td className="py-2 px-3 font-mono text-gray-500">{new Date(log.timestamp).toLocaleTimeString("en-IN")}</td>
                  <td className="py-2 px-3 font-medium text-gray-800">{log.source}</td>
                  <td className="py-2 px-3 font-mono text-gray-600">{log.turbidityNTU} NTU</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                      log.quality === "Good"
                        ? "bg-emerald-50 text-emerald-700"
                        : log.quality === "Fair"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-red-700"
                    }`}>
                      {log.quality}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-bold text-emerald-700">{log.recycledLiters} L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
