import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "./components/Navbar";
import WaterFlowSystem from "./components/WaterFlowSystem";
import SimulationControls from "./components/SimulationControls";
import WaterMetrics from "./components/WaterMetrics";
import Analytics from "./components/Analytics";
import SystemStatus from "./components/SystemStatus";
import HardwareLeds from "./components/HardwareLeds";
import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/AdminDashboard";
import { AlertTriangle, Leaf } from "lucide-react";
import { useFirebaseData } from "./hooks/useFirebaseData";
import { useAuth } from "./context/AuthContext";
import { ledsFromState } from "./utils/hardware";

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
  const [view, setView]           = useState("dashboard");
  const [state, setState]         = useState(INITIAL);
  const [warning, setWarning]     = useState(null);
  const [liveMode, setLiveMode]   = useState(false);

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
  }, [
    liveMode,
    leds.ro, leds.washing, leds.rain, leds.collection,
    leds.filter1, leds.filter2, leds.filter3, leds.pump,
    leds.recycled, leds.reuse, leds.reuseToilet, leds.reuseGarden, leds.reuseCleaning,
    syncLeds,
  ]);

  useEffect(() => {
    if (isLive) return undefined;
    sourceInterval.current = setInterval(() => {
      setState(s => {
        const anyActive = s.roActive || s.washingActive || s.rainActive;
        if (!anyActive) return s;
        if (s.collectionLiters >= s.collectionCapacity) return s;

        const drip = (s.roActive ? 0.5 : 0) + (s.washingActive ? 0.5 : 0) + (s.rainActive ? 0.3 : 0);
        const newColl      = Math.min(s.collectionCapacity, s.collectionLiters + drip);
        const newCollected = s.waterCollected + drip;

        return { ...s, collectionLiters: Math.round(newColl * 10) / 10, waterCollected: Math.round(newCollected * 10) / 10 };
      });
    }, 3000);
    return () => clearInterval(sourceInterval.current);
  }, [isLive]);

  useEffect(() => {
    if (isLive) return undefined;
    if (state.pumpRunning) {
      pumpInterval.current = setInterval(() => {
        setState(s => {
          const newColl   = Math.max(0, s.collectionLiters - 5);
          const newRecL   = Math.min(s.recycledCapacity, s.recycledLiters + 5);
          const newRecPct = (newRecL / s.recycledCapacity) * 100;
          const shouldStop = newRecPct >= 90 || newColl <= 0;
          if (shouldStop) {
            clearInterval(pumpInterval.current);
            if (newRecPct >= 90) showWarning("Recycled Tank Nearly Full — pump auto-stopped");
          }
          return {
            ...s,
            collectionLiters: newColl,
            recycledLiters:   newRecL,
            recycledPct:      newRecPct,
            freshWaterSaved:  s.freshWaterSaved + 5,
            waterRecycled:    s.waterRecycled   + 5,
            pumpRunning:      shouldStop ? false : s.pumpRunning,
            filtrationStage:  shouldStop ? 0     : s.filtrationStage,
          };
        });
      }, 900);
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

  const savingPercent = Math.round((displayState.freshWaterSaved / (displayState.freshWaterSaved + 280)) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">
        Loading JalLoop…
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        view={view}
        liveMode={liveMode}
        connected={connected}
        error={error}
        onOpenAdmin={() => setView(view === "admin" ? "dashboard" : "admin")}
        onToggleMode={() => {
          setLiveMode(!liveMode);
          addActivity(liveMode ? "Switched to Demo Mode" : "Switched to Live Mode — syncing LEDs to hardware");
        }}
      />

      {view === "admin" && isAdmin ? (
        <AdminDashboard onBack={() => setView("dashboard")} hardwareConnected={connected} />
      ) : (
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {warning && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 shadow-sm">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" /> {warning}
          </div>
        )}

        <div className="flex items-center gap-3 bg-green-700 text-white rounded-2xl px-6 py-4 shadow-sm">
          <Leaf size={20} className="shrink-0 opacity-80" />
          <div>
            <p className="text-xs font-semibold opacity-70 uppercase tracking-widest">JalLoop — Smart Water Recycling</p>
            <p className="text-base font-semibold mt-0.5">
              RO &amp; washing-machine wastewater is collected, filtered, and reused — saving
              <span className="text-green-200 font-bold ml-1">{savingPercent}% fresh water</span> every day.
            </p>
          </div>
        </div>

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

        <HardwareLeds liveMode={liveMode} connected={connected} leds={leds} />

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
        />

        <WaterMetrics
          waterCollected={displayState.waterCollected}
          waterRecycled={displayState.waterRecycled}
          freshWaterSaved={displayState.freshWaterSaved}
          waterReused={displayState.waterReused}
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3">
            <Analytics waterCollected={displayState.waterCollected} waterRecycled={displayState.waterRecycled} />
          </div>
          <div className="lg:col-span-2">
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

      </main>
      )}
    </div>
  );
}
