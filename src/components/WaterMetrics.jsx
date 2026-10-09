import { Droplets, Recycle, Leaf, ArrowDownCircle } from "lucide-react";

function MetricCard({ icon: Icon, label, value, unit, sub, color = "blue", highlight = false }) {
  const colors = {
    blue:  { bg: "bg-blue-50",  ring: "ring-blue-100",  icon: "text-blue-500",  val: "text-blue-700",  border: "border-blue-200" },
    green: { bg: "bg-green-50", ring: "ring-green-100", icon: "text-green-600", val: "text-green-700", border: "border-green-200" },
    teal:  { bg: "bg-teal-50",  ring: "ring-teal-100",  icon: "text-teal-500",  val: "text-teal-700",  border: "border-teal-200" },
    gray:  { bg: "bg-gray-50",  ring: "ring-gray-100",  icon: "text-gray-400",  val: "text-gray-700",  border: "border-gray-200" },
  };
  const c = colors[color];
  return (
    <div className={`bg-white rounded-xl border p-4 flex flex-col gap-2 shadow-sm transition-all ${highlight ? `${c.border} ring-2 ${c.ring}` : "border-gray-200"}`}>
      <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}>
        <Icon size={18} className={c.icon} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <div className="flex items-end gap-1 mt-1">
          <span className={`text-3xl font-bold leading-none ${highlight ? c.val : "text-gray-900"}`}>{value}</span>
          <span className="text-sm font-medium text-gray-400 mb-0.5">{unit}</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      </div>
    </div>
  );
}

export default function WaterMetrics({ waterCollected, waterRecycled, freshWaterSaved, waterReused }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        icon={ArrowDownCircle}
        label="Water Collected"
        value={waterCollected}
        unit="L"
        sub="Total greywater captured"
        color="blue"
      />
      <MetricCard
        icon={Recycle}
        label="Water Recycled"
        value={Math.round(waterRecycled)}
        unit="L"
        sub="Treated and stored"
        color="teal"
      />
      <MetricCard
        icon={Droplets}
        label="Water Reused"
        value={Math.round(waterReused)}
        unit="L"
        sub="Deployed for household use"
        color="blue"
      />
      <MetricCard
        icon={Leaf}
        label="Fresh Water Saved"
        value={Math.round(freshWaterSaved)}
        unit="L"
        sub="Equivalent fresh water offset"
        color="green"
        highlight
      />
    </div>
  );
}
