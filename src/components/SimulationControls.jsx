import { Droplets, Cloud, Play, Pause, RotateCcw, Power, ShieldAlert } from "lucide-react";

function Btn({ onClick, icon: Icon, label, variant = "default", disabled = false, active = false }) {
  const v = {
    default: active ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
    primary: active ? "bg-green-700 border-green-700 text-white" : "bg-white border-green-700 text-green-700 hover:bg-green-50",
    danger:  "bg-white border-gray-200 text-gray-500 hover:bg-gray-50",
    emergency: "bg-red-600 hover:bg-red-700 border-red-600 text-white shadow-red-100",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all shadow-sm ${v[variant]}`}>
      <Icon size={15} /> {label}
    </button>
  );
}

export default function SimulationControls({ 
  pumpRunning, reuseActive, roActive, washingActive, rainActive,
  onToggleRO, onToggleWashing, onToggleRain, 
  onStartRecycling, onUseRecycled, onReset, onEmergencyStop
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Source Controls (ON / OFF)</h2>
      </div>
      <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-100">
        <Btn onClick={onToggleRO}      icon={Power} label={roActive ? "RO Flowing" : "RO Stopped"} active={roActive} />
        <Btn onClick={onToggleWashing} icon={Power} label={washingActive ? "Washing Flowing" : "Washing Stopped"} active={washingActive} />
        <Btn onClick={onToggleRain}    icon={Cloud} label={rainActive ? "Raining" : "Rain Stopped"} active={rainActive} />
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Btn onClick={onStartRecycling} icon={pumpRunning ? Pause : Play} label={pumpRunning ? "Stop Pump" : "Start Recycling"} variant="primary" active={pumpRunning} />
        <Btn onClick={onUseRecycled} icon={Droplets} label={reuseActive ? "Stop Reuse" : "Use Recycled Water"} active={reuseActive} />
        <Btn onClick={onReset} icon={RotateCcw} label="Reset All" variant="danger" />
        {onEmergencyStop && (
          <Btn onClick={onEmergencyStop} icon={ShieldAlert} label="Emergency Shutoff" variant="emergency" />
        )}
      </div>
    </div>
  );
}

