"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Channel, CopyVariation } from "@/lib/types";
import { isValidChannel } from "@/lib/channels";
import BriefForm from "@/components/BriefForm/index";
import OutputPanel from "@/components/OutputPanel";

const CHANNEL_LABELS: Record<Channel, string> = {
  social: "Social",
  edm: "EDM",
  pdp: "Product Description",
  general: "General",
};

const CHANNEL_DESCRIPTIONS: Record<Channel, string> = {
  social: "Hook line + caption for Instagram and TikTok",
  edm: "Subject line, hero headline, body, CTA",
  pdp: "Short description, bullets, full description, and SEO fields",
  general: "Blogs, video scripts, emails — freeform brand copy",
};

export default function GeneratePage() {
  const params = useParams();
  const channelParam = params.channel as string;

  const [variations, setVariations] = useState<CopyVariation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [model, setModel] = useState("");
  const [examplesUsed, setExamplesUsed] = useState(0);
  const [showOutput, setShowOutput] = useState(false);

  // Reset output when channel changes
  useEffect(() => {
    setVariations([]);
    setShowOutput(false);
    setError("");
  }, [channelParam]);

  if (!isValidChannel(channelParam)) {
    return (
      <div className="p-8">
        <p className="text-sm text-[#BB3C55]">Invalid channel: {channelParam}</p>
      </div>
    );
  }

  const channel = channelParam as Channel;

  async function handleGenerate(brief: Record<string, string | boolean>, productId: string, productIds?: string[]) {
    setLoading(true);
    setError("");
    setShowOutput(true);
    setVariations([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, brief, productId, productIds }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Generation failed");
        setShowOutput(false);
        return;
      }
      setVariations(json.data.variations);
      setModel(json.data.model);
      setExamplesUsed(json.data.examplesUsed);
    } catch {
      setError("Network error — please try again");
      setShowOutput(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Brief panel */}
      <div className="w-80 shrink-0 border-r border-[#e8e6e3] bg-white overflow-y-auto">
        <div className="p-6 border-b border-[#e8e6e3]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-0.5">
            {CHANNEL_LABELS[channel]}
          </p>
          <h1 className="text-lg font-semibold text-[#323250]">Generate copy</h1>
          <p className="text-xs text-[#999] mt-0.5">{CHANNEL_DESCRIPTIONS[channel]}</p>
        </div>
        <div className="p-6">
          <BriefForm channel={channel} onSubmit={handleGenerate} loading={loading} />
        </div>
      </div>

      {/* Output panel */}
      <div className="flex-1 overflow-y-auto p-8">
        {error && (
          <div className="mb-4 p-4 bg-[#BB3C55]/10 rounded border border-[#BB3C55]/20">
            <p className="text-sm text-[#BB3C55]">{error}</p>
          </div>
        )}

        {!showOutput && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-4xl mb-4">✦</p>
            <p className="text-sm text-[#999] max-w-xs">
              Fill in the brief on the left and hit Generate — you'll get 3 on-brand options.
            </p>
          </div>
        )}

        {showOutput && (
          <OutputPanel
            variations={variations}
            channel={channel}
            model={model}
            examplesUsed={examplesUsed}
          />
        )}
      </div>
    </div>
  );
}
