import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "./components/Navbar";
import WaterFlowSystem from "./components/WaterFlowSystem";
import SimulationControls from "./components/SimulationControls";
import WaterMetrics from "./components/WaterMetrics";
import Analytics from "./components/Analytics";
import SystemStatus from "./components/SystemStatus";
import HardwareLeds from "./components/HardwareLeds";
import VirtualHardwareWorkbench from "./components/VirtualHardwareWorkbench";
import AwsCloudCenterModal from "./components/AwsCloudCenterModal";
import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/AdminDashboard";
import {
  AlertTriangle,
  Leaf,
  Cloud,
  Cpu,
  Activity,
  BarChart3,
  Droplets,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Layers,
  Power,
  RotateCcw,
} from "lucide-react";
import { useFirebaseData } from "./hooks/useFirebaseData";
import { useAuth } from "./context/AuthContext";
import { ledsFromState } from "./utils/hardware";
import {
  COLLECTION_INTERVAL_MS,
  RO_INFLOW_RATE,
  WASHING_INFLOW_RATE,
  RAIN_INFLOW_RATE,
  PUMP_INTERVAL_MS,
  PUMP_FLOW_RATE_PER_TICK,
} from "./config/appConfig";

const INITIAL = {
  roLiters:           15,
  washingLiters:      40,
  collectionLiters:   55,
  collectionCapacity: 100,
  filtrationStage:    0,
  pumpRunning:        false,
  recycledPct:        72,
  recycledLiters:     72,
  recycledCapacity:   200,
  waterCollected:     95,
  waterRecycled:      72,
  waterReused:        30,
  freshWaterSaved:    72,
  reuseActive:        false,
  roActive:           true,
  washingActive:      true,
  rainActive:         true,
  activity: [
    { time: "19:42", msg: "RO wastewater continuously flowing into collection tank" },
    { time: "19:41", msg: "Washing machine water continuously flowing" },
    { time: "19:40", msg: "Rainwater collection active" },
  ],
};

