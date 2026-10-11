import { useState, useRef } from "react";
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
  Search,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

export default function LandingPage({ onLaunchSimulator, onGoToAuth }) {
  const [activeSection, setActiveSection] = useState("overview"); // "overview" | "crisis" | "recycling" | "calculator" | "habits" | "quotes"
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
      description: "Clean water is stored in the 200L sealed recycled reservoir and pressurized on-demand for dual-flush toilets, balcony gardens, and floor washing.",
      technicalDetails: "Continuously checked by ESP32 analog turbidity probes. Automatic Cedar Safety Policies prevent pump running if water quality ever deviates from safe standards.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP UTILITY HEADER BAR (Just like AWS Global Header)
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 sm:px-8 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
            <Globe size={13} className="text-emerald-400" />
            <span>India (National Water Mission)</span>
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <a
            href="https://wokwi.com"
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline hover:text-white transition-colors"
          >
            ESP32 Wokwi Hardware Sim
          </a>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline hover:text-white transition-colors">
            NITI Aayog Water Index Reference
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onLaunchSimulator}
            className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
          >
            Live Simulator Preview
          </button>
          <span className="text-slate-600">|</span>
          <button
            type="button"
            onClick={onGoToAuth}
            className="hover:text-white font-medium cursor-pointer"
          >
            Sign in
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN ENTERPRISE HEADER (Brand + Nav + CTAs)
          ───────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveSection("overview")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-700 group-hover:bg-emerald-800 transition-colors flex items-center justify-center text-white shadow-xs">
              <Droplets size={20} />
            </div>
            <div>
              <span className="text-lg font-black text-gray-900 tracking-tight">JalLoop</span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Smart Water Recycling
              </span>
            </div>
          </div>

          {/* Center Navigation Links (AWS style) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-gray-700">
            <button
              type="button"
              onClick={() => setActiveSection("overview")}
              className={`hover:text-emerald-700 transition-colors cursor-pointer ${
                activeSection === "overview" ? "text-emerald-700 border-b-2 border-emerald-700 pb-0.5" : ""
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("crisis")}
              className={`hover:text-emerald-700 transition-colors cursor-pointer ${
                activeSection === "crisis" ? "text-emerald-700 border-b-2 border-emerald-700 pb-0.5" : ""
              }`}
            >
              Water Crisis in India
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("recycling")}
              className={`hover:text-emerald-700 transition-colors cursor-pointer ${
                activeSection === "recycling" ? "text-emerald-700 border-b-2 border-emerald-700 pb-0.5" : ""
              }`}
            >
              How We Recycle
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("calculator")}
              className={`hover:text-emerald-700 transition-colors cursor-pointer ${
                activeSection === "calculator" ? "text-emerald-700 border-b-2 border-emerald-700 pb-0.5" : ""
              }`}
            >
              Wastage Calculator
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("quotes")}
              className={`hover:text-emerald-700 transition-colors cursor-pointer ${
                activeSection === "quotes" ? "text-emerald-700 border-b-2 border-emerald-700 pb-0.5" : ""
              }`}
            >
              Quotes &amp; Pledge
            </button>
          </nav>

          {/* Right Action Tools (Exact AWS Pill Layout) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onGoToAuth}
              className="text-xs font-bold text-gray-700 hover:text-emerald-800 transition-colors cursor-pointer hidden sm:block"
            >
              Sign in
            </button>

            <button
              type="button"
              onClick={onLaunchSimulator}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Play size={13} fill="currentColor" className="text-emerald-400" />
              <span>Launch Live Simulator</span>
            </button>

            <button
              type="button"
              onClick={onGoToAuth}
              className="px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Create free account
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          3. SUB-NAV STICKY PILL BAR (Exact Replica of AWS Pill Bar in screenshot)
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-[61px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 font-bold text-sm text-gray-900 shrink-0">
            <span>JalLoop Platform</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-gray-600 shrink-0">
            <button
              type="button"
              onClick={() => setActiveSection("overview")}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeSection === "overview"
                  ? "bg-slate-900 text-white font-bold"
                  : "hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("crisis")}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeSection === "crisis"
                  ? "bg-slate-900 text-white font-bold"
                  : "hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              Crisis &amp; Stats
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("recycling")}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeSection === "recycling"
                  ? "bg-slate-900 text-white font-bold"
                  : "hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              How We Recycle
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("calculator")}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeSection === "calculator"
                  ? "bg-slate-900 text-white font-bold"
                  : "hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              Wastage Calculator
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("habits")}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeSection === "habits"
                  ? "bg-slate-900 text-white font-bold"
                  : "hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              Home Blueprint
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("quotes")}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeSection === "quotes"
                  ? "bg-slate-900 text-white font-bold"
                  : "hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              Quotes &amp; Pledge
            </button>
          </div>

          <div className="shrink-0 hidden md:block">
            <button
              type="button"
              onClick={onLaunchSimulator}
              className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Test Interactive Simulator</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. HERO SECTION (Exact Typography & Button Layout as AWS Screenshot)
          ───────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-white via-emerald-50/40 to-slate-50 border-b border-gray-200 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Breadcrumb (Exact AWS Style) */}
          <div className="text-xs text-gray-500 font-medium mb-4 flex items-center gap-1.5">
            <span className="hover:text-emerald-700 cursor-pointer">JalLoop</span>
            <span>&rsaquo;</span>
            <span className="text-gray-900 font-semibold">Smart Water Recycling System</span>
          </div>

          <div className="max-w-4xl space-y-4">
            <h1 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight leading-tight">
              JalLoop Smart Water Recycling
            </h1>

            <p className="text-base sm:text-xl text-gray-600 font-normal leading-relaxed">
              Combat India&rsquo;s water crisis: turn domestic RO reject, washing machine rinse water, and terrace rainwater into clean, safe recycled water for flushing and gardens.
            </p>

            {/* AWS-style dual CTA buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-4">
              <button
                type="button"
                onClick={onLaunchSimulator}
                className="px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Play size={15} fill="currentColor" className="text-emerald-400" />
                <span>Launch live simulator</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("recycling")}
                className="px-6 py-3 rounded-full bg-white hover:bg-gray-50 text-gray-900 font-bold text-xs sm:text-sm border-2 border-gray-900 transition-all cursor-pointer"
              >
                Explore how we recycle
              </button>

              <button
                type="button"
                onClick={onGoToAuth}
                className="px-6 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              >
                Create a free account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. FEATURE BANNER (Promo Card like the green banner in screenshot)
          ───────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-6">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-700 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30">
              <Sparkles size={13} />
              <span>National Impact: 65% - 75% Fresh Water Saved</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Save up to 12,000 Liters of fresh drinking water every month
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Decentralized, on-site micro-recycling for Indian apartments and homes. Zero sewage mixing, automated ESP32 sensing, and automatic Cedar policy safety lockouts.
            </p>
          </div>

          <button
            type="button"
            onClick={onLaunchSimulator}
            className="shrink-0 px-6 py-3.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            <span>Test System Pipeline Now</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. MAIN CONTENT BODY (Dynamic Switcher Sections)
          ───────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-12">
        {/* SECTION 1: OVERVIEW & CRISIS CARDS */}
        {(activeSection === "overview" || activeSection === "crisis") && (
          <section className="space-y-8 animate-fadeIn">
            <div className="border-b border-gray-200 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">The Bleeding Taps of India</span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-950 mt-1">
                India&rsquo;s Looming Water Crisis &amp; Household Drains
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Data from the NITI Aayog Composite Water Management Index highlights why domestic conservation is urgent:
              </p>
            </div>

            {/* 4 Big Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-2 hover:border-emerald-500 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Globe size={20} />
                </div>
                <div className="text-2xl font-black text-gray-950">600 Million</div>
                <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">High Water Stress</div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Nearly half of India&rsquo;s population experiences extreme to severe water scarcity every single year.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-2 hover:border-emerald-500 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <TrendingDown size={20} />
                </div>
                <div className="text-2xl font-black text-gray-950">21 Major Cities</div>
                <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">Groundwater Depleted</div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Bengaluru, Delhi, Hyderabad, and Chennai are rapidly exhausting their deeper non-replenishable aquifers.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-2 hover:border-emerald-500 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Filter size={20} />
                </div>
                <div className="text-2xl font-black text-gray-950">70% Water</div>
                <div className="text-xs font-bold text-teal-700 uppercase tracking-wider">Contaminated Supply</div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  India ranks 120th out of 122 nations in the Global Water Quality Index due to untreated domestic discharge.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-2 hover:border-emerald-500 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Droplets size={20} />
                </div>
                <div className="text-2xl font-black text-gray-950">135+ Liters</div>
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">Per Person / Day</div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Average urban daily consumption, of which up to 70% is drained as lightly soiled greywater suitable for secondary reuse.
                </p>
              </div>
            </div>

            {/* The 3 Silent Drains in Urban Indian Homes */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="text-xl font-bold text-gray-900">
                Kese Hamare Gharon Se Paani Waste Ho Raha Hai? (The 3 Silent Drains)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">1</span>
                    <h4 className="font-bold text-gray-900 text-sm">RO Purifier Reject (The 3:1 Ratio)</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    To give you <strong>1 liter of pure drinking water</strong>, domestic RO filters discard <strong>3 liters of mineral brine</strong> straight down the sink drain. A 4-person family loses <strong>35 to 50 Liters every single day</strong>.
                  </p>
                  <div className="bg-white rounded-xl p-3 border border-amber-200 text-[11px] text-amber-900 font-medium">
                    💡 <strong>Truth:</strong> Zero bacteria. Perfect for toilet flushing, floor mopping, and garden plants.
                  </div>
                </div>

                <div className="rounded-2xl border border-cyan-200 bg-cyan-50/40 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-xs">2</span>
                    <h4 className="font-bold text-gray-900 text-sm">Washing Machine Rinses</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    A single wash load expels <strong>60 to 100 liters of water</strong>. The final 2 rinse cycles carry almost no dirt and negligible detergent, yet they are flushed into municipal sewage.
                  </p>
                  <div className="bg-white rounded-xl p-3 border border-cyan-200 text-[11px] text-cyan-900 font-medium">
                    💡 <strong>Truth:</strong> Sediment and carbon filtration prepares this greywater for 100% of flushing needs.
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">3</span>
                    <h4 className="font-bold text-gray-900 text-sm">Lost Terrace Rainwater</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    A 1,000 sq.ft terrace receives over <strong>1,00,000 liters of rainwater</strong> during monsoon. Over 85% runs into storm gutters, causing urban waterlogging instead of recharging tanks.
                  </p>
                  <div className="bg-white rounded-xl p-3 border border-emerald-200 text-[11px] text-emerald-900 font-medium">
                    💡 <strong>Truth:</strong> Capturing terrace runoff provides free water for 3 to 4 months of dry summer.
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 2: HOW WE RECYCLE (The 5-Phase Engineering & Clickable Purifier) */}
        {(activeSection === "overview" || activeSection === "recycling") && (
          <section className="space-y-8 animate-fadeIn">
            <div className="border-b border-gray-200 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Engineering &amp; Science</span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-950 mt-1">
                Kese Hum Water Recycle Karenge? — The 5-Phase Purification System
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                A closed-loop, physical-chemical-biological micro-treatment plant engineered for residential apartments:
              </p>
            </div>

            {/* Interactive Purifier Stage Explorer */}
            <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-teal-800/40 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Interactive Visual Purifier</span>
                  <h3 className="text-lg sm:text-xl font-bold mt-0.5">Click Any Stage To Watch Water Clarify</h3>
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
                          <span className="font-bold text-emerald-300 text-[11px] block">⚙️ Hardware &amp; Engineering Science:</span>
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

            {/* 4 Destination Networks */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="text-xl font-bold text-gray-900">
                Where Does The Recycled Water Go in a House?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">40%</span>
                    <h4 className="font-bold text-gray-900 text-xs">Dual-Flush Toilets</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Dual-flush cisterns need only clear, pathogen-free water — saving up to 40,000L of fresh drinking tap water per year.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">30%</span>
                    <h4 className="font-bold text-gray-900 text-xs">Balcony &amp; Terrace Plants</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    RO reject water contains natural calcium and magnesium ions that plants love. Drip irrigation keeps gardens green without guilt.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">20%</span>
                    <h4 className="font-bold text-gray-900 text-xs">Daily Floor Mopping</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Carbon-filtered and UV-treated water leaves zero soap film or residue on marble or vitrified tiles, eliminating fresh bucket waste.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-cyan-200 bg-cyan-50/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-xs">10%</span>
                    <h4 className="font-bold text-gray-900 text-xs">Vehicle &amp; Exterior Wash</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Supplies outdoor taps for washing cars and balconies. Zero waste of precious municipal potable water.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3: WASTAGE CALCULATOR */}
        {(activeSection === "overview" || activeSection === "calculator") && (
          <section className="space-y-6 animate-fadeIn">
            <div className="border-b border-gray-200 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Live Household Estimator</span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-950 mt-1">
                Calculate Your Home&rsquo;s Water Wastage
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                See how much usable water your family can save each month with JalLoop closed-loop recycling:
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 rounded-2xl border border-emerald-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Household Water Wastage Sliders</h3>
                  <p className="text-xs text-gray-600">Adjust the values below according to your daily family routine.</p>
                </div>
                <div className="bg-emerald-700 text-white px-4 py-2 rounded-xl text-center self-start sm:self-auto shadow-xs">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200 block">Estimated Savings</span>
                  <span className="text-lg font-black">{totalMonthlyWaste.toLocaleString()} Liters / Month</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-xs space-y-2">
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

                <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-xs space-y-2">
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

                <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-xs space-y-2">
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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-white rounded-xl p-3 border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold uppercase text-gray-500 block">Annual Waste</span>
                  <span className="text-base font-black text-rose-700">{annualWasteLiters.toLocaleString()} L</span>
                </div>

                <div className="bg-white rounded-xl p-3 border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold uppercase text-gray-500 block">Water Tankers Saved</span>
                  <span className="text-base font-black text-amber-700">{tankerDeliveriesWasted} Tankers</span>
                </div>

                <div className="bg-white rounded-xl p-3 border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold uppercase text-gray-500 block">Flushes Powered</span>
                  <span className="text-base font-black text-emerald-700">{Math.round(totalMonthlyWaste / 6)} Flushes/mo</span>
                </div>

                <div className="bg-white rounded-xl p-3 border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold uppercase text-gray-500 block">Water Bill Cut</span>
                  <span className="text-base font-black text-teal-700">~65% Monthly</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 4: HOME BLUEPRINT & DAILY HABITS */}
        {(activeSection === "overview" || activeSection === "habits") && (
          <section className="space-y-6 animate-fadeIn">
            <div className="border-b border-gray-200 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Actionable Habits</span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-950 mt-1">
                6 Simple Habits Every Family Can Adopt Right Now
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Small adjustments that make a huge difference to India&rsquo;s water security:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-2 shadow-xs">
                <div className="text-xs font-bold text-emerald-800">1. Tap Aerators (₹80 fix)</div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Screw aerators onto washbasin taps to mix air with water. Cuts tap flow rate by 50% without reducing water pressure.
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-2 shadow-xs">
                <div className="text-xs font-bold text-emerald-800">2. Bucket Bath vs Shower</div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  A 10-minute shower consumes ~100 to 120 liters. A single 18-liter bucket bath saves over 80 liters every morning.
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-2 shadow-xs">
                <div className="text-xs font-bold text-emerald-800">3. Stop Tap While Brushing</div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Letting the tap run while brushing wastes 6 to 12 liters every session. Turn it on only when actively rinsing.
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-2 shadow-xs">
                <div className="text-xs font-bold text-emerald-800">4. Fix Cistern Leaks</div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  A silent trickle leak in a flush toilet wastes up to 200 liters every day. Put food coloring in the tank to detect leaks.
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-2 shadow-xs">
                <div className="text-xs font-bold text-emerald-800">5. Water Plants at Dusk</div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Watering gardens in the morning or midday loses up to 40% to evaporation. Water at sunset so roots absorb every drop.
                </p>
              </div>

              <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-2 shadow-xs">
                <div className="text-xs font-bold text-emerald-800">6. Full Laundry Loads</div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Run washing machines only when full. Washing two half-loads consumes double the water and double the electricity.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 5: QUOTES & PLEDGE */}
        {(activeSection === "overview" || activeSection === "quotes") && (
          <section className="space-y-8 animate-fadeIn">
            <div className="border-b border-gray-200 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Words of Wisdom</span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-950 mt-1">
                Quotes That Touch The Conscience
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Every drop of water is a gift from nature. Let these thoughts guide our actions:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-xs flex flex-col justify-between">
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

              <div className="bg-white rounded-2xl border border-teal-200 p-6 shadow-xs flex flex-col justify-between">
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

              <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-xs flex flex-col justify-between">
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
                    className="px-6 py-3.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 text-gray-950 font-bold text-xs sm:text-sm hover:from-emerald-300 hover:to-teal-300 shadow-lg transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Heart size={16} fill="currentColor" />
                    <span>Take The Water Pledge</span>
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* BOTTOM ENTERPRISE CTA */}
        <div className="rounded-2xl border-2 border-emerald-600/30 bg-white p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Ready to test JalLoop?</span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-950">
            Explore the Interactive Hardware Simulation
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            See the pumps, ultrasonic sensors, and 3-stage filtration in real time right in your browser. No account needed.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onLaunchSimulator}
              className="px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Play size={15} fill="currentColor" className="text-emerald-400" />
              <span>Launch interactive simulator</span>
            </button>

            <button
              type="button"
              onClick={onGoToAuth}
              className="px-6 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
            >
              Create free account
            </button>
          </div>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          7. ENTERPRISE FOOTER
          ───────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Droplets size={14} />
            </div>
            <span className="font-bold text-white">JalLoop</span>
            <span className="text-slate-500">© 2026 JalLoop Open Source Project. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button type="button" onClick={onLaunchSimulator} className="hover:text-white transition-colors cursor-pointer">
              Simulator
            </button>
            <span>•</span>
            <button type="button" onClick={onGoToAuth} className="hover:text-white transition-colors cursor-pointer">
              Sign In
            </button>
            <span>•</span>
            <a href="https://github.com/Iamabhipandat/WaterRecycleSystem" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
