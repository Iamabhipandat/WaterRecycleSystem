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
  Cpu,
  Layers,
  Sliders,
  Beaker,
  Sun,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";

export default function WaterCrisisPreview({ onLaunchSimulator, onGoToAuth, isInsideApp = false }) {
  const [activeTab, setActiveTab] = useState("crisis"); // "crisis" | "recycling" | "solution" | "quotes"
  const [familyMembers, setFamilyMembers] = useState(4);
  const [roLitersDaily, setRoLitersDaily] = useState(15);
  const [laundryLoadsWeekly, setLaundryLoadsWeekly] = useState(4);
  const [purificationStage, setPurificationStage] = useState(0); // 0 to 4
  const [hasPledged, setHasPledged] = useState(() => {
    return localStorage.getItem("jalloop.waterPledge") === "true";
  });
  const [pledgeCount, setPledgeCount] = useState(3842);

  // Calculations for Household Wastage in India
  const monthlyRoWaste = roLitersDaily * 3 * 30; // 1L pure = 3L reject
  const monthlyLaundryWaste = Math.round((laundryLoadsWeekly * 80 * 52) / 12); // ~80L rinse water per load
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

  // Interactive Purification Stages Data
  const PURIFICATION_STAGES = [
    {
      id: 0,
      name: "Raw Domestic Greywater",
      hindiName: "अशुद्ध घरेलू जल (कच्चा ग्रे-वाटर)",
      ntu: "110 NTU",
      odor: "Noticeable soap & mineral scent",
      pathogens: "Trace household bacteria",
      clarityColor: "bg-amber-700/60 border-amber-800",
      waterBg: "from-amber-200 via-stone-300 to-amber-100",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
      description: "Segregated non-sewage wastewater collected from RO purifier reject pipe, washing machine rinse discharge, and terrace roof runoff.",
      technicalDetails: "Contains dissolved minerals (TDS 450-800 ppm), micro-fibers, lint from fabrics, and mild non-toxic surfactants. Totally separate from toilet blackwater, making it 100% recyclable on-site.",
    },
    {
      id: 1,
      name: "Stage 1: 5-Micron Sediment Filter",
      hindiName: "चरण 1: 5-माइक्रोन सेडिमेंट फ़िल्टर",
      ntu: "42 NTU",
      odor: "Reduced particulate smell",
      pathogens: "Suspended matter removed",
      clarityColor: "bg-amber-500/40 border-amber-600",
      waterBg: "from-amber-100 via-emerald-100 to-teal-100",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      description: "Dense spun polypropylene melt-blown cartridge physically traps physical suspended solids, sand grit, fabric lint, hair, and rust flakes.",
      technicalDetails: "Pore size: 5 micrometers. Protects downstream carbon blocks from pore-clogging and protects booster pump impellers from abrasive mechanical wear.",
    },
    {
      id: 2,
      name: "Stage 2: Activated Coconut Carbon Block (CTO)",
      hindiName: "चरण 2: सक्रिय नारियल कार्बन ब्लॉक (CTO)",
      ntu: "12 NTU",
      odor: "Neutral / Completely odorless",
      pathogens: "Organic matter adsorbed",
      clarityColor: "bg-teal-400/30 border-teal-500",
      waterBg: "from-teal-100 via-cyan-100 to-blue-50",
      badgeColor: "bg-teal-50 text-teal-800 border-teal-200",
      description: "High-grade virgin coconut-shell activated carbon adsorbs dissolved detergents, optical brighteners, chlorine, pesticides, and residual organic surfactants.",
      technicalDetails: "Specific surface area > 1,000 m²/g. Chemical adsorption eliminates foam, yellow tint, and soapy feel, yielding transparent water with balanced surface tension.",
    },
    {
      id: 3,
      name: "Stage 3: Germicidal UV-C Disinfection (254nm)",
      hindiName: "चरण 3: जर्मिसाइडल यूवी-सी कीटाणुशोधन चेम्बर",
      ntu: "2.8 NTU",
      odor: "Pure & Fresh",
      pathogens: "99.9% Bacteria & viruses destroyed",
      clarityColor: "bg-cyan-500/20 border-cyan-400",
      waterBg: "from-cyan-100 via-sky-100 to-emerald-50",
      badgeColor: "bg-cyan-50 text-cyan-800 border-cyan-200",
      description: "Stainless steel chamber with high-output 254nm germicidal ultraviolet lamp penetrates microbial cell walls and shatters cellular DNA/RNA.",
      technicalDetails: "UV dosage: > 30 mJ/cm². Eradicates E. coli, coliforms, and spore-forming microbes without introducing any harsh chemicals or chlorine residues into the water.",
    },
    {
      id: 4,
      name: "Final Stage: Pure Recycled Secondary Distribution",
      hindiName: "अंतिम चरण: शुद्ध रिसायकल जल का पुन: उपयोग",
      ntu: "1.4 NTU (Pristine)",
      odor: "Crystal clear & fresh",
      pathogens: "Safe for human contact & secondary uses",
      clarityColor: "bg-emerald-500/20 border-emerald-500",
      waterBg: "from-emerald-100 via-cyan-50 to-sky-100",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
      description: "Clean water is stored in the 200L sealed recycled reservoir and pressurized on-demand for dual-flush toilets, balcony gardens, and floor washing.",
      technicalDetails: "Continuously checked by ESP32 analog turbidity probes. Automatic Cedar Safety Policies prevent pump running if water quality ever deviates from safe standards.",
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Hero Environmental Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-emerald-800/40">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles size={14} className="text-emerald-400" />
            <span>Smart Water Conservation Platform</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
            जल ही जीवन है — <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">Why India Needs JalLoop</span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
            Over <strong>600 million Indians</strong> face severe water stress, while typical urban households unknowingly flush thousands of liters of usable water down the drain every week. Discover the crisis, understand where the water goes, and see how our closed-loop smart system rescues it.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onLaunchSimulator}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs sm:text-sm hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <Play size={15} fill="currentColor" />
              <span>Launch Interactive Simulator (No Login Required)</span>
            </button>

            {onGoToAuth && !isInsideApp && (
              <button
                type="button"
                onClick={onGoToAuth}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all cursor-pointer"
              >
                <span>Sign In / Create Account</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4-Section Environmental Navigation Tabs */}
      <div className="flex bg-white rounded-2xl border border-gray-200 p-1.5 shadow-xs items-center gap-1.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("crisis")}
          className={`flex-1 min-w-[190px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "crisis"
              ? "bg-emerald-700 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <AlertTriangle size={15} className={activeTab === "crisis" ? "text-amber-300" : "text-amber-500"} />
          <span>1. India's Water Crisis (जल संकट)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("recycling")}
          className={`flex-1 min-w-[210px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "recycling"
              ? "bg-emerald-700 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <Beaker size={15} className={activeTab === "recycling" ? "text-cyan-300" : "text-cyan-600"} />
          <span>2. How We Recycle (कदम-दर-कदम तकनीक)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("solution")}
          className={`flex-1 min-w-[190px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "solution"
              ? "bg-emerald-700 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <RefreshCw size={15} className={activeTab === "solution" ? "text-emerald-300" : "text-emerald-600"} />
          <span>3. Home Blueprint &amp; Savings (बचत)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("quotes")}
          className={`flex-1 min-w-[190px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "quotes"
              ? "bg-emerald-700 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <Heart size={15} className={activeTab === "quotes" ? "text-rose-300" : "text-rose-500"} />
          <span>4. Quotes &amp; Pledge (प्रेरणा व संकल्प)</span>
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
                India ranks 120th out of 122 nations in the Global Water Quality Index due to untreated domestic discharge.
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
                  To give you <strong>1 liter of clean drinking water</strong>, standard RO purifiers discard <strong>3 liters of brine</strong> directly into the kitchen drain. An average 4-person family wastes <strong>35 to 50 Liters every single day</strong>.
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
                onClick={() => setActiveTab("recycling")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                <span>Step 2: Understand How We Recycle This Water</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PAGE 2: DETAILED RECYCLING PROCESS (KESE RECYCLE HOTA HAI)
          ───────────────────────────────────────────────────────────── */}
      {activeTab === "recycling" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Detailed Intro Header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-800 text-xs font-bold">
              <Beaker size={13} />
              <span>Full Engineering Breakdown &amp; Filtration Science</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              Kese Hum Water Ko Recycle Karenge? — The 5-Phase Purification Engineering
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-3xl">
              Water recycling often sounds complex, but JalLoop utilizes proven decentralized micro-filtration. By separating non-toxic <strong>greywater</strong> from blackwater (toilet sewage), the water can be completely sanitized and recycled on-site using simple, energy-efficient filtration.
            </p>
          </div>

          {/* Interactive Purification Stage Explorer */}
          <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-teal-800/40 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Interactive Purifier Explorer</span>
                <h3 className="text-lg sm:text-xl font-bold mt-0.5">Click Any Stage To See The Water Purify</h3>
              </div>
              <span className="text-xs font-mono px-3 py-1 bg-white/10 rounded-full border border-white/20 text-teal-200">
                Stage {purificationStage + 1} of 5
              </span>
            </div>

            {/* Stage Selector Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {PURIFICATION_STAGES.map((stg) => {
                const isActive = purificationStage === stg.id;
                return (
                  <button
                    key={stg.id}
                    type="button"
                    onClick={() => setPurificationStage(stg.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? "bg-white text-gray-900 border-teal-300 shadow-md font-bold"
                        : "bg-white/10 hover:bg-white/15 border-white/15 text-white/80"
                    }`}
                  >
                    <div className="text-[10px] font-mono opacity-80 uppercase">Stage {stg.id + 1}</div>
                    <div className="text-xs font-bold mt-1 line-clamp-1">{stg.name}</div>
                  </button>
                );
              })}
            </div>

            {/* Active Stage Deep Dive Display Card */}
            {(() => {
              const current = PURIFICATION_STAGES[purificationStage];
              return (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 sm:p-6 space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/15 pb-4">
                    <div>
                      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold mb-1.5 bg-teal-400/20 text-teal-300 border border-teal-400/30">
                        {current.hindiName}
                      </div>
                      <h4 className="text-xl font-black text-white">{current.name}</h4>
                    </div>

                    {/* Water Clarity Metric Pill */}
                    <div className="flex items-center gap-3 bg-black/30 px-4 py-2.5 rounded-xl border border-white/10 self-start md:self-auto">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Turbidity Index</span>
                        <span className="text-base font-black text-teal-300">{current.ntu}</span>
                      </div>
                      <div className="w-px h-8 bg-white/20" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Biological Safety</span>
                        <span className="text-xs font-bold text-emerald-300">{current.pathogens}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                    <div className="space-y-3">
                      <div>
                        <span className="font-bold text-teal-300 uppercase tracking-wider text-[11px] block">What Happens Here:</span>
                        <p className="mt-1 text-gray-200 leading-relaxed">{current.description}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                        <span className="font-bold text-emerald-300 text-[11px] block">⚙️ Technical &amp; Hardware Details:</span>
                        <p className="text-gray-300 leading-relaxed text-[11px]">{current.technicalDetails}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="font-bold text-teal-300 uppercase tracking-wider text-[11px] block">Sensory &amp; Chemical Purity:</span>
                      <div className="space-y-2 bg-black/20 p-4 rounded-xl border border-white/10">
                        <div className="flex justify-between items-center py-1 border-b border-white/10">
                          <span className="text-gray-400">Water Clarity:</span>
                          <span className="font-mono text-teal-200 font-bold">{current.ntu}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-white/10">
                          <span className="text-gray-400">Odor &amp; Scent:</span>
                          <span className="text-gray-200">{current.odor}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-400">Safety Gating:</span>
                          <span className="text-emerald-300 font-semibold">Cedar Policy Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* End-to-End Diagram Grid */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">The 4 Destination Networks</span>
              <h3 className="text-xl font-bold text-gray-900 mt-0.5">Where Does Recycled Water Go in a House?</h3>
              <p className="text-xs text-gray-500">Recycled water is pressurized into closed non-potable lines so clean municipal drinking water is never wasted on mundane tasks:</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">40%</div>
                  <h4 className="font-bold text-gray-900 text-xs">Toilet Flushing Cisterns</h4>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  The single biggest water drain in any home. Dual-flush tanks need only clear, pathogen-free water — saving up to 40,000L of fresh tap water yearly.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">30%</div>
                  <h4 className="font-bold text-gray-900 text-xs">Balcony &amp; Terrace Plants</h4>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  RO reject water contains natural dissolved calcium and magnesium ions that plants love. Drip irrigation keeps gardens green without guilt.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">20%</div>
                  <h4 className="font-bold text-gray-900 text-xs">Daily Floor Mopping</h4>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Carbon-filtered and UV-treated water leaves zero soap film or residue on marble or vitrified tiles, eliminating fresh bucket waste.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-cyan-200 bg-cyan-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-xs">10%</div>
                  <h4 className="font-bold text-gray-900 text-xs">Vehicle &amp; Exterior Wash</h4>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Supplies outdoor garden hose taps for washing cars and balconies. Zero waste of precious municipal potable water.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("crisis")}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back to Crisis Facts</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("solution")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                <span>Step 3: See Home Blueprint &amp; Savings</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PAGE 3: BLUEPRINT & HOUSEHOLD WATER SAVINGS
          ───────────────────────────────────────────────────────────── */}
      {activeTab === "solution" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Architecture Overview */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
                <RefreshCw size={13} />
                <span>The Closed-Loop Transformation</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                The Financial &amp; Environmental Transformation
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                How a home powered by JalLoop transforms daily routines, reduces tanker bills, and relieves groundwater strain:
              </p>
            </div>

            {/* Before vs After Comparison */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-100/80 px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">
                Transformation: Traditional Indian Home vs. JalLoop Powered Home
              </div>
              <div className="divide-y divide-gray-100 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 p-3.5 bg-white">
                  <span className="font-bold text-gray-800">Fresh Water Dependency</span>
                  <span className="text-rose-600 font-medium">100% reliant on municipal / borewell</span>
                  <span className="text-emerald-700 font-bold">Reduced by 65–75% via closed loop</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 p-3.5 bg-gray-50/50">
                  <span className="font-bold text-gray-800">RO Reject Water</span>
                  <span className="text-rose-600 font-medium">Flushed into sink (1,200L/mo wasted)</span>
                  <span className="text-emerald-700 font-bold">100% recovered for secondary use</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 p-3.5 bg-white">
                  <span className="font-bold text-gray-800">Summer Tanker Crisis</span>
                  <span className="text-rose-600 font-medium">Paying ₹1,500/tanker in peak summer</span>
                  <span className="text-emerald-700 font-bold">Self-sustained recycled supply buffer</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 p-3.5 bg-gray-50/50">
                  <span className="font-bold text-gray-800">Microcontroller &amp; Safety</span>
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
              <h3 className="text-xl font-bold mt-1">6 Everyday Habits Indian Families Can Adopt Right Now</h3>
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
                onClick={() => setActiveTab("recycling")}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back to Recycling Stages</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("quotes")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-xs font-bold transition-colors cursor-pointer"
              >
                <span>Step 4: Inspiring Quotes &amp; Water Pledge</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PAGE 4: INSPIRING QUOTES, PLEDGE & DEMO LAUNCH
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
                Watch simulated RO reject, washing machine runoff, and rainwater flow through 3 filtration stages, monitored by live ultrasonic sensors and ESP32 digital twin.
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