function nowStr() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function App() {
  const { user, loading, isAdmin } = useAuth();
  const [view, setView]           = useState("flow");
  const [state, setState]         = useState(INITIAL);
  const [warning, setWarning]     = useState(null);
  const [liveMode, setLiveMode]   = useState(false);
  const [showAwsModal, setShowAwsModal] = useState(false);

  const { liveData, connected, error, sendCommand, syncLeds } = useFirebaseData(liveMode);

  const pumpInterval     = useRef(null);
  const reuseInterval    = useRef(null);
  const sourceInterval   = useRef(null);
  const filtrationTimers = useRef([]);

  const addActivity = useCallback((msg) => {
    setState(s => ({
      ...s,
      activity: [{ time: nowStr(), msg }, ...s.activity].slice(0, 20),
    }));
  }, []);

  const showWarning = (msg) => {
    setWarning(msg);
    setTimeout(() => setWarning(null), 4500);
  };

  const isLive = liveMode && connected && liveData;
  const displayState = isLive ? {
    ...state,
    collectionLiters: liveData.collectionLiters ?? state.collectionLiters,
    recycledLiters:   liveData.recycledLiters   ?? state.recycledLiters,
    recycledPct:      liveData.recycledPct       ?? state.recycledPct,
    pumpRunning:      liveData.pumpRunning       ?? state.pumpRunning,
    filtrationStage:  liveData.filtrationStage   ?? state.filtrationStage,
    roActive:         liveData.roActive          ?? state.roActive,
    washingActive:    liveData.washingActive     ?? state.washingActive,
    rainActive:       liveData.rainActive        ?? state.rainActive,
    reuseActive:      liveData.reuseActive       ?? state.reuseActive,
    waterCollected:   liveData.waterCollected    ?? state.waterCollected,
    waterRecycled:    liveData.waterRecycled     ?? state.waterRecycled,
    waterReused:      liveData.waterReused       ?? state.waterReused,
    freshWaterSaved:  liveData.freshWaterSaved   ?? state.freshWaterSaved,
  } : state;

  const leds = ledsFromState(displayState);

  useEffect(() => {
    if (!liveMode) return undefined;
    syncLeds(leds);
    return undefined;
  }, [liveMode, leds, syncLeds]);

  useEffect(() => {
    if (isLive) return undefined;
    sourceInterval.current = setInterval(() => {
      setState(s => {
        const anyActive = s.roActive || s.washingActive || s.rainActive;
        if (!anyActive) return s;
        if (s.collectionLiters >= s.collectionCapacity) return s;

        const drip = (s.roActive ? RO_INFLOW_RATE : 0) + 
                     (s.washingActive ? WASHING_INFLOW_RATE : 0) + 
                     (s.rainActive ? RAIN_INFLOW_RATE : 0);
        const newColl      = Math.min(s.collectionCapacity, s.collectionLiters + drip);
        const newCollected = s.waterCollected + drip;

        return { ...s, collectionLiters: Math.round(newColl * 100) / 100, waterCollected: Math.round(newCollected * 100) / 100 };
      });
    }, COLLECTION_INTERVAL_MS);
    return () => clearInterval(sourceInterval.current);
  }, [isLive]);

  useEffect(() => {
    if (isLive) return undefined;
    if (state.pumpRunning) {
      pumpInterval.current = setInterval(() => {
        setState(s => {
          const flow = PUMP_FLOW_RATE_PER_TICK;
          const newColl   = Math.max(0, s.collectionLiters - flow);
          const newRecL   = Math.min(s.recycledCapacity, s.recycledLiters + flow);
          const newRecPct = (newRecL / s.recycledCapacity) * 100;
          const shouldStop = newRecPct >= 90 || newColl <= 0;
          if (shouldStop) {
            clearInterval(pumpInterval.current);
            if (newRecPct >= 90) showWarning("Recycled Tank Nearly Full — pump auto-stopped");
          }
          return {
            ...s,
            collectionLiters: Math.round(newColl * 100) / 100,
            recycledLiters:   Math.round(newRecL * 100) / 100,
            recycledPct:      Math.round(newRecPct * 10) / 10,
            freshWaterSaved:  Math.round((s.freshWaterSaved + flow) * 100) / 100,
            waterRecycled:    Math.round((s.waterRecycled + flow) * 100) / 100,
            pumpRunning:      shouldStop ? false : s.pumpRunning,
            filtrationStage:  shouldStop ? 0     : s.filtrationStage,
          };
        });
      }, PUMP_INTERVAL_MS);
    } else {
      clearInterval(pumpInterval.current);
    }
    return () => clearInterval(pumpInterval.current);
  }, [state.pumpRunning, isLive]);

  useEffect(() => {
    if (displayState.reuseActive) {
      reuseInterval.current = setInterval(() => {
        setState(s => {
          const newRecL   = Math.max(0, s.recycledLiters - 3);
          const newRecPct = (newRecL / s.recycledCapacity) * 100;
          const shouldStop = newRecL <= 0;
          if (shouldStop) clearInterval(reuseInterval.current);
          return {
            ...s,
            recycledLiters: isLive ? s.recycledLiters : newRecL,
            recycledPct:    isLive ? s.recycledPct    : newRecPct,
            waterReused:    s.waterReused + 3,
            reuseActive:    shouldStop ? false : s.reuseActive,
          };
        });
      }, 800);
    } else {
      clearInterval(reuseInterval.current);
    }
    return () => clearInterval(reuseInterval.current);
  }, [displayState.reuseActive, isLive]);

  function handleToggleRO() {
    const next = !displayState.roActive;
    setState(s => ({ ...s, roActive: next }));
    addActivity(next ? "RO wastewater flow started" : "RO wastewater flow stopped");
    if (liveMode) sendCommand({ ro: next ? "ON" : "OFF" });
  }

  function handleToggleWashing() {
    const next = !displayState.washingActive;
    setState(s => ({ ...s, washingActive: next }));
    addActivity(next ? "Washing machine flow started" : "Washing machine flow stopped");
    if (liveMode) sendCommand({ washing: next ? "ON" : "OFF" });
  }

  function handleToggleRain() {
    const next = !displayState.rainActive;
    setState(s => ({ ...s, rainActive: next }));
    addActivity(next ? "Rainwater collection started" : "Rainwater collection stopped");
    if (liveMode) sendCommand({ rain: next ? "ON" : "OFF" });
  }

  function handleStartRecycling() {
    if (liveMode) {
      const nextPump = !displayState.pumpRunning;
      sendCommand({
        pump: nextPump ? "ON" : "OFF",
        filtration: nextPump ? "START" : "STOP",
      });
      setState(s => ({
        ...s,
        pumpRunning: nextPump,
        filtrationStage: nextPump ? Math.max(s.filtrationStage, 1) : 0,
      }));
      addActivity(nextPump ? "Sent recycle/pump ON to hardware" : "Sent pump OFF to hardware");
      return;
    }
    if (state.pumpRunning) {
      filtrationTimers.current.forEach(t => clearTimeout(t));
      setState(s => ({ ...s, pumpRunning: false, filtrationStage: 0 }));
      addActivity("Pump stopped");
      return;
    }
    if (state.recycledPct >= 90) { showWarning("Recycled Tank Nearly Full"); return; }
    if (state.collectionLiters <= 0) { showWarning("Collection tank empty"); return; }

    addActivity("Filtration started — Pre-filter");
    setState(s => ({ ...s, filtrationStage: 1 }));
    const t1 = setTimeout(() => { setState(s => ({ ...s, filtrationStage: 2 })); addActivity("Sediment filter active"); }, 1500);
    const t2 = setTimeout(() => { setState(s => ({ ...s, filtrationStage: 3 })); addActivity("Treatment unit active"); }, 3000);
    const t3 = setTimeout(() => { setState(s => ({ ...s, pumpRunning: true }));  addActivity("Pump started"); }, 4500);
    filtrationTimers.current = [t1, t2, t3];
  }

  function handleUseRecycled() {
    const next = !displayState.reuseActive;
    if (next && displayState.recycledLiters <= 0) { showWarning("Recycled tank empty"); return; }
    setState(s => ({ ...s, reuseActive: next }));
    addActivity(next ? "Recycled water deployed — toilet/garden/cleaning" : "Reuse paused");
    if (liveMode) sendCommand({ reuse: next ? "ON" : "OFF" });
  }

  function handleReset() {
    filtrationTimers.current.forEach(t => clearTimeout(t));
    filtrationTimers.current = [];
    clearInterval(pumpInterval.current);
    clearInterval(reuseInterval.current);
    setState(INITIAL);
    setWarning(null);
    addActivity("System reset");
    if (liveMode) {
      sendCommand({
        pump: "OFF",
        reuse: "OFF",
        ro: "ON",
        washing: "ON",
        rain: "ON",
        filtration: "STOP",
        reset: true,
      });
    }
  }

  function handleEmergencyStop() {
    filtrationTimers.current.forEach(t => clearTimeout(t));
    filtrationTimers.current = [];
    clearInterval(pumpInterval.current);
    clearInterval(reuseInterval.current);
    setState(s => ({
      ...s,
      pumpRunning: false,
      reuseActive: false,
      roActive: false,
      washingActive: false,
      rainActive: false,
      filtrationStage: 0,
    }));
    showWarning("🚨 EMERGENCY STOP TRIGGERED: All water pumps, sources, and valves halted immediately.");
    addActivity("🚨 EMERGENCY SHUTOFF: System halted safely");
    if (liveMode) {
      sendCommand({
        pump: "OFF",
        reuse: "OFF",
        ro: "OFF",
        washing: "OFF",
        rain: "OFF",
        filtration: "STOP",
        emergencyStop: true,
      });
    }
  }

  const handleUpdateTurbidity = useCallback((turbidity) => {
    setState(s => ({ ...s, turbidity }));
  }, []);

  const handleUpdateCollection = useCallback((collectionLiters) => {
    setState(s => ({ ...s, collectionLiters }));
  }, []);

  const handleUpdateRecycled = useCallback((recycledLiters) => {
    setState(s => {
      const recycledPct = Math.round((recycledLiters / s.recycledCapacity) * 100);
      return { ...s, recycledLiters, recycledPct };
    });
  }, []);

  const savingPercent = Math.round((displayState.freshWaterSaved / (displayState.freshWaterSaved + 280)) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">
        Loading JalLoop…
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const currentTab = view === "dashboard" ? "flow" : view;

  const NAV_TABS = [
    { id: "flow", label: "Water Flow", icon: Droplets, badge: "Glass Pipes" },
    { id: "virtual-hardware", label: "Virtual Hardware", icon: Cpu, badge: "ESP32 Twin" },
    { id: "status", label: "System Status", icon: Activity, badge: "Live Logs" },
    { id: "analytics", label: "Analytics", icon: BarChart3, badge: "Charts & CSV" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        view={currentTab}
        liveMode={liveMode}
        connected={connected}
        error={error}
        onNavigate={(pageId) => setView(pageId)}
        onOpenAdmin={() => setView(view === "admin" ? "flow" : "admin")}
        onOpenAwsCenter={() => setShowAwsModal(true)}
        onToggleMode={() => {
          setLiveMode(!liveMode);
          addActivity(liveMode ? "Switched to Demo Mode" : "Switched to Live Mode — syncing LEDs to hardware");
        }}
      />

      {view === "admin" && isAdmin ? (
        <AdminDashboard onBack={() => setView("flow")} hardwareConnected={connected} />
      ) : (
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Global Warning Alert */}
        {warning && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 shadow-sm">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" /> {warning}
          </div>
        )}

        {/* Page Switcher Navigation Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-1.5 shadow-xs flex items-center gap-1.5 overflow-x-auto">
          {NAV_TABS.map(({ id, label, icon: Icon, badge }) => {
            const isActive = currentTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-green-700 text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-green-700"} />
                <span>{label}</span>
                {badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isActive ? "bg-green-800 text-green-100" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            PAGE 1: WATER FLOW (Flow simulation, glass pipes, controls, tanks)
        ========================================================================= */}
        {currentTab === "flow" && (
          <div className="space-y-5 animate-fadeIn">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-green-700 text-white rounded-2xl px-6 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Leaf size={20} className="shrink-0 opacity-80" />
                <div>
                  <p className="text-xs font-semibold opacity-70 uppercase tracking-widest">JalLoop — Smart Water Recycling</p>
                  <p className="text-base font-semibold mt-0.5">
                    RO &amp; washing-machine wastewater is collected, filtered, and reused — saving
                    <span className="text-green-200 font-bold ml-1">{savingPercent}% fresh water</span> every day.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAwsModal(true)}
                className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-amber-950 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <Cloud size={14} className="text-amber-900" />
                <span>AWS Open Source Center</span>
              </button>
            </div>

            {/* Interactive Animated Flow System */}
            <WaterFlowSystem
              roLiters={displayState.roLiters}
              washingLiters={displayState.washingLiters}
              collectionLiters={displayState.collectionLiters}
              collectionCapacity={displayState.collectionCapacity}
              filtrationStage={displayState.filtrationStage}
              pumpRunning={displayState.pumpRunning}
              recycledPct={displayState.recycledPct}
              recycledLiters={displayState.recycledLiters}
              recycledCapacity={displayState.recycledCapacity}
              freshWaterSaved={displayState.freshWaterSaved}
              roActive={displayState.roActive}
              washingActive={displayState.washingActive}
              rainActive={displayState.rainActive}
              reuseActive={displayState.reuseActive}
            />

            {/* Hardware LEDs (LED 1 Sky Blue & LED 2 Emerald Green) */}
            <HardwareLeds liveMode={liveMode} connected={connected} leds={leds} />

            {/* Flow Simulation Controls */}
            <SimulationControls
              pumpRunning={displayState.pumpRunning}
              reuseActive={displayState.reuseActive}
              roActive={displayState.roActive}
              washingActive={displayState.washingActive}
              rainActive={displayState.rainActive}
              onToggleRO={handleToggleRO}
              onToggleWashing={handleToggleWashing}
              onToggleRain={handleToggleRain}
              onStartRecycling={handleStartRecycling}
              onUseRecycled={handleUseRecycled}
              onReset={handleReset}
              onEmergencyStop={handleEmergencyStop}
            />

            {/* Water Metrics Summary */}
            <WaterMetrics
              waterCollected={displayState.waterCollected}
              waterRecycled={displayState.waterRecycled}
              freshWaterSaved={displayState.freshWaterSaved}
              waterReused={displayState.waterReused}
            />
          </div>
        )}

        {/* =========================================================================
            PAGE 2: VIRTUAL HARDWARE (ESP32 Twin, Sonars, Potentiometer, Breadboard)
        ========================================================================= */}
        {currentTab === "virtual-hardware" && (
          <div className="space-y-5 animate-fadeIn">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white rounded-2xl px-6 py-4 shadow-sm border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0">
                  <Cpu size={22} className="text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">ESP32 Digital Twin Workbench</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono">115200 Baud</span>
                  </div>
                  <p className="text-sm font-medium text-slate-300 mt-0.5">
                    Simulate physical microcontrollers, ultrasonic HC-SR04 sonars, analog turbidity inputs, and relay LEDs without physical hardware.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAwsModal(true)}
                className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-amber-950 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <Cloud size={14} className="text-amber-900" />
                <span>AWS Cloud Architecture</span>
              </button>
            </div>

            {/* Hardware LEDs status */}
            <HardwareLeds liveMode={liveMode} connected={connected} leds={leds} />

            {/* Virtual Hardware Workbench Interactive Breadboard */}
            <VirtualHardwareWorkbench
              displayState={displayState}
              leds={leds}
              onTogglePump={handleStartRecycling}
              onUpdateTurbidity={handleUpdateTurbidity}
              onUpdateCollection={handleUpdateCollection}
              onUpdateRecycled={handleUpdateRecycled}
              onToggleReuse={handleUseRecycled}
            />

            {/* Simulation Controls for testing */}
            <SimulationControls
              pumpRunning={displayState.pumpRunning}
              reuseActive={displayState.reuseActive}
              roActive={displayState.roActive}
              washingActive={displayState.washingActive}
              rainActive={displayState.rainActive}
              onToggleRO={handleToggleRO}
              onToggleWashing={handleToggleWashing}
              onToggleRain={handleToggleRain}
              onStartRecycling={handleStartRecycling}
              onUseRecycled={handleUseRecycled}
              onReset={handleReset}
              onEmergencyStop={handleEmergencyStop}
            />
          </div>
        )}

        {/* =========================================================================
            PAGE 3: SYSTEM STATUS (Diagnostics, Filtration Stages, Logs & Relays)
        ========================================================================= */}
        {currentTab === "status" && (
          <div className="space-y-5 animate-fadeIn">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-teal-900 text-white rounded-2xl px-6 py-4 shadow-sm border border-teal-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center shrink-0">
                  <Activity size={22} className="text-teal-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-teal-300 uppercase tracking-widest">System Status &amp; Actuators</span>
                    <span className="text-[10px] bg-teal-500/20 text-teal-200 border border-teal-500/30 px-2 py-0.5 rounded-full font-mono">Cedar Verified</span>
                  </div>
                  <p className="text-sm font-medium text-teal-100 mt-0.5">
                    Real-time monitoring of dual-tank reservoirs, filtration stages 1/2/3, relay actuators, and event logs.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAwsModal(true)}
                className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-amber-950 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <Cloud size={14} className="text-amber-900" />
                <span>AWS Cedar Invariants</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <WaterMetrics
              waterCollected={displayState.waterCollected}
              waterRecycled={displayState.waterRecycled}
              freshWaterSaved={displayState.freshWaterSaved}
              waterReused={displayState.waterReused}
            />

            {/* Diagnostics & Relay Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Relays & Actuators Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-amber-600" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Actuators &amp; Relay Matrix</h3>
                  </div>
                  <span className="text-[11px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">GPIO Control</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs font-bold text-gray-800">Submersible Filtration Pump (Relay 1)</p>
                      <p className="text-[11px] text-gray-500">GPIO 26 • Active Low • 12V 2.5A</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      displayState.pumpRunning ? "bg-green-100 text-green-700 animate-pulse" : "bg-gray-200 text-gray-600"
                    }`}>
                      {displayState.pumpRunning ? "ACTIVE / PUMPING" : "STANDBY"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs font-bold text-gray-800">Distribution Booster Pump (Relay 2)</p>
                      <p className="text-[11px] text-gray-500">GPIO 27 • Toilet &amp; Irrigation lines</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      displayState.reuseActive ? "bg-emerald-100 text-emerald-700 animate-pulse" : "bg-gray-200 text-gray-600"
                    }`}>
                      {displayState.reuseActive ? "ACTIVE / REUSING" : "IDLE"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs font-bold text-gray-800">Pre-Filter Inflow Valve (Solenoid 1)</p>
                      <p className="text-[11px] text-gray-500">GPIO 25 • 100-mesh stainless screen</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      displayState.filtrationStage >= 1 ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"
                    }`}>
                      {displayState.filtrationStage >= 1 ? "OPEN" : "CLOSED"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs font-bold text-gray-800">Sediment &amp; Carbon Valve (Solenoid 2)</p>
                      <p className="text-[11px] text-gray-500">GPIO 33 • 5-micron activated carbon</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      displayState.filtrationStage >= 2 ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"
                    }`}>
                      {displayState.filtrationStage >= 2 ? "OPEN" : "CLOSED"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-green-600" />
                    <span>Cedar Safety Invariant: Safe (Overflow lockout armed)</span>
                  </div>
                  <span className="font-mono text-green-700 font-bold">100% HEALTH</span>
                </div>
              </div>

              {/* SystemStatus Component (Filtration stage progression & Live Activity stream) */}
              <SystemStatus
                pumpRunning={displayState.pumpRunning}
                filtrationStage={displayState.filtrationStage}
                recycledPct={displayState.recycledPct}
                collectionLiters={displayState.collectionLiters}
                reuseActive={displayState.reuseActive}
                activity={displayState.activity}
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            PAGE 4: ANALYTICS (Charts, Savings, Efficiency, OpenSearch, CSV Export)
        ========================================================================= */}
        {currentTab === "analytics" && (
          <div className="space-y-5 animate-fadeIn">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-indigo-950 text-white rounded-2xl px-6 py-4 shadow-sm border border-indigo-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                  <BarChart3 size={22} className="text-indigo-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">Water Analytics &amp; Conservation</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">OpenSearch Index</span>
                  </div>
                  <p className="text-sm font-medium text-indigo-200 mt-0.5">
                    7-day recycling trend, telemetry aggregations, cost savings analysis, and exportable reports.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAwsModal(true)}
                className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-amber-950 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <Cloud size={14} className="text-amber-900" />
                <span>OpenSearch DSL</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <WaterMetrics
              waterCollected={displayState.waterCollected}
              waterRecycled={displayState.waterRecycled}
              freshWaterSaved={displayState.freshWaterSaved}
              waterReused={displayState.waterReused}
            />

            {/* 7-Day Line Chart & CSV Exporter */}
            <Analytics waterCollected={displayState.waterCollected} waterRecycled={displayState.waterRecycled} />

            {/* Environmental & Financial Impact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Est. Monthly Savings</span>
                <p className="text-2xl font-black text-gray-900 mt-1">
                  ₹{Math.round(displayState.freshWaterSaved * 3.2 * 30).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-green-600 font-semibold mt-1">Based on commercial water tariff</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Recycling Efficiency</span>
                <p className="text-2xl font-black text-green-700 mt-1">
                  {savingPercent}%
                </p>
                <p className="text-xs text-gray-500 font-medium mt-1">Fresh water offset ratio</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Groundwater Preserved</span>
                <p className="text-2xl font-black text-blue-600 mt-1">
                  {Math.round(displayState.freshWaterSaved * 1.25)} L
                </p>
                <p className="text-xs text-gray-500 font-medium mt-1">Aquifer depletion reduction</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Energy Efficiency</span>
                <p className="text-2xl font-black text-amber-600 mt-1">
                  0.035 kWh
                </p>
                <p className="text-xs text-gray-500 font-medium mt-1">Per 100 litres recycled</p>
              </div>
            </div>
          </div>
        )}

      </main>
      )}

      {/* AWS Cloud Architecture & Open Source Modal */}
      <AwsCloudCenterModal
        isOpen={showAwsModal}
        onClose={() => setShowAwsModal(false)}
        systemState={displayState}
      />
    </div>
  );
}
