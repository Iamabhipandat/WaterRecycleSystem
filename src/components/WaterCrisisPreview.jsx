import { useState } from "react";
import {
  Droplets,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Heart,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Users,
  Award,
  Play,
  Filter,
  Home,
  Globe,
  TrendingDown,
  Quote,
  Zap,
  Info,
  Check,
  ChevronRight,
} from "lucide-react";

export default function WaterCrisisPreview({ onLaunchSimulator, onGoToAuth, isInsideApp = false }) {
  const [activeTab, setActiveTab] = useState("crisis"); // "crisis" | "solution" | "quotes"
  const [familyMembers, setFamilyMembers] = useState(4);
  const [roLitersDaily, setRoLitersDaily] = useState(15);
  const [laundryLoadsWeekly, setLaundryLoadsWeekly] = useState(4);
  const [hasPledged, setHasPledged] = useState(() => {
    return localStorage.getItem("jalloop.waterPledge") === "true";
  });
  const [pledgeCount, setPledgeCount] = useState(3842);

  // Calculations for Household Wastage in India
  // 1L RO drinking water = ~3L reject water
  const monthlyRoWaste = roLitersDaily * 3 * 30;
  // 1 laundry load = ~80L rinse water
  const monthlyLaundryWaste = Math.round((laundryLoadsWeekly * 80 * 52) / 12);
  const totalMonthlyWaste = monthlyRoWaste + monthlyLaundryWaste;
  const annualWasteLiters = totalMonthlyWaste * 12;
  const tankerDeliveriesWasted = (annualWasteLiters / 5000).toFixed(1);

  const handlePledge = () => {
    if (!hasPledged) {
      setHasPledged(true);
      setPledgeCount((prev) => prev + 1);
      localStorage.setItem("jalloop.waterPledge", "true");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Hero Environmental Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-emerald-800/40">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles size={14} className="text-emerald-400" />
            <span>Public Awareness &amp; Environmental Mission</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
            जल ही जीवन है — <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">Why India Needs JalLoop</span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
            Over <strong>600 million Indians</strong> face severe water stress daily, while typical urban households unknowingly flush thousands of liters of usable water down the drain every week. Discover the crisis, understand where the water goes, and explore how our closed-loop smart system rescues it.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onLaunchSimulator}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs sm:text-sm hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <Play size={15} fill="currentColor" />
              <span>Explore Live System Simulator (No Login Required)</span>
            </button>

            {onGoToAuth && !isInsideApp && (
              <button
                type="button"
                onClick={onGoToAuth}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all cursor-pointer"
              >
                <span>Login / Register Account</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3-Section Environmental Navigation Tabs */}
      <div className="flex bg-white rounded-2xl border border-gray-200 p-1.5 shadow-xs items-center gap-1.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("crisis")}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "crisis"
              ? "bg-emerald-700 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <AlertTriangle size={16} className={activeTab === "crisis" ? "text-amber-300" : "text-amber-500"} />
          <span>1. The Water Crisis in India (जल संकट)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("solution")}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "solution"
              ? "bg-emerald-700 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <RefreshCw size={16} className={activeTab === "solution" ? "text-cyan-300" : "text-cyan-600"} />
          <span>2. The JalLoop Solution (हमारा समाधान)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("quotes")}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "quotes"
              ? "bg-emerald-700 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <Heart size={16} className={activeTab === "quotes" ? "text-rose-300" : "text-rose-500"} />
          <span>3. Quotes, Pledge &amp; Demo (प्रेरणा व संकल्प)</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 1: THE CRISIS IN INDIA & HOUSEHOLD WASTAGE
          ───────────────────────────────────────────────────────────── */}
      {activeTab === "crisis" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Key Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-rose-200/80 p-5 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Globe size={20} />
              </div>
              <div className="text-2xl font-black text-gray-900">600 Million</div>
              <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">High Water Stress</div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Nearly half of India's population faces extreme to severe water scarcity every single year (NITI Aayog Report).
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <TrendingDown size={20} />
              </div>
              <div className="text-2xl font-black text-gray-900">21 Major Cities</div>
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">Groundwater Depleted</div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Bengaluru, Delhi, Hyderabad, and Chennai are rapidly exhausting their deeper non-replenishable aquifers.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-teal-200/80 p-5 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <Filter size={20} />
              </div>
              <div className="text-2xl font-black text-gray-900">70% Water</div>
              <div className="text-xs font-bold text-teal-700 uppercase tracking-wider">Contaminated Supply</div>
              <p className="text-xs text-gray-500 leading-relaxed">
                India ranks 120th out of 122 nations in the Global Water Quality Index due to untreated industrial &amp; domestic discharge.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-blue-200/80 p-5 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Droplets size={20} />
              </div>
              <div className="text-2xl font-black text-gray-900">135+ Liters</div>
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">Per Person / Day</div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Average urban daily consumption, of which up to 70% is drained as lightly soiled greywater suitable for secondary reuse.
              </p>
            </div>
          </div>

          {/* Deep Dive: How Indian Homes Waste Water Everyday */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold mb-2">
                <AlertTriangle size={13} />
                <span>The Bleeding Taps of Urban India</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Kese Hamare Gharon Se Paani Waste Ho Raha Hai?
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Most people believe water wastage is just leaving taps running. In reality, modern household appliances create three silent, massive drains:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Point 1: RO Purifiers */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-sm">
                    1
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">RO Purifier Reject (The 3:1 Ratio)</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  To give you <strong>1 liter of clean drinking water</strong>, standard RO purifiers discard <strong>3 liters of brine</strong> directly into the kitchen drain. An average 4-person family wastes <strong>35 to 50 Liters every day</strong>.
                </p>
                <div className="bg-white rounded-xl p-3 border border-amber-200/60 text-[11px] text-amber-900 font-medium">
                  💡 <strong>Reality:</strong> This reject water has zero bacteria and is mineral-rich. It is perfect for flushing, mopping, and garden plants.
                </div>
              </div>

              {/* Point 2: Washing Machines */}
              <div className="rounded-2xl border border-cyan-200 bg-cyan-50/40 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-black text-sm">
                    2
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">Washing Machine Rinses</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  A single full laundry cycle expels <strong>60 to 100 liters of water</strong>. The final 2 rinse cycles carry almost no dirt and negligible detergent, yet they are flushed straight into the municipal sewer.
                </p>
                <div className="bg-white rounded-xl p-3 border border-cyan-200/60 text-[11px] text-cyan-900 font-medium">
                  💡 <strong>Reality:</strong> After basic sediment and carbon filtering, this greywater can fulfill 100% of toilet flushing requirements.
                </div>
              </div>

              {/* Point 3: Rainwater Loss */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                    3
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">Lost Terrace Rainwater</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  A typical 1,000 sq.ft terrace in India receives over <strong>1,00,000 liters of rainwater</strong> during monsoon season. Over 85% runs off into storm drains and floods roads instead of recharging groundwater.
                </p>
                <div className="bg-white rounded-xl p-3 border border-emerald-200/60 text-[11px] text-emerald-900 font-medium">
                  💡 <strong>Reality:</strong> Capturing terrace runoff into a buffer tank provides free, ultra-pure water for 3 to 4 months of dry summer.
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Wastage Calculator */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 rounded-2xl border border-emerald-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Interactive Estimator</span>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">Calculate Your Home's Water Wastage</h3>
                <p className="text-xs text-gray-600">See how much usable water your family can save each month with JalLoop.</p>
              </div>
              <div className="bg-emerald-700 text-white px-4 py-2 rounded-xl text-center self-start sm:self-auto shadow-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200 block">Estimated Savings</span>
                <span className="text-lg font-black">{totalMonthlyWaste.toLocaleString()} Liters / Month</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Slider 1: Family Size */}
              <div className="bg-white rounded-xl p-4 border border-emerald-200/80 shadow-xs space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                  <span>Family Members</span>
                  <span className="text-emerald-700 font-black text-sm">{familyMembers} People</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={familyMembers}
                  onChange={(e) => setFamilyMembers(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <span className="text-[10px] text-gray-400 block">Urban Indian household average: 4 members</span>
              </div>

              {/* Slider 2: RO Drinking Water */}
              <div className="bg-white rounded-xl p-4 border border-emerald-200/80 shadow-xs space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                  <span>RO Drinking Water Daily</span>
                  <span className="text-emerald-700 font-black text-sm">{roLitersDaily} L / day</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={roLitersDaily}
                  onChange={(e) => setRoLitersDaily(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <span className="text-[10px] text-gray-400 block">Wastes ~{roLitersDaily * 3}L reject water each day</span>
              </div>

              {/* Slider 3: Laundry Loads */}
              <div className="bg-white rounded-xl p-4 border border-emerald-200/80 shadow-xs space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                  <span>Washing Machine Loads</span>
                  <span className="text-emerald-700 font-black text-sm">{laundryLoadsWeekly} Loads / week</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={laundryLoadsWeekly}
                  onChange={(e) => setLaundryLoadsWeekly(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <span className="text-[10px] text-gray-400 block">Dumps ~{laundryLoadsWeekly * 80}L rinse water each week</span>
              </div>
            </div>

            {/* Impact Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-emerald-200 text-center">
                <span className="text-[10px] font-bold uppercase text-gray-500 block">Annual Waste</span>
                <span className="text-base font-black text-rose-700">{annualWasteLiters.toLocaleString()} L</span>
              </div>

              <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-emerald-200 text-center">
                <span className="text-[10px] font-bold uppercase text-gray-500 block">Water Tankers</span>
                <span className="text-base font-black text-amber-700">{tankerDeliveriesWasted} Tankers</span>
              </div>

              <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-emerald-200 text-center">
                <span className="text-[10px] font-bold uppercase text-gray-500 block">Flushes Powered</span>
                <span className="text-base font-black text-emerald-700">{Math.round(totalMonthlyWaste / 6)} Flushes/mo</span>
              </div>

              <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-emerald-200 text-center">
                <span className="text-[10px] font-bold uppercase text-gray-500 block">Water Bill Cut</span>
                <span className="text-base font-black text-teal-700">~65% Monthly</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("solution")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                <span>See How JalLoop Rescues This Water</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PAGE 2: THE JALLOOP SOLUTION & CONSERVATION BLUEPRINT
          ───────────────────────────────────────────────────────────── */}
      {activeTab === "solution" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Architecture Overview */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
                <RefreshCw size={13} />
                <span>The Closed-Loop Engineering Model</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Kese Bacha Sakte Hain? — JalLoop Ka Closed-Loop Solution
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Instead of waiting for expensive centralized sewage treatment plants, JalLoop intercepts greywater right at the point of origin.
              </p>
            </div>

            {/* 4 Step Process Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-gray-200 p-4 space-y-2 bg-gray-50/50">
                <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">1</span>
                <h4 className="font-bold text-gray-900 text-sm">Segregated Inflow</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Three dedicated lines channel RO reject, washing machine rinse water, and terrace rainwater into the 100L primary collection tank.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4 space-y-2 bg-gray-50/50">
                <span className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center text-xs font-bold">2</span>
                <h4 className="font-bold text-gray-900 text-sm">3-Stage Micro Filtration</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Water passes through a 5µm sediment filter (lint/sand), activated coconut carbon (surfactants/odor), and high-intensity UV-C disinfection.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4 space-y-2 bg-gray-50/50">
                <span className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center text-xs font-bold">3</span>
                <h4 className="font-bold text-gray-900 text-sm">ESP32 IoT Automation</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Ultrasonic level sensors and analog turbidity probes monitor water clarity. Automatic safety lockouts prevent pump cavitation or murky water recycling.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4 space-y-2 bg-gray-50/50">
                <span className="w-7 h-7 rounded-lg bg-cyan-700 text-white flex items-center justify-center text-xs font-bold">4</span>
                <h4 className="font-bold text-gray-900 text-sm">Direct Distribution</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  The pure recycled water fills toilet flush cisterns, nourishes terrace plants, and supplies car wash taps — eliminating fresh municipal water waste.
                </p>
              </div>
            </div>

            {/* Before vs After Comparison */}
            <div className="mt-4 rounded-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-100/80 px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">
                Transformation: Traditional Indian Home vs. JalLoop Powered Home
              </div>
              <div className="divide-y divide-gray-100 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 p-3.5 bg-white">
                  <span className="font-bold text-gray-800">Fresh Water Dependency</span>
                  <span className="text-rose-600">100% reliant on municipal / borewell</span>
                  <span className="text-emerald-700 font-bold">Reduced by 65–75% via recycling</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 p-3.5 bg-gray-50/50">
                  <span className="font-bold text-gray-800">RO Reject Water</span>
                  <span className="text-rose-600">Poured down the sink (1,200L/mo lost)</span>
                  <span className="text-emerald-700 font-bold">100% recovered for secondary use</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 p-3.5 bg-white">
                  <span className="font-bold text-gray-800">Summer Tanker Crisis</span>
                  <span className="text-rose-600">Buying ₹1,500/tanker during peak heat</span>
                  <span className="text-emerald-700 font-bold">Continuous self-sustained closed loop</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 p-3.5 bg-gray-50/50">
                  <span className="font-bold text-gray-800">Hardware &amp; Safety</span>
                  <span className="text-gray-500">Manual buckets, overflow spills</span>
                  <span className="text-emerald-700 font-bold">Automated ESP32 relay with safety policies</span>
                </div>
              </div>
            </div>
          </div>

          {/* Practical Water Conservation Habits For Everyday Life */}
          <div className="bg-emerald-900 text-white rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Daily Conservation Blueprint</span>
              <h3 className="text-xl font-bold mt-1">6 Simple Habits Every Family Can Adopt Right Now</h3>
              <p className="text-xs text-emerald-200/80">Combine these with JalLoop to maximize freshwater preservation:</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-xl bg-emerald-800/60 border border-emerald-700 p-4 space-y-1.5">
                <div className="text-xs font-bold text-emerald-300">1. Tap Aerators (₹80 fix)</div>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Screw aerators onto washbasin taps to mix air with water. Cuts tap flow rate by 50% without reducing water pressure.
                </p>
              </div>

              <div className="rounded-xl bg-emerald-800/60 border border-emerald-700 p-4 space-y-1.5">
                <div className="text-xs font-bold text-emerald-300">2. Bucket Bath vs Shower</div>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  A 10-minute shower consumes ~100 to 120 liters. A single 18-liter bucket bath saves over 80 liters every morning.
                </p>
              </div>

              <div className="rounded-xl bg-emerald-800/60 border border-emerald-700 p-4 space-y-1.5">
                <div className="text-xs font-bold text-emerald-300">3. Stop Tap While Brushing</div>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Letting the tap run while brushing wastes 6 to 12 liters every session. Turn it on only when actively rinsing.
                </p>
              </div>

              <div className="rounded-xl bg-emerald-800/60 border border-emerald-700 p-4 space-y-1.5">
                <div className="text-xs font-bold text-emerald-300">4. Fix Cistern Leaks</div>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  A silent trickle leak in a flush toilet wastes up to 200 liters every day. Put food coloring in the tank to detect leaks.
                </p>
              </div>

              <div className="rounded-xl bg-emerald-800/60 border border-emerald-700 p-4 space-y-1.5">
                <div className="text-xs font-bold text-emerald-300">5. Water Plants at Dusk</div>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Watering gardens in the morning or midday loses up to 40% to evaporation. Water at sunset so roots absorb every drop.
                </p>
              </div>

              <div className="rounded-xl bg-emerald-800/60 border border-emerald-700 p-4 space-y-1.5">
                <div className="text-xs font-bold text-emerald-300">6. Full Laundry Loads</div>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Run washing machines only when full. Washing two half-loads consumes double the water and double the electricity.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("crisis")}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back to Crisis Facts</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("quotes")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-xs font-bold transition-colors cursor-pointer"
              >
                <span>Inspirational Quotes &amp; Pledge</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PAGE 3: INSPIRING QUOTES, PLEDGE & DEMO LAUNCH
          ───────────────────────────────────────────────────────────── */}
      {activeTab === "quotes" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quotes Section */}
          <div className="space-y-4">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Words of Wisdom</span>
              <h2 className="text-2xl font-bold text-gray-900">Quotes That Touch The Conscience</h2>
              <p className="text-xs text-gray-500">Every drop of water is a gift from nature. Let these thoughts guide our actions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Quote 1 */}
              <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-emerald-400 transition-all">
                <div className="space-y-3">
                  <Quote size={28} className="text-emerald-500/40" />
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed italic">
                    &ldquo;जल ही जीवन है, और जल का संरक्षण ही हमारा कल है।&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-xs text-emerald-700 font-bold">
                  <span>भारतीय लोकोक्ति</span>
                  <span className="text-[10px] text-gray-400 font-normal">Ancient Wisdom</span>
                </div>
              </div>

              {/* Quote 2 */}
              <div className="bg-white rounded-2xl border border-teal-200 p-6 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-teal-400 transition-all">
                <div className="space-y-3">
                  <Quote size={28} className="text-teal-500/40" />
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed italic">
                    &ldquo;Thousands have lived without love, not one without water.&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-xs text-teal-700 font-bold">
                  <span>W. H. Auden</span>
                  <span className="text-[10px] text-gray-400 font-normal">Poet &amp; Thinker</span>
                </div>
              </div>

              {/* Quote 3 */}
              <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-blue-400 transition-all">
                <div className="space-y-3">
                  <Quote size={28} className="text-blue-500/40" />
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed italic">
                    &ldquo;When the well&rsquo;s dry, we know the worth of water.&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-xs text-blue-700 font-bold">
                  <span>Benjamin Franklin</span>
                  <span className="text-[10px] text-gray-400 font-normal">Statesman &amp; Scientist</span>
                </div>
              </div>

              {/* Quote 4 */}
              <div className="bg-white rounded-2xl border border-cyan-200 p-6 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-cyan-400 transition-all">
                <div className="space-y-3">
                  <Quote size={28} className="text-cyan-500/40" />
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed italic">
                    &ldquo;पानी की एक-एक बूँद बचाएं, आने वाली पीढ़ी को प्यास से बचाएं।&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-xs text-cyan-700 font-bold">
                  <span>राष्ट्र संदेश</span>
                  <span className="text-[10px] text-gray-400 font-normal">Conservation Movement</span>
                </div>
              </div>

              {/* Quote 5 */}
              <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-amber-400 transition-all">
                <div className="space-y-3">
                  <Quote size={28} className="text-amber-500/40" />
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed italic">
                    &ldquo;The water you waste today is the water someone will pray for tomorrow.&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-xs text-amber-700 font-bold">
                  <span>Global Conscience</span>
                  <span className="text-[10px] text-gray-400 font-normal">Humanitarian Principle</span>
                </div>
              </div>

              {/* Quote 6 */}
              <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-emerald-400 transition-all">
                <div className="space-y-3">
                  <Quote size={28} className="text-emerald-500/40" />
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed italic">
                    &ldquo;Earth provides enough to satisfy every man&rsquo;s needs, but not every man&rsquo;s greed.&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-xs text-emerald-700 font-bold">
                  <span>Mahatma Gandhi</span>
                  <span className="text-[10px] text-gray-400 font-normal">Father of the Nation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Citizen Water Pledge Card */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <Award size={14} />
                <span>The 1-Drop Pledge (एक बूँद संकल्प)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">Commit To Never Wasting A Drop Again</h3>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Join <strong>{pledgeCount.toLocaleString()}</strong> citizens who have pledged to repurpose RO reject water, install tap aerators, and adopt closed-loop greywater recycling.
              </p>
            </div>

            <div className="shrink-0 text-center">
              {hasPledged ? (
                <div className="flex flex-col items-center gap-2 bg-emerald-900/60 border border-emerald-400/40 px-6 py-4 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center">
                    <Check size={20} strokeWidth={3} />
                  </div>
                  <span className="text-xs font-bold text-emerald-200">You Have Taken The Pledge!</span>
                  <span className="text-[11px] text-emerald-300/80">Certified Water Guardian 🌱</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handlePledge}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-gray-950 font-bold text-xs sm:text-sm hover:from-emerald-300 hover:to-teal-300 shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <Heart size={16} fill="currentColor" />
                  <span>Take The Water Pledge</span>
                </button>
              )}
            </div>
          </div>

          {/* Final Call to Action: Launch Simulator & Explore App */}
          <div className="bg-white rounded-2xl border-2 border-emerald-600/30 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Ready to Experience It Live?</span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                Explore the JalLoop Interactive System
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-xl">
                Watch how simulated RO reject, washing machine runoff, and rainwater flow through 3 filtration stages, monitored by live ultrasonic sensors and ESP32 digital twin.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onLaunchSimulator}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <Play size={16} fill="currentColor" />
                <span>Launch Interactive Demo</span>
              </button>

              {onGoToAuth && !isInsideApp && (
                <button
                  type="button"
                  onClick={onGoToAuth}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <span>Sign In / Create Account</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
