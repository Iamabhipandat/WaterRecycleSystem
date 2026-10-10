import { useState } from "react";
import {
  Database,
  Search,
  Archive,
  ShieldCheck,
  Radio,
  ExternalLink,
  Droplets,
  Layers,
  ChevronRight,
  Sparkles,
  Info,
} from "lucide-react";
import {
  getCollectionTankAwsStorage,
  getRecycledTankAwsStorage,
  getFiltrationUnitAwsStorage,
} from "../services/awsStorageService";

export default function WaterStorageAwsMapping({ systemState, onInspectTank }) {
  const col = getCollectionTankAwsStorage(systemState);
  const rec = getRecycledTankAwsStorage(systemState);
  const fil = getFiltrationUnitAwsStorage(systemState);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Database size={16} />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              Water Storage Telemetry: AWS Open Source Storage Mapping
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time persistence architecture showing where each tank's volume, sensors, and state are stored in AWS Open Source tracks.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full shrink-0">
          <Sparkles size={13} className="text-amber-600" />
          <span className="text-xs font-bold text-amber-800">LocalStack &amp; OpenSearch Live</span>
        </div>
      </div>

      {/* Grid of Water Storage Tanks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* STORAGE 1: COLLECTION TANK */}
        <div className="bg-slate-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Droplets size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Raw Greywater Buffer
                </span>
                <h4 className="text-sm font-bold text-gray-900">Collection Tank (100 L)</h4>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-blue-700 font-mono">{col.volumeLiters} L</span>
              <span className="text-xs text-gray-400 font-medium ml-1">/ 100 L ({col.percent}%)</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, col.percent)}%` }}
            />
          </div>

          {/* Where data is stored in AWS Open Source */}
          <div className="space-y-1.5 pt-1 text-xs">
            <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">
              Persistent Storage Destinations:
            </p>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 font-mono text-[11px]">
              <span className="text-gray-600 flex items-center gap-1.5">
                <span className="text-blue-600 font-bold">⚡ DynamoDB</span>
              </span>
              <span className="text-blue-700 font-bold">
                Table: JalLoopWaterMetrics <span className="text-gray-400 font-normal">[PK: ESP32_COLLECTION_TANK_01]</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 font-mono text-[11px]">
              <span className="text-gray-600 flex items-center gap-1.5">
                <span className="text-amber-600 font-bold">🔍 OpenSearch</span>
              </span>
              <span className="text-amber-700 font-bold">
                Index: jalloop-water-telemetry <span className="text-gray-400 font-normal">[_type: doc]</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 font-mono text-[11px]">
              <span className="text-gray-600 flex items-center gap-1.5">
                <span className="text-green-600 font-bold">🪣 Amazon S3</span>
              </span>
              <span className="text-green-700 font-bold truncate max-w-[210px] sm:max-w-xs">
                s3://jalloop-water-archive-default/collection-tank/
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 font-mono text-[11px]">
              <span className="text-gray-600 flex items-center gap-1.5">
                <span className="text-purple-600 font-bold">🛡️ Cedar Policy</span>
              </span>
              <span className="text-purple-700 font-bold">
                Rule: DryRunLockout <span className="text-green-600">[{col.cedarPolicy.status.split(" ")[0]}]</span>
              </span>
            </div>
          </div>

          {/* Inspect Button */}
          <button
            onClick={() => onInspectTank && onInspectTank("collection")}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <span>Inspect Live AWS DynamoDB &amp; OpenSearch JSON</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* STORAGE 2: RECYCLED TANK */}
        <div className="bg-slate-50 border border-emerald-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Droplets size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  Clean Non-Potable Reservoir
                </span>
                <h4 className="text-sm font-bold text-gray-900">Recycled Tank (200 L)</h4>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-emerald-700 font-mono">{rec.volumeLiters} L</span>
              <span className="text-xs text-gray-400 font-medium ml-1">/ 200 L ({rec.percent}%)</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, rec.percent)}%` }}
            />
          </div>

          {/* Where data is stored in AWS Open Source */}
          <div className="space-y-1.5 pt-1 text-xs">
            <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">
              Persistent Storage Destinations:
            </p>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 font-mono text-[11px]">
              <span className="text-gray-600 flex items-center gap-1.5">
                <span className="text-blue-600 font-bold">⚡ DynamoDB</span>
              </span>
              <span className="text-blue-700 font-bold">
                Table: JalLoopWaterMetrics <span className="text-gray-400 font-normal">[PK: ESP32_RECYCLED_TANK_02]</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 font-mono text-[11px]">
              <span className="text-gray-600 flex items-center gap-1.5">
                <span className="text-amber-600 font-bold">🔍 OpenSearch</span>
              </span>
              <span className="text-amber-700 font-bold">
                Index: jalloop-water-telemetry <span className="text-gray-400 font-normal">[_type: doc]</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 font-mono text-[11px]">
              <span className="text-gray-600 flex items-center gap-1.5">
                <span className="text-green-600 font-bold">🪣 Amazon S3</span>
              </span>
              <span className="text-green-700 font-bold truncate max-w-[210px] sm:max-w-xs">
                s3://jalloop-water-archive-default/recycled-tank/
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 font-mono text-[11px]">
              <span className="text-gray-600 flex items-center gap-1.5">
                <span className="text-purple-600 font-bold">🛡️ Cedar Policy</span>
              </span>
              <span className="text-purple-700 font-bold">
                Rule: OverflowLockout <span className="text-green-600">[{rec.cedarPolicy.status.split(" ")[0]}]</span>
              </span>
            </div>
          </div>

          {/* Inspect Button */}
          <button
            onClick={() => onInspectTank && onInspectTank("recycled")}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <span>Inspect Live AWS DynamoDB &amp; OpenSearch JSON</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
