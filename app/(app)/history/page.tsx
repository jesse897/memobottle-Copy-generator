"use client";

import { useState, useEffect } from "react";
import { GenerationHistory, Channel, CopyVariation, EDMCopy, SocialCopy, PDPCopy } from "@/lib/types";

const CHANNEL_LABELS: Record<Channel, string> = {
  social: "Social",
  edm: "EDM",
  pdp: "PDP",
  general: "Free Style",
};

function summariseCopy(variation: CopyVariation, channel: Channel): string {
  const copy = variation.copy;
  if (channel === "edm" && typeof copy === "object" && "subjectLine" in copy) {
    return (copy as EDMCopy).subjectLine;
  }
  if (channel === "social" && typeof copy === "object" && "hook" in copy) {
    return (copy as SocialCopy).hook;
  }
  if (channel === "pdp" && typeof copy === "object" && "shortDesc" in copy) {
    return (copy as PDPCopy).shortDesc;
  }
  return String(copy).slice(0, 80);
}

function HistoryRow({ record }: { record: GenerationHistory }) {
  const [expanded, setExpanded] = useState(false);
  const channel = record.channel as Channel;
  const output = Array.isArray(record.output) ? (record.output as CopyVariation[]) : [];

  return (
    <div className="memo-card overflow-hidden">
      <button
        className="w-full text-left p-4 flex items-center justify-between hover:bg-[#f5f4f2] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded bg-[#323250]/10 text-[#323250]">
            {CHANNEL_LABELS[channel]}
          </span>
          <span className="text-sm text-[#3D4246] truncate max-w-sm">
            {output[0] ? summariseCopy(output[0], channel) : "No output"}
          </span>
        </div>
        <span className="text-xs text-[#999] shrink-0 ml-4">
          {new Date(record.createdAt).toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-[#f0eeeb] p-4 space-y-4">
          {/* Brief */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-2">Brief</p>
            <div className="space-y-1">
              {Object.entries(record.brief as Record<string, string | boolean>).map(([k, v]) => (
                <div key={k} className="flex gap-2 text-xs">
                  <span className="text-[#999] capitalize min-w-28">{k.replace(/([A-Z])/g, " $1")}</span>
                  <span className="text-[#3D4246]">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Outputs */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-2">Options generated</p>
            <div className="space-y-3">
              {output.map((v, i) => (
                <div key={i} className="bg-[#f5f4f2] rounded p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#ADDADF] mb-1">Option {i + 1}</p>
                  <pre className="text-xs text-[#3D4246] whitespace-pre-wrap font-sans">
                    {typeof v.copy === "object"
                      ? JSON.stringify(v.copy, null, 2)
                      : String(v.copy)}
                  </pre>
                  {v.rationale && (
                    <p className="text-xs text-[#999] italic mt-2">{v.rationale}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-[#bbb]">{record.model}</p>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState<Channel | "all">("all");

  useEffect(() => {
    const url = channelFilter === "all" ? "/api/history" : `/api/history?channel=${channelFilter}`;
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((json) => { if (json.data) setHistory(json.data); })
      .finally(() => setLoading(false));
  }, [channelFilter]);

  const channels: Array<Channel | "all"> = ["all", "social", "edm", "pdp"];

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-[#323250]">Generation history</h1>
        <p className="text-xs text-[#999] mt-0.5">Last 50 generations per channel</p>
      </div>

      {/* Channel filter */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {channels.map((c) => (
          <button
            key={c}
            onClick={() => setChannelFilter(c)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              channelFilter === c
                ? "bg-[#323250] text-white"
                : "text-[#555] hover:text-[#323250] bg-white border border-[#e8e6e3]"
            }`}
          >
            {c === "all" ? "All" : CHANNEL_LABELS[c]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="memo-card p-4 animate-pulse flex gap-3">
              <div className="h-4 w-16 bg-[#e8e6e3] rounded" />
              <div className="h-4 flex-1 bg-[#e8e6e3] rounded" />
              <div className="h-4 w-20 bg-[#e8e6e3] rounded" />
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-[#999]">No history yet. Generate some copy to see it here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((r) => (
            <HistoryRow key={r.id} record={r} />
          ))}
        </div>
      )}
    </div>
  );
}
