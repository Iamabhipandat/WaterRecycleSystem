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
  const [turbidityVal, setTurbidityVal] = useState(displayState.turbidity || 24);
  const [collectionDistance, setCollectionDistance] = useState(15); // cm (30cm tank, 15cm = 50%)
  const [recycledDistance, setRecycledDistance] = useState(42); // cm (60cm tank, 42cm = 30%)
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [autoStream, setAutoStream] = useState(true);
  const [systemLedBlink, setSystemLedBlink] = useState(true);
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
    <div id="virtual-hardware" className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 shadow-2xs">
            <Cpu size={22} className="text-cyan-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                Virtual Hardware Workbench &amp; ESP32 Simulation
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300">
                Digital Twin
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Interactive ESP32 circuit with virtual ultrasonic sonars, turbidity potentiometer, pump switch &amp; LEDs
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("board")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "board" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Virtual Circuit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("terminal")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "terminal" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Terminal size={12} />
            Serial Monitor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("wokwi")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "wokwi" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <ExternalLink size={12} />
            Wokwi Diagram
          </button>
        </div>
      </div>

      {/* TAB 1: VIRTUAL CIRCUIT BREADBOARD */}
      {activeTab === "board" && (
        <div className="space-y-4">
          {/* Top Info Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-50/70 via-sky-50/50 to-blue-50/70 border border-cyan-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${systemLedBlink ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-gray-300"}`} />
              <span className="font-bold text-gray-800">
                ESP32 DevKit v1: <span className="text-emerald-700">ONLINE</span>
              </span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-600">Firmware: <code className="font-mono font-bold text-cyan-800">v2.0.0 (FreeRTOS)</code></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500">Move sliders below to simulate ultrasonic water levels &amp; turbidity</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* LEFT: SENSORS & PHYSICAL INPUTS (7 Columns) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                    <Sliders size={14} className="text-cyan-700" />
                    Virtual Ultrasonic Sonar &amp; Analog Sensors
                  </h3>
                  <span className="text-[10px] font-mono text-gray-400">GPIO Pins: 5, 18, 19, 21, 34</span>
                </div>

                {/* Sensor 1: HC-SR04 Collection Tank */}
                <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-gray-800">
                      <Radio size={14} className="text-blue-600" />
                      <span>HC-SR04 Sonar 1 (Collection Tank)</span>
                    </div>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
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
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>2 cm (Tank 100% Full)</span>
                    <span>Distance to water surface</span>
                    <span>30 cm (Tank Empty)</span>
                  </div>
                  <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono text-gray-500">
                    <span className="flex items-center gap-1 text-blue-700 font-bold">
                      <span>⚡ AWS DynamoDB:</span> JalLoopWaterMetrics
                    </span>
                    <span className="text-amber-700 font-bold">
                      <span>🔍 OpenSearch:</span> jalloop-water-telemetry
                    </span>
                  </div>
                </div>

                {/* Sensor 2: HC-SR04 Recycled Tank */}
                <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-gray-800">
                      <Radio size={14} className="text-sky-600" />
                      <span>HC-SR04 Sonar 2 (Recycled Storage Tank)</span>
                    </div>
                    <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
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
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>2 cm (Tank 100% Full)</span>
                    <span>Distance to water surface</span>
                    <span>60 cm (Tank Empty)</span>
                  </div>
                  <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono text-gray-500">
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <span>⚡ AWS DynamoDB:</span> JalLoopWaterMetrics
                    </span>
                    <span className="text-green-700 font-bold">
                      <span>🪣 S3:</span> jalloop-water-archive
                    </span>
                  </div>
                </div>

                {/* Sensor 3: Turbidity Potentiometer */}
                <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-gray-800">
                      <Activity size={14} className="text-amber-600" />
                      <span>Analog Turbidity Potentiometer (GPIO 34 ADC)</span>
                    </div>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded-md border text-xs ${
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
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>10 NTU (Crystal Clear)</span>
                    <span>WHO Non-potable Limit: 40 NTU</span>
                    <span>95 NTU (Heavy Sediment)</span>
                  </div>
                </div>

                {/* Tactile Microswitch Button: BTN_PUMP on GPIO 0 */}
                <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-gray-800 block">
                      Physical Push Button: <code className="font-mono text-cyan-800">BTN_PUMP (GPIO 0)</code>
                    </span>
                    <span className="text-[11px] text-gray-400">Hardware interrupt button to toggle filtration pump</span>
                  </div>
                  <button
                    type="button"
                    onClick={onTogglePump}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
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
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/60 space-y-3 h-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                    <Zap size={14} className="text-amber-500" />
                    Virtual ESP32 GPIO LEDs
                  </h3>
                  <span className="text-[10px] font-mono text-gray-400">Realtime Pin Status</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* System Heartbeat */}
                  <div className={`p-2.5 rounded-xl border transition-all ${systemLedBlink ? "bg-emerald-50 border-emerald-300" : "bg-white border-gray-200"}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full ${systemLedBlink ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-gray-300"}`} />
                      <div>
                        <span className="font-bold text-gray-900 block text-[11px]">LED_SYSTEM</span>
                        <span className="text-[10px] text-gray-400 font-mono">GPIO 25 (Blinking)</span>
                      </div>
                    </div>
                  </div>

                  {/* Pump LED */}
                  <div className={`p-2.5 rounded-xl border transition-all ${displayState.pumpRunning ? "bg-red-50 border-red-300" : "bg-white border-gray-200"}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full ${displayState.pumpRunning ? "bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse" : "bg-gray-300"}`} />
                      <div>
                        <span className="font-bold text-gray-900 block text-[11px]">LED_PUMP</span>
                        <span className="text-[10px] text-gray-400 font-mono">GPIO 32 (Relay)</span>
                      </div>
                    </div>
                  </div>

                  {/* RO LED */}
                  <div className={`p-2.5 rounded-xl border transition-all ${leds?.ro ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full ${leds?.ro ? "bg-blue-500 shadow-[0_0_8px_#3b82f6]" : "bg-gray-300"}`} />
                      <div>
                        <span className="font-bold text-gray-900 block text-[11px]">LED_RO</span>
                        <span className="text-[10px] text-gray-400 font-mono">GPIO 4 (RO Inflow)</span>
                      </div>
                    </div>
                  </div>

                  {/* Washing LED */}
                  <div className={`p-2.5 rounded-xl border transition-all ${leds?.washing ? "bg-cyan-50 border-cyan-300" : "bg-white border-gray-200"}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full ${leds?.washing ? "bg-cyan-500 shadow-[0_0_8px_#06b6d4]" : "bg-gray-300"}`} />
                      <div>
                        <span className="font-bold text-gray-900 block text-[11px]">LED_WASHING</span>
                        <span className="text-[10px] text-gray-400 font-mono">GPIO 12 (Washer)</span>
                      </div>
                    </div>
                  </div>

                  {/* Rain LED */}
                  <div className={`p-2.5 rounded-xl border transition-all ${leds?.rain ? "bg-sky-50 border-sky-300" : "bg-white border-gray-200"}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full ${leds?.rain ? "bg-sky-400 shadow-[0_0_8px_#38bdf8]" : "bg-gray-300"}`} />
                      <div>
                        <span className="font-bold text-gray-900 block text-[11px]">LED_RAIN</span>
                        <span className="text-[10px] text-gray-400 font-mono">GPIO 14 (Rainwater)</span>
                      </div>
                    </div>
                  </div>

                  {/* Filtration Stages */}
                  <div className={`p-2.5 rounded-xl border transition-all ${displayState.filtrationStage > 0 ? "bg-emerald-50 border-emerald-300" : "bg-white border-gray-200"}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full ${displayState.filtrationStage > 0 ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-gray-300"}`} />
                      <div>
                        <span className="font-bold text-gray-900 block text-[11px]">LED_FILTER</span>
                        <span className="text-[10px] text-gray-400 font-mono">GPIO 26/16/33 (F{displayState.filtrationStage})</span>
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-4 h-4 rounded-full ${
                          leds?.recycled
                            ? "bg-sky-500 shadow-[0_0_12px_#0284c7] ring-2 ring-sky-300 animate-pulse"
                            : "bg-gray-300"
                        }`} />
                        <div>
                          <span className="font-bold text-gray-900 text-xs block">
                            LED 1: Recycled Storing Light
                          </span>
                          <span className="text-[10px] font-mono text-sky-800 font-semibold">
                            Pin: GPIO 15 (LED_RECYCLED)
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-4 h-4 rounded-full ${
                          leds?.reuse
                            ? "bg-emerald-500 shadow-[0_0_12px_#10b981] ring-2 ring-emerald-300 animate-pulse"
                            : "bg-gray-300"
                        }`} />
                        <div>
                          <span className="font-bold text-gray-900 text-xs block">
                            LED 2: Reused Water Distribution Light
                          </span>
                          <span className="text-[10px] font-mono text-emerald-800 font-semibold">
                            Pins: GPIO 2, 17, 13 (Sol Valves)
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onToggleReuse}
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full transition-colors ${
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
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono font-bold text-gray-800">COM3 (Virtual ESP32 Serial @ 115200 Baud)</span>
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

          <div className="bg-gray-950 text-gray-200 font-mono text-[11px] p-4 rounded-2xl h-72 overflow-y-auto space-y-1 shadow-inner border border-gray-800">
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

      {/* TAB 3: WOKWI SIMULATOR FILES & DIAGRAM */}
      {activeTab === "wokwi" && (
        <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Wokwi Full Circuit Simulation Spec</h3>
              <p className="text-xs text-gray-500">
                You can run this exact circuit in Wokwi Simulator or copy to wokwi.com with one click.
              </p>
            </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-xl border border-gray-200">
              <span className="font-bold text-gray-800 block mb-1">wokwi/diagram.json</span>
              <p className="text-gray-500 text-[11px]">
                Defines the ESP32 DevKit, 3× HC-SR04 sonars, potentiometer, resistors, and LED connections.
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-gray-200">
              <span className="font-bold text-gray-800 block mb-1">wokwi/sketch.ino</span>
              <p className="text-gray-500 text-[11px]">
                Arduino C++ firmware that samples distance sensors, analog turbidity, and toggles hardware pins.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
