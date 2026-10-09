import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingDown } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function generateBaseData() {
  return DAYS.map((day, i) => ({
    day,
    freshWater: 280 + Math.round(Math.sin(i * 0.9) * 20) - i * 3,
    recycled:   60 + Math.round(Math.cos(i * 0.7) * 10) + i * 2,
  }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-medium text-gray-800">{p.value} L</span>
        </div>
      ))}
    </div>
  );
};

export default function WaterUsageChart({ waterRecycled }) {
  const data = generateBaseData();
  // Update Sunday with live recycled value
  data[6].recycled = Math.round(waterRecycled);

  const totalFresh   = data.reduce((s, d) => s + d.freshWater, 0);
  const totalRecycle = data.reduce((s, d) => s + d.recycled,   0);
  const savingPct    = Math.round((totalRecycle / totalFresh) * 100);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Water Usage</h2>
          <p className="text-xs text-gray-400 mt-0.5">Last 7 days — Litres per day</p>
        </div>
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
          <TrendingDown size={13} className="text-green-600" />
          <span className="text-xs font-semibold text-green-700">Saved {savingPct}% fresh water this week</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
          <Line type="monotone" dataKey="freshWater" name="Fresh Water" stroke="#1565C0" strokeWidth={2} dot={{ r: 3, fill: "#1565C0" }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="recycled"   name="Recycled"    stroke="#2E7D32" strokeWidth={2} dot={{ r: 3, fill: "#2E7D32" }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
