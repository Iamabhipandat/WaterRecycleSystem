import { useState } from "react";
import { Sparkles, Bot, Send, CheckCircle2, ShieldCheck, Search, Activity, ChevronDown, ChevronUp } from "lucide-react";
import { runWaterAgent } from "../services/aiAgentService";

const SUGGESTED_QUERIES = [
  "Is the recycled water safe for garden irrigation?",
  "Inspect current tank capacity and water levels",
  "Evaluate Cedar safety policies for pump operation",
  "Query OpenSearch historical recycling metrics",
];

export default function SmartWaterAdvisor({ displayState }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentResult, setAgentResult] = useState(null);
  const [showThoughts, setShowThoughts] = useState(false);

  const handleAsk = async (textToRun) => {
    const promptText = textToRun || query;
    if (!promptText.trim()) return;

    setLoading(true);
    setAgentResult(null);

    try {
      const res = await runWaterAgent(promptText, displayState);
      setAgentResult(res);
      setQuery("");
    } catch (err) {
      console.error("AI Agent error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
            <Bot size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">AI Water Advisor</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Strands Agents SDK
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Autonomous reasoning agent evaluating water quality, Cedar policies, and system efficiency.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-100 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Agent Active</span>
        </div>
      </div>

      {/* Suggested Prompt Pills */}
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_QUERIES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => handleAsk(q)}
            className="text-[11px] font-medium bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-800 border border-gray-200 hover:border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-left"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask the AI agent about water purity, reuse suitability, or safety rules..."
            className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 pr-8 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={13} />
          )}
          <span>{loading ? "Thinking..." : "Analyze"}</span>
        </button>
      </form>

      {/* Agent Response */}
      {agentResult && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border border-emerald-200 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              Agent Evaluation Complete
            </span>
            <button
              type="button"
              onClick={() => setShowThoughts(!showThoughts)}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>{showThoughts ? "Hide reasoning" : "View reasoning steps"}</span>
              {showThoughts ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>

          {/* Reasoning Steps (ReAct Chain of Thought) */}
          {showThoughts && (
            <div className="p-3 bg-white/90 rounded-lg border border-emerald-100 text-[11px] font-mono space-y-1.5 text-gray-700">
              <p className="font-bold text-gray-800">// Strands Agents SDK ReAct Trace:</p>
              {agentResult.thoughts?.map((th, i) => (
                <p key={i} className="text-emerald-900">{th}</p>
              ))}
              <div className="pt-1.5 border-t border-gray-100 flex flex-wrap gap-2 text-[10px]">
                {agentResult.toolExecutions?.map((te, i) => (
                  <span key={i} className="bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    Tool Executed: {te.tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Agent Answer */}
          <div className="text-xs text-gray-800 leading-relaxed whitespace-pre-line bg-white/95 p-3.5 rounded-lg border border-emerald-100/80 shadow-2xs font-medium">
            {agentResult.answer}
          </div>
        </div>
      )}
    </div>
  );
}
