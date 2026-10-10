import { useState, useEffect } from "react";
import {
  Cloud,
  Shield,
  Search,
  Bot,
  Layers,
  Terminal,
  CheckCircle2,
  XCircle,
  X,
  Play,
  Database,
  ExternalLink,
  Cpu,
  Server,
  KeyRound,
  Send,
} from "lucide-react";
import { evaluateCedarPolicy, CEDAR_POLICIES_TEXT } from "../services/cedarPolicy";
import {
  indexTelemetryDocument,
  searchOpenSearchTelemetry,
  getOpenSearchAggregations,
} from "../services/openSearchService";
import { runWaterAgent } from "../services/aiAgentService";

const AWS_TRACKS = [
  {
    category: "Agents and AI",
    openSource: "Strands Agents SDK",
    cloud: "SageMaker AI",
    status: "Implemented",
    desc: "Autonomous water assistant with ReAct reasoning & sensor diagnostic tools.",
  },
  {
    category: "Containers & K8s",
    openSource: "Finch / Docker",
    cloud: "Amazon ECS & Fargate",
    status: "Implemented",
    desc: "Multi-stage Containerfile and compose.yaml for local Finch/Docker execution.",
  },
  {
    category: "Serverless",
    openSource: "SAM CLI, LocalStack",
    cloud: "Lambda, API Gateway, DynamoDB",
    status: "Implemented",
    desc: "template.yaml with telemetry ingestion Lambda & DynamoDB table spec.",
  },
  {
    category: "Servers & Runtimes",
    openSource: "Corretto / Node.js",
    cloud: "AWS Amplify, App Runner",
    status: "Implemented",
    desc: "amplify.yml continuous deployment configuration and lightweight runtime.",
  },
  {
    category: "Data and Search",
    openSource: "OpenSearch 2.x",
    cloud: "Amazon S3, DynamoDB",
    status: "Implemented",
    desc: "Real-time time-series telemetry indexing, aggregation, and query DSL.",
  },
  {
    category: "Auth and Policy",
    openSource: "AWS Cedar",
    cloud: "Amazon Cognito, JWT",
    status: "Implemented",
    desc: "Role-based authorization and critical safety invariants written in Cedar.",
  },
  {
    category: "The Plumbing",
    openSource: "OpenEvent Specs",
    cloud: "Amazon EventBridge, CloudFront",
    status: "Implemented",
    desc: "EventBridge rules for water threshold alerts & CloudFront CDN distribution.",
  },
];

