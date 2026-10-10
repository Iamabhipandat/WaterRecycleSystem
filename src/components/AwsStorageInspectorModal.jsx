import { useState } from "react";
import {
  X,
  Database,
  Search,
  Archive,
  ShieldCheck,
  Radio,
  Layers,
  Copy,
  Check,
  Code,
  ExternalLink,
  Droplets,
  Cpu,
  Sparkles,
} from "lucide-react";
import {
  getCollectionTankAwsStorage,
  getRecycledTankAwsStorage,
  getFiltrationUnitAwsStorage,
} from "../services/awsStorageService";

export default function AwsStorageInspectorModal({
  isOpen,
  onClose,
  systemState,
  initialTank = "collection",
}) {
  const [activeTab, setActiveTab] = useState(initialTank);
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen) return null;

  const colData = getCollectionTankAwsStorage(systemState);
  const recData = getRecycledTankAwsStorage(systemState);
  const filData = getFiltrationUnitAwsStorage(systemState);

  const tankMap = {
    collection: colData,
    recycled: recData,
    filtration: filData,
  };

  const current = tankMap[activeTab] || colData;

  const handleCopy = (text, key) => {
    navigator.clipboard?.writeText(typeof text === "string" ? text : JSON.stringify(text, null, 2));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
              <Database size={20} className="text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  AWS Open Source Water Storage Inspector
                </h2>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold">
                  LIVE TELEMETRY PERSISTENCE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Exact destinations and schemas where water storage data is persisted in AWS Open Source tracks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tank Selector Tabs */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 mr-1">
            Water Storage Unit:
          </span>
          <button
            onClick={() => setActiveTab("collection")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "collection"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            <Droplets size={14} className={activeTab === "collection" ? "text-white" : "text-blue-600"} />
            <span>Collection Tank (Greywater)</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                activeTab === "collection" ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {colData.volumeLiters} L ({colData.percent}%)
            </span>
          </button>

          <button
            onClick={() => setActiveTab("recycled")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "recycled"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            <Droplets size={14} className={activeTab === "recycled" ? "text-white" : "text-emerald-600"} />
            <span>Recycled Tank (Treated)</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                activeTab === "recycled" ? "bg-emerald-700 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              {recData.volumeLiters} L ({recData.percent}%)
            </span>
          </button>

          <button
            onClick={() => setActiveTab("filtration")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "filtration"
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            <Layers size={14} className={activeTab === "filtration" ? "text-white" : "text-teal-600"} />
            <span>Filtration Bank</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                activeTab === "filtration" ? "bg-teal-700 text-white" : "bg-gray-100 text-gray-600"
              }`}
            >
              Stage {filData.currentStage}/3
            </span>
          </button>
        </div>

        {/* Modal Body: AWS Services Storage Breakdown */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Current Storage Unit Banner */}
          <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">{current.badge}</span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono border border-slate-700">
                  {current.sensor || "Multi-stage sensors"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">{current.title}</h3>
              {current.distanceCm !== undefined && (
                <p className="text-xs text-slate-300 mt-0.5">
                  Live Sonar Surface Distance: <span className="text-emerald-400 font-mono font-bold">{current.distanceCm} cm</span> • Ultrasonic Echo Latency: <span className="text-emerald-400 font-mono">1.1 ms</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Live Water Volume</p>
                <p className="text-sm font-bold text-white font-mono">
                  {current.volumeLiters !== undefined ? `${current.volumeLiters} / ${current.capacityLiters} L` : current.stageName}
                </p>
              </div>
            </div>
          </div>

          {/* Service 1: DynamoDB (LocalStack Engine) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  ⚡
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">
                    1. Amazon DynamoDB (LocalStack / NoSQL Engine)
                  </h4>
                  <p className="text-[11px] text-gray-500 font-mono">
                    Table: <span className="text-blue-700 font-bold">{current.dynamoDb.table}</span> • Partition Key: <span className="text-gray-700">{current.dynamoDb.partitionKey}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCopy(current.dynamoDb.payload, "dynamo")}
                className="flex items-center gap-1 text-[11px] font-bold text-gray-600 hover:text-blue-600 bg-white border border-gray-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {copiedKey === "dynamo" ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                <span>{copiedKey === "dynamo" ? "Copied" : "Copy Item"}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-950 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-48">
              <pre>{JSON.stringify(current.dynamoDb.payload, null, 2)}</pre>
            </div>
          </div>

          {/* Service 2: OpenSearch 2.x Telemetry Index */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  🔍
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">
                    2. OpenSearch 2.x (Open Source Search &amp; Telemetry)
                  </h4>
                  <p className="text-[11px] text-gray-500 font-mono">
                    Index: <span className="text-amber-700 font-bold">{current.openSearch.index}</span> • Doc ID: <span className="text-gray-700">{current.openSearch.docId}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCopy(current.openSearch.payload, "opensearch")}
                className="flex items-center gap-1 text-[11px] font-bold text-gray-600 hover:text-amber-600 bg-white border border-gray-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {copiedKey === "opensearch" ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                <span>{copiedKey === "opensearch" ? "Copied" : "Copy Doc"}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-950 font-mono text-[11px] text-amber-300 overflow-x-auto max-h-48">
              <pre>{JSON.stringify(current.openSearch.payload, null, 2)}</pre>
            </div>
          </div>

          {/* Service 3: Amazon S3 Cold Storage Archive */}
          {current.s3 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs">
                    🪣
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">
                      3. Amazon S3 / MinIO (Object Storage via LocalStack)
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Bucket: <span className="font-mono font-bold text-green-700">{current.s3.bucket}</span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold">
                  {current.s3.storageClass}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5 text-xs text-gray-700 font-mono break-all border border-gray-200">
                <span className="text-gray-400 select-none">Object Key: </span>
                {current.s3.objectKey}
              </div>
              <p className="text-[11px] text-gray-500">
                Encryption: <span className="font-semibold text-gray-700">{current.s3.encrypted}</span> • Retention Policy: <span className="font-semibold text-gray-700">{current.s3.retentionPolicy}</span>
              </p>
            </div>
          )}

          {/* Service 4: AWS Cedar Safety Invariants */}
          {current.cedarPolicy && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                    🛡️
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">
                      4. AWS Cedar Policy Engine (Safety Invariants)
                    </h4>
                    <p className="text-[11px] text-gray-500 font-mono">
                      Policy File: <span className="text-purple-700 font-bold">{current.cedarPolicy.policyFile}</span>
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    current.cedarPolicy.isSafe
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {current.cedarPolicy.status}
                </span>
              </div>
              <div className="bg-slate-900 text-purple-200 rounded-lg p-3 font-mono text-[11px] border border-slate-800">
                <pre>{current.cedarPolicy.policyText}</pre>
              </div>
            </div>
          )}

          {/* Service 5: AWS EventBridge Alert Routing */}
          {current.eventBridge && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                  📡
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">
                    5. AWS EventBridge (The Plumbing / Event Routing)
                  </h4>
                  <p className="text-[11px] text-gray-500 font-mono">
                    Bus: <span className="text-rose-700 font-bold">{current.eventBridge.busName}</span> • Rule: <span className="text-gray-700">{current.eventBridge.ruleName}</span>
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                {current.eventBridge.currentTrigger}
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-600" />
            <span>All water storage telemetry is synchronized with OpenSearch, DynamoDB, and S3</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
