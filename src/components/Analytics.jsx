import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingDown } from "lucide-react";

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

  return (
    <div id="analytics" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Water Recycling Trend</h2>
          <p className="text-xs text-gray-400 mt-0.5">Last 7 days — litres per day</p>
        </div>
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
          <TrendingDown size={13} className="text-green-600" />
          <span className="text-xs font-semibold text-green-700">{pct}% recycling efficiency this week</span>
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
  );
}