export default function AwsCloudCenterModal({ isOpen, onClose, systemState = {} }) {
  const [activeTab, setActiveTab] = useState("overview");

  // Cedar Policy Simulator State
  const [cedarRole, setCedarRole] = useState("operator");
  const [cedarAction, setCedarAction] = useState("StartRecycling");
  const [cedarTurbidity, setCedarTurbidity] = useState(25);
  const [cedarRecycledLiters, setCedarRecycledLiters] = useState(50);
  const [cedarResult, setCedarResult] = useState(null);

  // OpenSearch State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQuality, setSearchQuality] = useState("All");
  const [searchResults, setSearchResults] = useState([]);
  const [searchStats, setSearchStats] = useState(getOpenSearchAggregations());
  const [indexingFeedback, setIndexingFeedback] = useState("");

  // AI Agent State
  const [agentInput, setAgentInput] = useState("");
  const [agentChat, setAgentChat] = useState([
    {
      sender: "agent",
      text: "Hello! I am the JalLoop Autonomous Water Agent built on the Strands Agents SDK. Ask me about water quality, tank levels, or safety policies.",
    },
  ]);
  const [agentBusy, setAgentBusy] = useState(false);

  // Initialize Search & Cedar
  useEffect(() => {
    handleEvaluateCedar();
    handleSearchDocs();
  }, []);

  function handleEvaluateCedar() {
    const res = evaluateCedarPolicy({
      role: cedarRole,
      action: cedarAction,
      resource: {
        turbidity: cedarTurbidity,
        recycledLiters: cedarRecycledLiters,
      },
    });
    setCedarResult(res);
  }

  async function handleSearchDocs() {
    const hits = await searchOpenSearchTelemetry({
      queryText: searchQuery,
      qualityFilter: searchQuality,
    });
    setSearchResults(hits);
    setSearchStats(getOpenSearchAggregations());
  }

  async function handleIndexCurrentLive() {
    setIndexingFeedback("Indexing to OpenSearch...");
    await indexTelemetryDocument({
      collectionLiters: systemState.collectionLiters || 45,
      recycledLiters: systemState.recycledLiters || 59,
      freshWaterSaved: systemState.freshWaterSaved || 59,
      turbidity: systemState.turbidity || cedarTurbidity,
      pumpRunning: systemState.pumpRunning,
      phase: systemState.recycledPct > 0 ? "RECYCLING" : "STANDBY",
      source: "ESP32 Live Telemetry",
    });
    setIndexingFeedback("✅ Indexed successfully!");
    setTimeout(() => setIndexingFeedback(""), 2500);
    handleSearchDocs();
  }

  async function handleAgentAsk(customPrompt) {
    const query = customPrompt || agentInput;
    if (!query.trim()) return;

    const userMsg = { sender: "user", text: query };
    setAgentChat((prev) => [...prev, userMsg]);
    setAgentInput("");
    setAgentBusy(true);

    try {
      const response = await runWaterAgent(query, {
        ...systemState,
        turbidity: cedarTurbidity,
      });

      const agentMsg = {
        sender: "agent",
        text: response.answer,
        thoughts: response.thoughts,
        tools: response.toolExecutions,
      };
      setAgentChat((prev) => [...prev, agentMsg]);
    } catch {
      setAgentChat((prev) => [
        ...prev,
        { sender: "agent", text: "Error executing reasoning loop in agent." },
      ]);
    } finally {
      setAgentBusy(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 via-amber-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-xs">
              <Cloud size={20} className="text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 leading-tight">
                  AWS Open Source & Cloud Center
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  7 Tracks Built
                </span>
              </div>
              <p className="text-xs text-gray-500">
                AWS Open Source Tools (No card / No bill) + Production AWS Services Architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-gray-100 bg-gray-50/50 flex gap-1 overflow-x-auto">
          {[
            { id: "overview", label: "7 Tracks Matrix", icon: Layers },
            { id: "cedar", label: "Cedar Policy (Auth)", icon: Shield },
            { id: "opensearch", label: "OpenSearch (Data)", icon: Search },
            { id: "agent", label: "AI Agent (Strands)", icon: Bot },
            { id: "serverless", label: "SAM & LocalStack", icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-b-2 whitespace-nowrap ${
                  active
                    ? "bg-white text-gray-900 border-amber-500 shadow-2xs"
                    : "text-gray-500 border-transparent hover:text-gray-800 hover:bg-gray-100/70"
                }`}
              >
                <Icon size={14} className={active ? "text-amber-600" : "text-gray-400"} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 text-gray-700 text-xs sm:text-sm">
          {/* TAB 1: OVERVIEW & 7 TRACKS */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-amber-600" />
                  Hackathon Eligibility Verified
                </p>
                <p className="text-amber-800 leading-relaxed">
                  JalLoop incorporates tools across all seven AWS tracks. Run completely locally on your machine
                  with open-source software (Cedar, OpenSearch, SAM CLI, LocalStack, Finch), or deploy directly to AWS.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AWS_TRACKS.map((t) => (
                  <div
                    key={t.category}
                    className="p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-amber-300 transition-all space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-xs">{t.category}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {t.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide block">
                          BUILD IT (Open Source)
                        </span>
                        <span className="font-semibold text-gray-800">{t.openSource}</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide block">
                          SHIP IT (AWS Cloud)
                        </span>
                        <span className="font-semibold text-gray-800">{t.cloud}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-normal">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: AWS CEDAR POLICY */}
          {activeTab === "cedar" && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">AWS Cedar Authorization Engine</h3>
                  <p className="text-xs text-gray-500">
                    Open-source policy engine enforcing role-based permissions and critical safety invariants.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  cedarpolicy.com
                </span>
              </div>

              {/* Live Evaluator */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <p className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                  Live Cedar Policy Evaluator
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">Role (Principal)</label>
                    <select
                      value={cedarRole}
                      onChange={(e) => setCedarRole(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      <option value="admin">Admin (Wildcard permit)</option>
                      <option value="operator">Operator (Action permitted)</option>
                      <option value="viewer">Viewer (Read-only)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 block mb-1">Action</label>
                    <select
                      value={cedarAction}
                      onChange={(e) => setCedarAction(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      <option value="StartRecycling">StartRecycling (Pumping)</option>
                      <option value="UseRecycledWater">UseRecycledWater (Distribution)</option>
                      <option value="ViewTelemetry">ViewTelemetry</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 flex justify-between mb-1">
                      <span>Resource Turbidity (Safety Invariant Limit: 85 NTU)</span>
                      <span className="font-bold text-amber-700">{cedarTurbidity} NTU</span>
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={cedarTurbidity}
                      onChange={(e) => setCedarTurbidity(Number(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 flex justify-between mb-1">
                      <span>Recycled Volume (Cavitation Reserve: 5 L)</span>
                      <span className="font-bold text-emerald-700">{cedarRecycledLiters} L</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={cedarRecycledLiters}
                      onChange={(e) => setCedarRecycledLiters(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleEvaluateCedar}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Play size={13} />
                  Evaluate Request with Cedar
                </button>

                {cedarResult && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                      cedarResult.decision === "ALLOW"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                        : "bg-red-50 border-red-200 text-red-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1">
                        {cedarResult.decision === "ALLOW" ? (
                          <CheckCircle2 size={14} className="text-emerald-600" />
                        ) : (
                          <XCircle size={14} className="text-red-600" />
                        )}
                        Decision: {cedarResult.decision}
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/70 border border-black/5">
                        {cedarResult.policyId}
                      </span>
                    </div>
                    <p>{cedarResult.reason}</p>
                    <p className="text-[11px] opacity-80">{cedarResult.diagnostic}</p>
                  </div>
                )}
              </div>

              {/* Cedar Code Snippet */}
              <div className="bg-gray-900 text-gray-200 p-3.5 rounded-2xl font-mono text-[11px] max-h-44 overflow-y-auto">
                <pre>{CEDAR_POLICIES_TEXT}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: OPENSEARCH */}
          {activeTab === "opensearch" && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">AWS OpenSearch Telemetry Engine</h3>
                  <p className="text-xs text-gray-500">
                    Apache 2.0 open-source search and time-series analytics engine.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleIndexCurrentLive}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <Database size={13} />
                  Index Live State
                </button>
              </div>

              {indexingFeedback && (
                <div className="p-2.5 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold">
                  {indexingFeedback}
                </div>
              )}

              {/* Aggregation Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Indexed Docs</span>
                  <span className="text-base font-bold text-gray-900">{searchStats.totalIndexed}</span>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Avg Turbidity</span>
                  <span className="text-base font-bold text-amber-700">{searchStats.avgTurbidity} NTU</span>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Conserved Water</span>
                  <span className="text-base font-bold text-emerald-700">{searchStats.totalSaved} L</span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search telemetry (e.g. 'Good', 'RO', 'RUNNING')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchDocs()}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-sky-500"
                />
                <select
                  value={searchQuality}
                  onChange={(e) => setSearchQuality(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-xs"
                >
                  <option value="All">All Quality</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
                <button
                  type="button"
                  onClick={handleSearchDocs}
                  className="px-3.5 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800"
                >
                  Query
                </button>
              </div>

              {/* Results Table */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden max-h-52 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 font-bold uppercase">
                    <tr>
                      <th className="py-2 px-3">Time</th>
                      <th className="py-2 px-3">Source</th>
                      <th className="py-2 px-3">Turbidity</th>
                      <th className="py-2 px-3">Saved (L)</th>
                      <th className="py-2 px-3">Quality</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {searchResults.map((hit) => (
                      <tr key={hit._id} className="hover:bg-gray-50/50">
                        <td className="py-2 px-3 text-gray-500">
                          {new Date(hit.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2 px-3 font-medium text-gray-800">{hit.source}</td>
                        <td className="py-2 px-3 text-amber-800 font-mono">{hit.turbidityNTU} NTU</td>
                        <td className="py-2 px-3 text-emerald-700 font-bold">{hit.freshWaterSaved} L</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              hit.quality === "Good"
                                ? "bg-emerald-50 text-emerald-700"
                                : hit.quality === "Fair"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {hit.quality}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: AI AGENT (STRANDS AGENTS SDK) */}
          {activeTab === "agent" && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">JalLoop AI Assistant (Strands Agents SDK)</h3>
                  <p className="text-xs text-gray-500">
                    Autonomous reasoning agent running tool calls to diagnose water quality and suggest actions.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                  Strands SDK Architecture
                </span>
              </div>

              {/* Quick Query Pills */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-[11px] font-semibold text-gray-400">Ask:</span>
                {[
                  "Can I use recycled water for toilet flushing?",
                  "How much water have I saved?",
                  "Inspect system status",
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleAgentAsk(q)}
                    className="px-2.5 py-1 rounded-full bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 text-[11px] transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat Thread */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 space-y-3 max-h-60 overflow-y-auto">
                {agentChat.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-line ${
                        m.sender === "user"
                          ? "bg-gray-900 text-white"
                          : "bg-white border border-gray-200 text-gray-800 shadow-2xs"
                      }`}
                    >
                      {m.text}
                      {m.thoughts && (
                        <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] font-mono text-gray-400 space-y-0.5">
                          {m.thoughts.map((th, tidx) => (
                            <p key={tidx}>{th}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {agentBusy && (
                  <div className="text-xs text-gray-400 font-medium italic animate-pulse">
                    Agent reasoning and evaluating sensors…
                  </div>
                )}
              </div>

              {/* Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAgentAsk();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask the water recycling agent..."
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-violet-500"
                />
                <button
                  type="submit"
                  disabled={agentBusy}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  <Send size={13} />
                  Ask
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: SERVERLESS & LOCALSTACK */}
          {activeTab === "serverless" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">AWS SAM CLI & LocalStack Commands</h3>
                <p className="text-xs text-gray-500">
                  Run and test the entire AWS cloud architecture on your machine with no credit card or AWS bill.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-800">1. Run LocalStack (Emulates AWS Services)</span>
                    <span className="text-[10px] font-mono text-gray-400">Port 4566</span>
                  </div>
                  <pre className="bg-gray-900 text-gray-200 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto">
                    docker run --rm -it -p 4566:4566 -p 4510-4559:4510-4559 localstack/localstack
                  </pre>
                </div>

                <div className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-800">2. Test Serverless Lambda APIs with SAM CLI</span>
                    <span className="text-[10px] font-mono text-gray-400">template.yaml</span>
                  </div>
                  <pre className="bg-gray-900 text-gray-200 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto">
                    sam local start-api --port 3001
                  </pre>
                </div>

                <div className="p-3.5 rounded-2xl border border-gray-200 bg-gray-50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-800">3. Build with AWS Finch Container Engine</span>
                    <span className="text-[10px] font-mono text-gray-400">Dockerfile</span>
                  </div>
                  <pre className="bg-gray-900 text-gray-200 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto">
                    finch build -t jalloop:latest .
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
