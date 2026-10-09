export default function KpiCard({ label, value, unit, subtitle, highlight = false }) {
  return (
    <div className={`bg-white rounded-xl border p-5 flex flex-col gap-1 shadow-sm transition-all ${highlight ? "border-green-300 ring-1 ring-green-200" : "border-gray-200"}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <div className="flex items-end gap-1 mt-1">
        <span className={`text-3xl font-bold leading-none ${highlight ? "text-green-700" : "text-gray-900"}`}>{value}</span>
        <span className={`text-base font-semibold mb-0.5 ${highlight ? "text-green-600" : "text-gray-500"}`}>{unit}</span>
      </div>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}
