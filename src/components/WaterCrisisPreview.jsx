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
  MapPin,
  Building2,
  Compass,
  BarChart3,
  FileText,
  Activity,
  Workflow,
  BookOpen,
} from "lucide-react";

export default function WaterCrisisPreview({ onLaunchSimulator, onGoToAuth, isInsideApp = false }) {
  const [activeTab, setActiveTab] = useState("country"); // "country" | "crisis" | "recycling" | "explore-app" | "solution" | "quotes"
  const [familyMembers, setFamilyMembers] = useState(4);
  const [roLitersDaily, setRoLitersDaily] = useState(15);
  const [laundryLoadsWeekly, setLaundryLoadsWeekly] = useState(4);
  const [purificationStage, setPurificationStage] = useState(0); // 0 to 4
  const [selectedCity, setSelectedCity] = useState("bengaluru");
  const [hasPledged, setHasPledged] = useState(() => {
    return localStorage.getItem("jalloop.waterPledge") === "true";
  });
  const [pledgeCount, setPledgeCount] = useState(3842);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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

  // Indian Cities Crisis Data
  const CITY_CASE_STUDIES = {
    bengaluru: {
      name: "Bengaluru (Silicon Valley of India)",
      hindiName: "बेंगलुरु - भारत की सिलिकॉन वैली",
      severity: "Day Zero Threat (Critical)",
      borewellDepth: "1,500+ feet deep (Over 14,000 dry borewells)",
      tankerCost: "₹1,800 to ₹2,500 per tanker (400% price surge)",
      crisisSummary:
        "Rapid urbanization cemented 90% of Bengaluru's lakes. When monsoons fell short, over 6,900 borewells completely ran dry. High-rise apartment complexes were forced to ration water to 50 liters per flat and spend lakhs per month on emergency private water tankers.",
      solutionImpact:
        "A typical 200-apartment society in Bengaluru dumps 45,000 liters of RO reject and laundry water daily. With JalLoop closed-loop recycling, the society saves 1.35 Million liters each month, eliminating tanker dependency.",
    },
    chennai: {
      name: "Chennai (The 2019 Day Zero Warning)",
      hindiName: "चेन्नई - 2019 का डे-ज़ीरो संकट",
      severity: "Severe Aquifer Exhaustion",
      borewellDepth: "Saltwater intrusion within 20km of coast",
      tankerCost: "Emergency Water Trains (Jaldoot carrying 2.5M liters/day)",
      crisisSummary:
        "In June 2019, Chennai became India's first mega-city to declare 'Day Zero' when its 4 main reservoirs (Poondi, Cholavaram, Redhills, Chembarambakkam) turned to dry cracked mud. Hotels, hospitals, and IT corridors in OMR had to shut down.",
      solutionImpact:
        "Chennai receives intense coastal monsoon rainfall. Capturing terrace rain and recycling residential greywater creates a distributed buffer that keeps buildings self-sufficient even during long rainless summers.",
    },
    delhi: {
      name: "Delhi NCR (Yamuna & Ground Depletion)",
      hindiName: "दिल्ली एनसीआर - भूजल संकट व यमुना",
      severity: "Over-exploited Groundwater Blocks",
      borewellDepth: "Water table falling by 1 to 2 meters annually",
      tankerCost: "High municipal pipeline deficits in South/South-West Delhi",
      crisisSummary:
        "Delhi's peak summer water demand exceeds 1,250 MGD against a supply of barely 990 MGD. Heavy groundwater pumping in Gurgaon, Noida, and South Delhi has pushed water tables below 250 feet, while toxic ammonia surges in the Yamuna regularly shut down water treatment plants.",
      solutionImpact:
        "Decentralized micro-recycling in residential societies cuts fresh municipal draw by 65%, taking immense pressure off the besieged Yamuna river.",
    },
    bundelkhand: {
      name: "Bundelkhand & Marathwada (Rural-Urban Drought)",
      hindiName: "बुंदेलखंड व मराठवाड़ा - जल संकट की जमीनी सच्चाई",
      severity: "Chronic Drought & Tanker Trains",
      borewellDepth: "Hard rocky terrain with non-recharging aquifers",
      tankerCost: "Women walking 4 to 6 kilometers daily for single pots",
      crisisSummary:
        "Recurring monsoon failures in semi-arid zones have led to distress migration and heavy water conflicts. Millions of hours of productive human life are lost solely to hauling water for basic survival.",
      solutionImpact:
        "Every liter of water saved in urban homes prevents water trains and tankers from being diverted from rural farming belts, establishing national water equity.",
    },
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

  const currentCityData = CITY_CASE_STUDIES[selectedCity] || CITY_CASE_STUDIES.bengaluru;

  return (
    <div className="w-full space-y-6">
      {/* Hero Environmental Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white p-5 sm:p-10 shadow-lg border border-emerald-800/40">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] sm:text-xs font-semibold backdrop-blur-md">
            <Sparkles size={13} className="text-emerald-400 shrink-0" />
            <span>National Water Conservation Mission</span>
          </div>

          <h1 className="text-xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
            जल ही जीवन है — <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">Why India Needs JalLoop</span>
          </h1>

          <p className="text-xs sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
            Over <strong>600 million Indians</strong> face severe water stress. Urban households flush thousands of liters of usable water down the drain every week. Discover our country's water crisis, learn how closed-loop recycling solves it, and explore our platform.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onLaunchSimulator}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs sm:text-sm hover:from-emerald-600 hover:to-teal-600 shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <Play size={15} fill="currentColor" />
              <span>Launch Live Simulator</span>
            </button>

            {onGoToAuth && !isInsideApp && (
              <button
                type="button"
                onClick={onGoToAuth}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-all cursor-pointer"
              >
                <span>Sign In / Create Account</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sticky / Floating Chapter Quick-Jump Anchor Bar */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 p-2 sm:p-2.5 shadow-xs sticky top-2 sm:top-3 z-30 space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between px-1 sm:px-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-gray-800">
              Explore &amp; Mission Guidebook (4 Focused Chapters)
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 hidden sm:inline">
            Scroll down or tap to jump directly ↓
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => scrollToSection("chapter-1")}
            className="shrink-0 flex items-center gap-1.5 py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
          >
            <Globe size={13} className="text-emerald-700" />
            <span>1. India's Water Crisis</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("chapter-2")}
            className="shrink-0 flex items-center gap-1.5 py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
          >
            <AlertTriangle size={13} className="text-amber-700" />
            <span>2. Home Wastage &amp; Calculator</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("chapter-3")}
            className="shrink-0 flex items-center gap-1.5 py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors cursor-pointer"
          >
            <Beaker size={13} className="text-teal-700" />
            <span>3. How We Recycle</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("chapter-4")}
            className="shrink-0 flex items-center gap-1.5 py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition-colors cursor-pointer"
          >
            <Compass size={13} className="text-indigo-700" />
            <span>4. Platform Tour &amp; Pledge</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CHAPTER 1: INDIA'S WATER REALITY & CITY CASE STUDIES
          ───────────────────────────────────────────────────────────── */}
      <section id="chapter-1" className="space-y-4 sm:space-y-6 scroll-mt-24">
          {/* National Overview Headline */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold">
              <Globe size={13} />
              <span>National Water Security Report — India</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-gray-950">
              The Reality of Water in India: Why Our Country Faces a Historic Turning Point
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-4xl">
              India supports <strong>18% of the world&rsquo;s human population</strong> with only <strong>4% of the world&rsquo;s fresh water resources</strong>. Historically reliant on monsoon rains, our country now extracts more groundwater each year than the United States and China combined. Centralized municipal treatment plants treat less than 30% of sewage, leaving decentralized recycling at home as the only viable shield for our cities.
            </p>
          </div>

          {/* 4 Macro Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Globe size={18} />
              </div>
              <div className="text-2xl font-black text-gray-950">600 Million</div>
              <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">High Water Stress</div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Over 50% of our population faces severe water stress annually, with hundreds of districts declared drought-prone.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <TrendingDown size={18} />
              </div>
              <div className="text-2xl font-black text-gray-950">256 of 700</div>
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">Districts Critical</div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Groundwater extraction exceeds natural rainfall replenishment in 256 districts across Rajasthan, Punjab, Tamil Nadu, and Karnataka.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-teal-200 p-5 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <Building2 size={18} />
              </div>
              <div className="text-2xl font-black text-gray-950">₹2,000 / Tanker</div>
              <div className="text-xs font-bold text-teal-700 uppercase tracking-wider">Urban Tanker Mafia</div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Urban families spend up to ₹4,000–₹8,000 per month just to buy unregulated groundwater tankers during dry summers.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Droplets size={18} />
              </div>
              <div className="text-2xl font-black text-gray-950">70% Discharge</div>
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">Recyclable Greywater</div>
              <p className="text-xs text-gray-500 leading-relaxed">
                70% of fresh drinking water supplied to apartments is flushed out as non-sewage wash water that could be saved on-site.
              </p>
            </div>
          </div>

          {/* City Case Studies Interactive Tabs */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Indian City Spotlight</span>
                <h3 className="text-xl font-bold text-gray-950 mt-0.5">Explore How The Water Crisis Affects Our Major Cities</h3>
              </div>
              <span className="text-xs font-semibold text-gray-400">Click a city to see the on-ground impact</span>
            </div>

            {/* City Selector Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.keys(CITY_CASE_STUDIES).map((cityKey) => {
                const isSelected = selectedCity === cityKey;
                const city = CITY_CASE_STUDIES[cityKey];
                return (
                  <button
                    key={cityKey}
                    type="button"
                    onClick={() => setSelectedCity(cityKey)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-700 text-white border-emerald-700 shadow-md font-bold"
                        : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <MapPin size={13} className={isSelected ? "text-emerald-300" : "text-emerald-700"} />
                      <span>{city.name.split(" ")[0]}</span>
                    </div>
                    <div className={`text-[11px] mt-1 line-clamp-1 ${isSelected ? "text-emerald-100" : "text-gray-500"}`}>
                      {city.severity}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* City Deep-Dive Card */}
            <div className="bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-blue-50/30 rounded-2xl border border-emerald-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-3">
                <div>
                  <span className="text-xs font-bold text-emerald-800">{currentCityData.hindiName}</span>
                  <h4 className="text-lg font-black text-gray-950 mt-0.5">{currentCityData.name}</h4>
                </div>
                <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold">
                  {currentCityData.severity}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-white rounded-xl p-4 border border-emerald-200 space-y-1.5">
                  <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Aquifer &amp; Borewell Reality:</span>
                  <p className="font-bold text-gray-900 text-sm">{currentCityData.borewellDepth}</p>
                  <p className="text-gray-600 mt-1">{currentCityData.crisisSummary}</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-emerald-200 space-y-1.5">
                  <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Financial Impact &amp; JalLoop Solution:</span>
                  <p className="font-bold text-emerald-800 text-sm">{currentCityData.tankerCost}</p>
                  <p className="text-gray-600 mt-1">{currentCityData.solutionImpact}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => scrollToSection("chapter-2")}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                <span>Continue Down to Chapter 2: Household Wastage ↓</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          CHAPTER 2: HOUSEHOLD WASTAGE & INTERACTIVE CALCULATOR
          ───────────────────────────────────────────────────────────── */}
      <section id="chapter-2" className="space-y-4 sm:space-y-6 scroll-mt-20">
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
              <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">1</span>
                  <h3 className="font-bold text-gray-900 text-sm">RO Purifier Reject (The 3:1 Ratio)</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  To give you <strong>1 liter of clean drinking water</strong>, standard RO purifiers discard <strong>3 liters of brine</strong> directly into the kitchen drain. An average 4-person family wastes <strong>35 to 50 Liters every single day</strong>.
                </p>
                <div className="bg-white rounded-xl p-3 border border-amber-200 text-[11px] text-amber-900 font-medium">
                  💡 <strong>Reality:</strong> Zero bacteria. Perfect for toilet flushing, floor mopping, and garden plants.
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-200 bg-cyan-50/40 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-xs">2</span>
                  <h3 className="font-bold text-gray-900 text-sm">Washing Machine Rinses</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  A single full laundry cycle expels <strong>60 to 100 liters of water</strong>. The final 2 rinse cycles carry almost no dirt and negligible detergent, yet they are flushed straight into the municipal sewer.
                </p>
                <div className="bg-white rounded-xl p-3 border border-cyan-200 text-[11px] text-cyan-900 font-medium">
                  💡 <strong>Reality:</strong> Sediment and carbon filtering prepares this greywater for 100% of flushing needs.
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">3</span>
                  <h3 className="font-bold text-gray-900 text-sm">Lost Terrace Rainwater</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  A typical 1,000 sq.ft terrace receives over <strong>1,00,000 liters of rainwater</strong> during monsoon season. Over 85% runs off into storm drains and floods roads instead of recharging tanks.
                </p>
                <div className="bg-white rounded-xl p-3 border border-emerald-200 text-[11px] text-emerald-900 font-medium">
                  💡 <strong>Reality:</strong> Capturing terrace runoff provides free water for 3 to 4 months of dry summer.
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Wastage Calculator */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 rounded-2xl border border-emerald-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Interactive Estimator</span>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">Calculate Your Home&rsquo;s Water Wastage</h3>
                <p className="text-xs text-gray-600">See how much usable water your family can save each month with JalLoop.</p>
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
                <span className="text-[10px] font-bold uppercase text-gray-500 block">Water Tankers</span>
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

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => scrollToSection("chapter-1")}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back to India's Crisis</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("chapter-3")}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                <span>Continue Down to Chapter 3: How We Recycle ↓</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          CHAPTER 3: HOW WE RECYCLE (5-PHASE ENGINEERING & VISUAL PURIFIER)
          ───────────────────────────────────────────────────────────── */}
      <section id="chapter-3" className="space-y-4 sm:space-y-6 scroll-mt-20">
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

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setActiveTab("crisis")}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Household Wastage</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("chapter-4")}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
            >
              <span>Continue Down to Chapter 4: Platform Tour &amp; Pledge ↓</span>
              <ChevronRight size={14} />
            </button>
          </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          CHAPTER 4: EXPLORE PLATFORM, QUOTES & PLEDGE
          ───────────────────────────────────────────────────────────── */}
      <section id="chapter-4" className="space-y-4 sm:space-y-6 scroll-mt-20">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold">
              <Compass size={13} />
              <span>Interactive Platform Tour &amp; Architectural Guide</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-950">
              How Does The JalLoop Platform Work? — Full Feature Explorer
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-3xl">
              JalLoop combines real physical IoT hardware (ESP32) with a browser digital twin and AI safety engine. You can explore every single page and component right in your browser without logging in:
            </p>
          </div>

          {/* 4 Core Features Walkthrough Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Feature 1: Water Flow Simulator */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4 flex flex-col justify-between hover:border-emerald-500 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Droplets size={20} />
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                    Tab: Water Flow
                  </span>
                </div>
                <h3 className="text-base font-black text-gray-950">1. Animated Glass Pipe Simulator</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Interactive SVG schematic showing realistic water flow animation. Toggle the <strong>RO Purifier</strong>, <strong>Washing Machine</strong>, and <strong>Rainwater</strong> valves to collect greywater, watch the collection buffer fill, and start the booster pump to run 3-stage filtration in real time.
                </p>
                <div className="text-[11px] text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  ⚡ <strong>Try it:</strong> Click "Go to Water Flow" below to test the animated pumps and pipes!
                </div>
              </div>
              <button
                type="button"
                onClick={onLaunchSimulator}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <Play size={14} fill="currentColor" />
                <span>Open Water Flow Simulator</span>
              </button>
            </div>

            {/* Feature 2: Virtual Hardware Workbench */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4 flex flex-col justify-between hover:border-emerald-500 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Cpu size={20} />
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                    Tab: Virtual Hardware
                  </span>
                </div>
                <h3 className="text-base font-black text-gray-950">2. ESP32 Digital Twin &amp; Circuit</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  A complete digital twin of the physical microcontroller. Drag sliders for ultrasonic distance sensors and analog turbidity potentiometers to simulate murky water or full tanks. Includes a clean Wokwi circuit simulation diagram with minimal orthogonal wiring!
                </p>
                <div className="text-[11px] text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  ⚡ <strong>Try it:</strong> View pin-by-pin mapping (GPIO 34, 18, 19, 23) and copy the Wokwi diagram.json with 1 click.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onLaunchSimulator) onLaunchSimulator();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <Cpu size={14} />
                <span>Explore ESP32 Twin</span>
              </button>
            </div>

            {/* Feature 3: Safety Policies & Cedar Engine */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4 flex flex-col justify-between hover:border-emerald-500 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                    Tab: System Status
                  </span>
                </div>
                <h3 className="text-base font-black text-gray-950">3. Cedar Policy Safety Engine</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Enforces automated safety invariants as code. If water turbidity exceeds 85 NTU, the Cedar policy locks the pump with a safety denial. If water drops below 5L, cavitation lockout prevents pump burnout.
                </p>
                <div className="text-[11px] text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  ⚡ <strong>Try it:</strong> Inspect live policy evaluations and operational audit logs.
                </div>
              </div>
              <button
                type="button"
                onClick={onLaunchSimulator}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <Activity size={14} />
                <span>View System Status &amp; Logs</span>
              </button>
            </div>

            {/* Feature 4: Telemetry Analytics & OpenSearch DSL */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4 flex flex-col justify-between hover:border-emerald-500 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <BarChart3 size={20} />
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
                    Tab: Analytics
                  </span>
                </div>
                <h3 className="text-base font-black text-gray-950">4. OpenSearch Query DSL &amp; Charts</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Historical telemetry visualization showing 7-day recycling trends, fresh water savings ratio, and groundwater preserved. Includes an interactive OpenSearch Query DSL explorer to query telemetry events in real time.
                </p>
                <div className="text-[11px] text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  ⚡ <strong>Try it:</strong> Run sample OpenSearch queries and export raw telemetry to CSV.
                </div>
              </div>
              <button
                type="button"
                onClick={onLaunchSimulator}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <BarChart3 size={14} />
                <span>Open Analytics &amp; Reports</span>
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setActiveTab("recycling")}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Recycling Stages</span>
            </button>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => scrollToSection("chapter-3")}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back to How We Recycle</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("quotes-pledge")}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                <span>Jump to Quotes &amp; Water Pledge ↓</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Quotes Section Integrated into Chapter 4 */}
          <div id="quotes-pledge" className="space-y-4 pt-4 border-t border-gray-100 scroll-mt-24">
          <div className="space-y-4">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Words of Wisdom &amp; Cultural Heritage</span>
              <h2 className="text-2xl font-bold text-gray-900">Quotes That Touch The Conscience</h2>
              <p className="text-xs text-gray-500">Every drop of water is a sacred trust. Let these thoughts guide our actions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Quote 1: Rigveda */}
              <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-emerald-400 transition-all">
                <div className="space-y-3">
                  <Quote size={28} className="text-emerald-500/40" />
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed italic">
                    &ldquo;आपो हि ष्ठा मयोभुवस्ता न ऊर्जे दधातन। महे रणाय चक्षसे।&rdquo;
                  </p>
                  <p className="text-[11px] text-gray-500">
                    (Waters are verily the bringers of life and strength, grant us nourishment so that we behold greatness.)
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-xs text-emerald-700 font-bold">
                  <span>ऋग्वेद (Rigveda 10.9.1)</span>
                  <span className="text-[10px] text-gray-400 font-normal">Ancient Heritage</span>
                </div>
              </div>

              {/* Quote 2: Indian Wisdom */}
              <div className="bg-white rounded-2xl border border-teal-200 p-6 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-teal-400 transition-all">
                <div className="space-y-3">
                  <Quote size={28} className="text-teal-500/40" />
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed italic">
                    &ldquo;जल ही जीवन है, और जल का संरक्षण ही हमारा कल है।&rdquo;
                  </p>
                  <p className="text-[11px] text-gray-500">
                    (Water is life itself, and its conservation is our only tomorrow.)
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-xs text-teal-700 font-bold">
                  <span>भारतीय लोकोक्ति</span>
                  <span className="text-[10px] text-gray-400 font-normal">National Conscience</span>
                </div>
              </div>

              {/* Quote 3: Auden */}
              <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-blue-400 transition-all">
                <div className="space-y-3">
                  <Quote size={28} className="text-blue-500/40" />
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed italic">
                    &ldquo;Thousands have lived without love, not one without water.&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-xs text-blue-700 font-bold">
                  <span>W. H. Auden</span>
                  <span className="text-[10px] text-gray-400 font-normal">Poet &amp; Thinker</span>
                </div>
              </div>

              {/* Quote 4: Franklin */}
              <div className="bg-white rounded-2xl border border-cyan-200 p-6 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-cyan-400 transition-all">
                <div className="space-y-3">
                  <Quote size={28} className="text-cyan-500/40" />
                  <p className="text-sm font-semibold text-gray-800 leading-relaxed italic">
                    &ldquo;When the well&rsquo;s dry, we know the worth of water.&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-xs text-cyan-700 font-bold">
                  <span>Benjamin Franklin</span>
                  <span className="text-[10px] text-gray-400 font-normal">Statesman &amp; Scientist</span>
                </div>
              </div>

              {/* Quote 5: Global Conscience */}
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

              {/* Quote 6: Gandhi */}
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
      </section>
    </div>
  );
}
