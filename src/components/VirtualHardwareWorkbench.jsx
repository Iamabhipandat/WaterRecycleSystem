import { useState, useEffect, useRef } from "react";
import {
  Cpu,
  Radio,
  Sliders,
  Terminal,
  Activity,
  Layers,
  Power,
  Zap,
  Volume2,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";

export default function VirtualHardwareWorkbench({
  displayState,
  leds,
  onTogglePump,
  onUpdateTurbidity,
  onUpdateCollection,
  onUpdateRecycled,
  onToggleReuse,
}) {
  const [activeTab, setActiveTab] = useState("board"); // "board" | "terminal" | "wokwi"
  const [turbidityVal, setTurbidityVal] = useState(displayState.turbidity || 0);
  const [collectionDistance, setCollectionDistance] = useState(30); // Empty collection tank
  const [recycledDistance, setRecycledDistance] = useState(60); // Empty recycled tank
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [autoStream, setAutoStream] = useState(false);
  const [systemLedBlink, setSystemLedBlink] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const terminalEndRef = useRef(null);

  // System heartbeat LED blink (matches GPIO 25 in sketch.ino)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setSystemLedBlink((prev) => !prev);
    }, 500);
    return () => clearInterval(blinkInterval);
  }, []);

  // Update sensor values when displayState changes
  useEffect(() => {
    if (displayState.collectionLiters !== undefined) {
      const pct = (displayState.collectionLiters / displayState.collectionCapacity) * 100;
      const cm = Math.round(30 - (pct / 100) * 30);
      setCollectionDistance(Math.max(2, Math.min(30, cm)));
    }
  }, [displayState.collectionLiters, displayState.collectionCapacity]);

  useEffect(() => {
    if (displayState.recycledLiters !== undefined) {
      const pct = (displayState.recycledLiters / displayState.recycledCapacity) * 100;
      const cm = Math.round(60 - (pct / 100) * 60);
      setRecycledDistance(Math.max(2, Math.min(60, cm)));
    }
  }, [displayState.recycledLiters, displayState.recycledCapacity]);

  // Virtual ESP32 Serial Logger stream
  useEffect(() => {
    if (!autoStream) return undefined;

    const logTimer = setInterval(() => {
      const now = new Date().toLocaleTimeString("en-IN", { hour12: false });
      const colPct = Math.round(displayState.collectionLiters || 0);
      const recPct = Math.round(displayState.recycledLiters || 0);
      const turb = turbidityVal;
      const pump = displayState.pumpRunning ? "RUNNING" : "IDLE";
      const recLed = leds?.recycled ? "HIGH" : "LOW";
      const reuseLed = leds?.reuse ? "HIGH" : "LOW";

      const newLog = `[${now}] [ESP32_CORE0] ColSonar: ${collectionDistance}cm (${colPct}L) | RecSonar: ${recycledDistance}cm (${recPct}L) | Turbidity: ${turb} NTU | Pump: ${pump} | GPIO15(RecLED): ${recLed} | GPIO2(ReuseLED): ${reuseLed}`;

      setTerminalLogs((prev) => [...prev.slice(-30), newLog]);
    }, 2500);

    return () => clearInterval(logTimer);
  }, [autoStream, displayState, turbidityVal, collectionDistance, recycledDistance, leds]);

  useEffect(() => {
    if (activeTab === "terminal" && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs, activeTab]);

  function handleTurbidityChange(e) {
    const val = Number(e.target.value);
    setTurbidityVal(val);
    if (onUpdateTurbidity) onUpdateTurbidity(val);
  }

  function handleCollectionSonarChange(e) {
    const cm = Number(e.target.value);
    setCollectionDistance(cm);
    const pct = Math.max(0, Math.min(100, Math.round(((30 - cm) / 30) * 100)));
    const liters = Math.round((pct / 100) * (displayState.collectionCapacity || 100));
    if (onUpdateCollection) onUpdateCollection(liters);
  }

  function handleRecycledSonarChange(e) {
    const cm = Number(e.target.value);
    setRecycledDistance(cm);
    const pct = Math.max(0, Math.min(100, Math.round(((60 - cm) / 60) * 100)));
    const liters = Math.round((pct / 100) * (displayState.recycledCapacity || 200));
    if (onUpdateRecycled) onUpdateRecycled(liters);
  }

  return (
    <div id="virtual-hardware" className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm p-3.5 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 shadow-2xs shrink-0">
            <Cpu size={22} className="text-cyan-700" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                Virtual Hardware Workbench &amp; ESP32 Simulation
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 whitespace-nowrap">
                Digital Twin
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Interactive ESP32 circuit with virtual ultrasonic sonars, turbidity potentiometer, pump switch &amp; LEDs
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("board")}
            className={`flex-1 sm:flex-none text-center px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "board" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Virtual Circuit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("terminal")}
            className={`flex-1 sm:flex-none text-center px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "terminal" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Terminal size={12} />
            Serial Monitor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("wokwi")}
            className={`flex-1 sm:flex-none text-center px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "wokwi" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <ExternalLink size={12} />
            Wokwi
          </button>
        </div>
      </div>

      {/* TAB 1: VIRTUAL CIRCUIT BREADBOARD */}
      {activeTab === "board" && (
        <div className="space-y-4">
          {/* Top Info Banner */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-cyan-50/70 via-sky-50/50 to-blue-50/70 border border-cyan-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${systemLedBlink ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-gray-300"}`} />
              <span className="font-bold text-gray-800">
                ESP32 DevKit v1: <span className="text-emerald-700">ONLINE</span>
              </span>
              <span className="text-gray-300 hidden sm:inline">·</span>
              <span className="text-gray-600 text-[11px] sm:text-xs">Firmware: <code className="font-mono font-bold text-cyan-800">v2.0.0 (FreeRTOS)</code></span>
            </div>
            <div className="text-[11px] text-gray-500">
              Move sliders below to simulate ultrasonic water levels &amp; turbidity
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* LEFT: SENSORS & PHYSICAL INPUTS (7 Columns) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="p-3.5 sm:p-4 rounded-2xl border border-gray-200 bg-gray-50/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                    <Sliders size={14} className="text-cyan-700 shrink-0" />
                    <span>Virtual Ultrasonic Sonar &amp; Analog Sensors</span>
                  </h3>
                  <span className="text-[10px] font-mono text-gray-400">GPIO Pins: 5, 18, 19, 21, 34</span>
                </div>

                {/* Sensor 1: HC-SR04 Collection Tank */}
                <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                    <div className="flex items-center gap-2 font-bold text-gray-800">
                      <Radio size={14} className="text-blue-600 shrink-0" />
                      <span>HC-SR04 Sonar 1 (Collection Tank)</span>
                    </div>
                    <span className="self-start sm:self-auto font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 shrink-0 whitespace-nowrap">
                      {collectionDistance} cm ({Math.round(displayState.collectionLiters || 0)} L)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={30}
                    step={1}
                    value={collectionDistance}
                    onChange={handleCollectionSonarChange}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span>2 cm (Full)</span>
                    <span className="hidden sm:inline">Distance to water surface</span>
                    <span>30 cm (Empty)</span>
                  </div>
                </div>

                {/* Sensor 2: HC-SR04 Recycled Tank */}
                <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                    <div className="flex items-center gap-2 font-bold text-gray-800">
                      <Radio size={14} className="text-sky-600 shrink-0" />
                      <span>HC-SR04 Sonar 2 (Recycled Storage Tank)</span>
                    </div>
                    <span className="self-start sm:self-auto font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 shrink-0 whitespace-nowrap">
                      {recycledDistance} cm ({Math.round(displayState.recycledLiters || 0)} L)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={60}
                    step={1}
                    value={recycledDistance}
                    onChange={handleRecycledSonarChange}
                    className="w-full accent-sky-600"
                  />
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span>2 cm (Full)</span>
                    <span className="hidden sm:inline">Distance to water surface</span>
                    <span>60 cm (Empty)</span>
                  </div>
                </div>

                {/* Sensor 3: Turbidity Potentiometer */}
                <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                    <div className="flex items-center gap-2 font-bold text-gray-800">
                      <Activity size={14} className="text-amber-600 shrink-0" />
                      <span>Analog Turbidity Potentiometer (GPIO 34 ADC)</span>
                    </div>
                    <span className={`self-start sm:self-auto font-mono font-bold px-2 py-0.5 rounded-md border text-xs shrink-0 whitespace-nowrap ${
                      turbidityVal > 60
                        ? "bg-red-50 text-red-700 border-red-200"
                        : turbidityVal > 35
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      {turbidityVal} NTU ({turbidityVal > 60 ? "Poor" : turbidityVal > 35 ? "Fair" : "Good"})
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={95}
                    value={turbidityVal}
                    onChange={handleTurbidityChange}
                    className="w-full accent-amber-600"
                  />
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span>10 NTU (Clear)</span>
                    <span className="hidden sm:inline">WHO Limit: 40 NTU</span>
                    <span>95 NTU (Sediment)</span>
                  </div>
                </div>

                {/* Tactile Microswitch Button: BTN_PUMP on GPIO 0 */}
                <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-xs text-gray-800 block">
                      Physical Push Button: <code className="font-mono text-cyan-800">BTN_PUMP (GPIO 0)</code>
                    </span>
                    <span className="text-[11px] text-gray-400">Hardware interrupt button to toggle filtration pump</span>
                  </div>
                  <button
                    type="button"
                    onClick={onTogglePump}
                    className={`w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0 ${
                      displayState.pumpRunning
                        ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    <Power size={14} />
                    {displayState.pumpRunning ? "Stop Pump (BTN 0)" : "Start Pump (BTN 0)"}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: VIRTUAL BREADBOARD LEDS (5 Columns) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="p-3.5 sm:p-4 rounded-2xl border border-gray-200 bg-gray-50/60 space-y-3 h-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                    <Zap size={14} className="text-amber-500 shrink-0" />
                    <span>Virtual ESP32 GPIO LEDs</span>
                  </h3>
                  <span className="text-[10px] font-mono text-gray-400">Pin Status</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* System Heartbeat */}
                  <div className={`p-2.5 rounded-xl border transition-all ${systemLedBlink ? "bg-emerald-50 border-emerald-300" : "bg-white border-gray-200"}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${systemLedBlink ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-gray-300"}`} />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-gray-900 block text-[11px] truncate">LED_SYSTEM</span>
                        <span className="text-[10px] text-gray-400 font-mono block truncate">GPIO 25 (Blink)</span>
                      </div>
                    </div>
                  </div>

                  {/* Pump LED */}
                  <div className={`p-2.5 rounded-xl border transition-all ${displayState.pumpRunning ? "bg-red-50 border-red-300" : "bg-white border-gray-200"}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${displayState.pumpRunning ? "bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse" : "bg-gray-300"}`} />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-gray-900 block text-[11px] truncate">LED_PUMP</span>
                        <span className="text-[10px] text-gray-400 font-mono block truncate">GPIO 32 (Relay)</span>
                      </div>
                    </div>
                  </div>

                  {/* RO LED */}
                  <div className={`p-2.5 rounded-xl border transition-all ${leds?.ro ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${leds?.ro ? "bg-blue-500 shadow-[0_0_8px_#3b82f6]" : "bg-gray-300"}`} />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-gray-900 block text-[11px] truncate">LED_RO</span>
                        <span className="text-[10px] text-gray-400 font-mono block truncate">GPIO 4 (Inflow)</span>
                      </div>
                    </div>
                  </div>

                  {/* Washing LED */}
                  <div className={`p-2.5 rounded-xl border transition-all ${leds?.washing ? "bg-cyan-50 border-cyan-300" : "bg-white border-gray-200"}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${leds?.washing ? "bg-cyan-500 shadow-[0_0_8px_#06b6d4]" : "bg-gray-300"}`} />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-gray-900 block text-[11px] truncate">LED_WASHING</span>
                        <span className="text-[10px] text-gray-400 font-mono block truncate">GPIO 12 (Washer)</span>
                      </div>
                    </div>
                  </div>

                  {/* Rain LED */}
                  <div className={`p-2.5 rounded-xl border transition-all ${leds?.rain ? "bg-sky-50 border-sky-300" : "bg-white border-gray-200"}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${leds?.rain ? "bg-sky-400 shadow-[0_0_8px_#38bdf8]" : "bg-gray-300"}`} />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-gray-900 block text-[11px] truncate">LED_RAIN</span>
                        <span className="text-[10px] text-gray-400 font-mono block truncate">GPIO 14 (Rain)</span>
                      </div>
                    </div>
                  </div>

                  {/* Filtration Stages */}
                  <div className={`p-2.5 rounded-xl border transition-all ${displayState.filtrationStage > 0 ? "bg-emerald-50 border-emerald-300" : "bg-white border-gray-200"}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${displayState.filtrationStage > 0 ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-gray-300"}`} />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-gray-900 block text-[11px] truncate">LED_FILTER</span>
                        <span className="text-[10px] text-gray-400 font-mono block truncate">Stage {displayState.filtrationStage} (26/16/33)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* THE TWO DEDICATED HARDWARE LEDS */}
                <div className="pt-2 border-t border-gray-200 space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Dedicated Water Phase Lights
                  </span>

                  {/* DEDICATED LED 1: RECYCLED STORING LED */}
                  <div className={`p-3 rounded-xl border transition-all ${
                    leds?.recycled
                      ? "bg-sky-50 border-sky-300 shadow-xs ring-2 ring-sky-200"
                      : "bg-white border-gray-200"
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-4 h-4 rounded-full shrink-0 ${
                          leds?.recycled
                            ? "bg-sky-500 shadow-[0_0_12px_#0284c7] ring-2 ring-sky-300 animate-pulse"
                            : "bg-gray-300"
                        }`} />
                        <div className="min-w-0">
                          <span className="font-bold text-gray-900 text-xs block">
                            LED 1: Recycled Storing Light
                          </span>
                          <span className="text-[10px] font-mono text-sky-800 font-semibold block">
                            Pin: GPIO 15 (LED_RECYCLED)
                          </span>
                        </div>
                      </div>
                      <span className={`self-start sm:self-auto text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full whitespace-nowrap ${
                        leds?.recycled ? "bg-sky-100 text-sky-800" : "bg-gray-100 text-gray-500"
                      }`}>
                        {leds?.recycled ? "STORING / STORED" : "EMPTY"}
                      </span>
                    </div>
                  </div>

                  {/* DEDICATED LED 2: REUSED DISTRIBUTION LED */}
                  <div className={`p-3 rounded-xl border transition-all ${
                    leds?.reuse
                      ? "bg-emerald-50 border-emerald-300 shadow-xs ring-2 ring-emerald-200"
                      : "bg-white border-gray-200"
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-4 h-4 rounded-full shrink-0 ${
                          leds?.reuse
                            ? "bg-emerald-500 shadow-[0_0_12px_#10b981] ring-2 ring-emerald-300 animate-pulse"
                            : "bg-gray-300"
                        }`} />
                        <div className="min-w-0">
                          <span className="font-bold text-gray-900 text-xs block">
                            LED 2: Reused Water Distribution Light
                          </span>
                          <span className="text-[10px] font-mono text-emerald-800 font-semibold block">
                            Pins: GPIO 2, 17, 13 (Sol Valves)
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onToggleReuse}
                        className={`self-start sm:self-auto text-[10px] font-extrabold uppercase px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                          leds?.reuse
                            ? "bg-emerald-200 text-emerald-900 hover:bg-emerald-300"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {leds?.reuse ? "ACTIVE (VALVES ON)" : "DISTRIBUTE"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VIRTUAL SERIAL MONITOR TERMINAL */}
      {activeTab === "terminal" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-mono font-bold text-gray-800">COM3 (ESP32 Serial @ 115200)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAutoStream(!autoStream)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  autoStream ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-600"
                }`}
              >
                {autoStream ? "Auto-streaming" : "Paused"}
              </button>
              <button
                type="button"
                onClick={() => setTerminalLogs([])}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold"
              >
                Clear Terminal
              </button>
            </div>
          </div>

          <div className="bg-gray-950 text-gray-200 font-mono text-[11px] p-4 rounded-2xl h-72 overflow-y-auto space-y-1 shadow-inner border border-gray-800 break-all sm:break-normal">
            <p className="text-gray-500">// JalLoop ESP32 Virtual Hardware Serial Terminal Stream (Wokwi / Realtime)</p>
            <p className="text-emerald-400">[BOOT] ESP32-WROOM-32 initialized. CPU: 240MHz. Flash: 4MB.</p>
            <p className="text-cyan-400">[WIFI] Connected to SSID: Wokwi-GUEST. Assigned IP: 192.168.1.105</p>
            <p className="text-amber-400">[RTOS] Starting FreeRTOS tasks: SensorTask, PumpCtrlTask, MqttSyncTask</p>
            {terminalLogs.map((log, idx) => (
              <p key={idx} className="leading-relaxed hover:text-white">
                {log}
              </p>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>
      )}

      {/* TAB 3: CLEAN WOKWI CIRCUIT SIMULATION & SCHEMATIC */}
      {activeTab === "wokwi" && (
        <div className="p-4 sm:p-5 rounded-2xl border border-gray-200 bg-gray-50/70 space-y-4 text-xs animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-sm">Clean ESP32 Circuit Schematic</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Clean Wiring v2.0
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Streamlined, low-wire architecture: Dual HC-SR04 sonars, turbidity ADC, pump switch, and 4 dedicated status actuators.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  const cleanJson = JSON.stringify({
                    version: 1,
                    author: "JalLoop - Clean ESP32 Circuit",
                    editor: "wokwi",
                    parts: [
                      { type: "wokwi-esp32-devkit-v1", id: "esp", top: 120, left: 0 },
                      { type: "wokwi-hc-sr04", id: "sonar_col", top: -80, left: -260, attrs: { distance: "15" } },
                      { type: "wokwi-hc-sr04", id: "sonar_rec", top: 120, left: -260, attrs: { distance: "35" } },
                      { type: "wokwi-potentiometer", id: "pot_turbidity", top: 320, left: -240, attrs: { value: "0.35" } },
                      { type: "wokwi-pushbutton", id: "btn_pump", top: 440, left: -220, attrs: { label: "PUMP", color: "red" } },
                      { type: "wokwi-resistor", id: "res_sys", top: 100, left: 220, attrs: { value: "220" } },
                      { type: "wokwi-led", id: "led_sys", top: 90, left: 300, attrs: { color: "green", label: "HEARTBEAT" } },
                      { type: "wokwi-resistor", id: "res_pump", top: 170, left: 220, attrs: { value: "220" } },
                      { type: "wokwi-led", id: "led_pump", top: 160, left: 300, attrs: { color: "red", label: "PUMP_RELAY" } },
                      { type: "wokwi-resistor", id: "res_rec", top: 240, left: 220, attrs: { value: "220" } },
                      { type: "wokwi-led", id: "led_rec", top: 230, left: 300, attrs: { color: "blue", label: "RECYCLED_STORED" } },
                      { type: "wokwi-resistor", id: "res_reuse", top: 310, left: 220, attrs: { value: "220" } },
                      { type: "wokwi-led", id: "led_reuse", top: 300, left: 300, attrs: { color: "yellow", label: "REUSE_VALVE" } }
                    ],
                    connections: [
                      ["sonar_col:VCC", "esp:3V3", "red", []],
                      ["sonar_col:GND", "esp:GND.1", "black", []],
                      ["sonar_col:TRIG", "esp:D5", "orange", []],
                      ["sonar_col:ECHO", "esp:D18", "gold", []],
                      ["sonar_rec:VCC", "esp:3V3", "red", []],
                      ["sonar_rec:GND", "esp:GND.1", "black", []],
                      ["sonar_rec:TRIG", "esp:D19", "orange", []],
                      ["sonar_rec:ECHO", "esp:D21", "gold", []],
                      ["pot_turbidity:VCC", "esp:3V3", "red", []],
                      ["pot_turbidity:GND", "esp:GND.1", "black", []],
                      ["pot_turbidity:SIG", "esp:D34", "purple", []],
                      ["btn_pump:1.l", "esp:D0", "gray", []],
                      ["btn_pump:2.l", "esp:GND.1", "black", []],
                      ["esp:D25", "res_sys:1", "green", []],
                      ["res_sys:2", "led_sys:A", "green", []],
                      ["led_sys:C", "esp:GND.2", "black", []],
                      ["esp:D32", "res_pump:1", "red", []],
                      ["res_pump:2", "led_pump:A", "red", []],
                      ["led_pump:C", "esp:GND.2", "black", []],
                      ["esp:D15", "res_rec:1", "blue", []],
                      ["res_rec:2", "led_rec:A", "blue", []],
                      ["led_rec:C", "esp:GND.2", "black", []],
                      ["esp:D2", "res_reuse:1", "orange", []],
                      ["res_reuse:2", "led_reuse:A", "orange", []],
                      ["led_reuse:C", "esp:GND.2", "black", []]
                    ]
                  }, null, 2);
                  navigator.clipboard.writeText(cleanJson);
                  setCopiedJson(true);
                  setTimeout(() => setCopiedJson(false), 2000);
                }}
                className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {copiedJson ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                <span>{copiedJson ? "Copied!" : "Copy diagram.json"}</span>
              </button>
              <a
                href="https://wokwi.com"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-2xs"
              >
                Open wokwi.com
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Clean Visual Circuit Schematic SVG */}
          <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white p-3 shadow-inner">
            <svg viewBox="0 0 880 340" className="w-full min-w-[720px] h-auto select-none font-sans">
              {/* Background grid */}
              <defs>
                <pattern id="cleanGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="#F1F5F9" />
                </pattern>
              </defs>
              <rect width="880" height="340" fill="#FAFAFA" rx="8" />
              <rect width="880" height="340" fill="url(#cleanGrid)" />

              {/* Column Banners */}
              <rect x="20" y="10" width="240" height="26" rx="6" fill="#EFF6FF" stroke="#BFDBFE" />
              <text x="140" y="27" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1D4ED8">INPUT SENSORS (3.3V)</text>

              <rect x="320" y="10" width="240" height="26" rx="6" fill="#F0FDF4" stroke="#BBF7D0" />
              <text x="440" y="27" textAnchor="middle" fontSize="11" fontWeight="700" fill="#15803D">ESP32 MICROCONTROLLER</text>

              <rect x="620" y="10" width="240" height="26" rx="6" fill="#FEF3C7" stroke="#FDE68A" />
              <text x="740" y="27" textAnchor="middle" fontSize="11" fontWeight="700" fill="#B45309">ACTUATORS &amp; OUTPUTS</text>

              {/* ── LEFT COLUMN: SENSORS ── */}
              {/* Sensor 1: HC-SR04 Collection */}
              <rect x="25" y="55" width="230" height="58" rx="8" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.5" />
              <circle cx="45" cy="84" r="12" fill="#DBEAFE" />
              <text x="45" y="88" textAnchor="middle" fontSize="12">📡</text>
              <text x="68" y="76" fontSize="11" fontWeight="700" fill="#1E3A8A">HC-SR04 Sonar 1 (Collection)</text>
              <text x="68" y="93" fontSize="9.5" font-family="monospace" fill="#2563EB">TRIG → GPIO 5 | ECHO → GPIO 18</text>

              {/* Sensor 2: HC-SR04 Recycled */}
              <rect x="25" y="125" width="230" height="58" rx="8" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.5" />
              <circle cx="45" cy="154" r="12" fill="#DBEAFE" />
              <text x="45" y="158" textAnchor="middle" fontSize="12">📡</text>
              <text x="68" y="146" fontSize="11" fontWeight="700" fill="#1E3A8A">HC-SR04 Sonar 2 (Recycled)</text>
              <text x="68" y="163" fontSize="9.5" font-family="monospace" fill="#2563EB">TRIG → GPIO 19 | ECHO → GPIO 21</text>

              {/* Sensor 3: Turbidity Potentiometer */}
              <rect x="25" y="195" width="230" height="58" rx="8" fill="#FFFFFF" stroke="#FCD34D" strokeWidth="1.5" />
              <circle cx="45" cy="224" r="12" fill="#FEF3C7" />
              <text x="45" y="228" textAnchor="middle" fontSize="12">🎛️</text>
              <text x="68" y="216" fontSize="11" fontWeight="700" fill="#78350F">Turbidity Potentiometer (ADC)</text>
              <text x="68" y="233" fontSize="9.5" font-family="monospace" fill="#D97706">SIG → GPIO 34 (Analog In)</text>

              {/* Sensor 4: Pushbutton */}
              <rect x="25" y="265" width="230" height="58" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
              <circle cx="45" cy="294" r="12" fill="#F1F5F9" />
              <text x="45" y="298" textAnchor="middle" fontSize="12">🔘</text>
              <text x="68" y="286" fontSize="11" fontWeight="700" fill="#334155">Manual Pump Button</text>
              <text x="68" y="303" fontSize="9.5" font-family="monospace" fill="#64748B">BTN → GPIO 0 (Interrupt to GND)</text>

              {/* ── CENTER COLUMN: ESP32 DEVKIT ── */}
              <rect x="330" y="55" width="220" height="268" rx="12" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
              <rect x="345" y="70" width="190" height="40" rx="6" fill="#334155" />
              <text x="440" y="87" textAnchor="middle" fontSize="12" fontWeight="800" fill="#38BDF8">ESP32-WROOM-32</text>
              <text x="440" y="101" textAnchor="middle" fontSize="9" font-family="monospace" fill="#94A3B8">Dual Core • 240MHz • FreeRTOS</text>

              {/* Left Pin Headers */}
              {["3V3 (Power)", "GND (Ground)", "GPIO 5 (TRIG 1)", "GPIO 18 (ECHO 1)", "GPIO 19 (TRIG 2)", "GPIO 21 (ECHO 2)", "GPIO 34 (ADC)", "GPIO 0 (BTN)"].map((pin, i) => (
                <g key={pin}>
                  <rect x="335" y={120 + i * 24} width="85" height="18" rx="3" fill="#0F172A" />
                  <text x="340" y={133 + i * 24} fontSize="8" font-family="monospace" fill="#38BDF8">{pin}</text>
                </g>
              ))}

              {/* Right Pin Headers */}
              {["GPIO 25 (Heartbeat)", "GPIO 32 (Pump Relay)", "GPIO 15 (Recycled)", "GPIO 2 (Reuse Valve)", "GND.2 (Ground)", "5V / VIN"].map((pin, i) => (
                <g key={pin}>
                  <rect x="455" y={120 + i * 24} width="90" height="18" rx="3" fill="#0F172A" />
                  <text x="540" y={133 + i * 24} textAnchor="end" fontSize="8" font-family="monospace" fill="#4ADE80">{pin}</text>
                </g>
              ))}

              {/* ── CLEAN DIRECT BUS WIRES (No Crisscrossing) ── */}
              {/* Wiring Left to ESP32 */}
              <path d="M 255 84 H 335" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 255 154 H 335" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 255 224 H 335" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 255 294 H 335" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />

              {/* Wiring ESP32 to Right */}
              <path d="M 550 128 H 625" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 550 152 H 625" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 550 176 H 625" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 550 200 H 625" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />

              {/* ── RIGHT COLUMN: OUTPUTS & ACTUATORS ── */}
              {/* Output 1: System Heartbeat LED */}
              <rect x="625" y="100" width="230" height="48" rx="8" fill="#FFFFFF" stroke="#86EFAC" strokeWidth="1.5" />
              <circle cx="645" cy="124" r="8" fill="#22C55E" />
              <text x="662" y="119" fontSize="10.5" fontWeight="700" fill="#14532D">System Heartbeat LED</text>
              <text x="662" y="134" fontSize="9" font-family="monospace" fill="#16A34A">GPIO 25 → 220Ω → Green LED</text>

              {/* Output 2: Pump Relay LED */}
              <rect x="625" y="155" width="230" height="48" rx="8" fill="#FFFFFF" stroke="#FCA5A5" strokeWidth="1.5" />
              <circle cx="645" cy="179" r="8" fill="#EF4444" />
              <text x="662" y="174" fontSize="10.5" fontWeight="700" fill="#7F1D1D">Pump / Relay Actuator</text>
              <text x="662" y="189" fontSize="9" font-family="monospace" fill="#DC2626">GPIO 32 → 220Ω → Red LED</text>

              {/* Output 3: Recycled Storing LED */}
              <rect x="625" y="210" width="230" height="48" rx="8" fill="#FFFFFF" stroke="#7DD3FC" strokeWidth="1.5" />
              <circle cx="645" cy="234" r="8" fill="#0284C7" />
              <text x="662" y="229" fontSize="10.5" fontWeight="700" fill="#0C4A6E">Recycled Storing Light</text>
              <text x="662" y="244" fontSize="9" font-family="monospace" fill="#0369A1">GPIO 15 → 220Ω → Blue LED</text>

              {/* Output 4: Reuse Distribution Valve */}
              <rect x="625" y="265" width="230" height="48" rx="8" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="1.5" />
              <circle cx="645" cy="289" r="8" fill="#EAB308" />
              <text x="662" y="284" fontSize="10.5" fontWeight="700" fill="#713F12">Distribution Valve Light</text>
              <text x="662" y="299" fontSize="9" font-family="monospace" fill="#CA8A04">GPIO 2 → 220Ω → Yellow LED</text>
            </svg>
          </div>

          {/* Clean Component & Pinout Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-100/70 border-b border-gray-200 flex items-center justify-between">
              <span className="font-bold text-gray-800 text-xs">Streamlined Pinout Map</span>
              <span className="text-[10px] text-gray-500 font-mono">4 Inputs • 4 Outputs • 3.3V Logic</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase">
                  <tr>
                    <th className="py-2 px-3">Device / Part</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">ESP32 Pin(s)</th>
                    <th className="py-2 px-3">Wire Color</th>
                    <th className="py-2 px-3">Functional Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[11px]">
                  <tr>
                    <td className="py-2 px-3 font-bold text-gray-800">HC-SR04 Sonar 1</td>
                    <td className="py-2 px-3 text-blue-700 font-semibold">Sensor In</td>
                    <td className="py-2 px-3 font-mono">GPIO 5 (TRIG), GPIO 18 (ECHO)</td>
                    <td className="py-2 px-3 font-mono text-orange-600">Orange / Gold</td>
                    <td className="py-2 px-3 text-gray-600">Measures Collection Tank water level (cm)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-gray-800">HC-SR04 Sonar 2</td>
                    <td className="py-2 px-3 text-blue-700 font-semibold">Sensor In</td>
                    <td className="py-2 px-3 font-mono">GPIO 19 (TRIG), GPIO 21 (ECHO)</td>
                    <td className="py-2 px-3 font-mono text-orange-600">Orange / Gold</td>
                    <td className="py-2 px-3 text-gray-600">Measures Recycled Storage Tank volume</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-gray-800">Potentiometer</td>
                    <td className="py-2 px-3 text-amber-700 font-semibold">Analog In</td>
                    <td className="py-2 px-3 font-mono">GPIO 34 (ADC1 Channel 6)</td>
                    <td className="py-2 px-3 font-mono text-purple-700">Purple</td>
                    <td className="py-2 px-3 text-gray-600">Analog Turbidity water quality (0–100 NTU)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-gray-800">Tactile Switch</td>
                    <td className="py-2 px-3 text-slate-700 font-semibold">Digital In</td>
                    <td className="py-2 px-3 font-mono">GPIO 0 (Active Low / Pullup)</td>
                    <td className="py-2 px-3 font-mono text-slate-500">Gray</td>
                    <td className="py-2 px-3 text-gray-600">Hardware interrupt for filtration pump toggle</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-gray-800">Pump Relay LED</td>
                    <td className="py-2 px-3 text-red-700 font-semibold">Actuator Out</td>
                    <td className="py-2 px-3 font-mono">GPIO 32 (Active High)</td>
                    <td className="py-2 px-3 font-mono text-red-600">Red</td>
                    <td className="py-2 px-3 text-gray-600">Drives 12V filtration pump relay switch</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-gray-800">Recycled LED</td>
                    <td className="py-2 px-3 text-sky-700 font-semibold">Status Out</td>
                    <td className="py-2 px-3 font-mono">GPIO 15 (Active High)</td>
                    <td className="py-2 px-3 font-mono text-blue-600">Blue</td>
                    <td className="py-2 px-3 text-gray-600">Illuminates when treated water is stored</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-gray-800">Reuse Valve LED</td>
                    <td className="py-2 px-3 text-yellow-700 font-semibold">Actuator Out</td>
                    <td className="py-2 px-3 font-mono">GPIO 2 (Active High)</td>
                    <td className="py-2 px-3 font-mono text-amber-600">Orange</td>
                    <td className="py-2 px-3 text-gray-600">Opens solenoid valve for toilet / garden reuse</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-gray-800">Heartbeat LED</td>
                    <td className="py-2 px-3 text-emerald-700 font-semibold">System Out</td>
                    <td className="py-2 px-3 font-mono">GPIO 25 (0.5Hz Blinking)</td>
                    <td className="py-2 px-3 font-mono text-emerald-600">Green</td>
                    <td className="py-2 px-3 text-gray-600">FreeRTOS RTOS task loop watchdog pulse</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
