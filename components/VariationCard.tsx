"use client";

import { useState } from "react";
import { CopyVariation, EDMCopy, SocialCopy, PDPCopy, GeneralCopy, Channel } from "@/lib/types";

interface Props {
  variation: CopyVariation;
  channel: Channel;
  index: number;
}

function CopyDisplay({ copy, channel }: { copy: CopyVariation["copy"]; channel: Channel }) {
  if (channel === "social" && typeof copy === "object" && "hook" in copy) {
    const c = copy as SocialCopy;
    return (
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-1">Hook</p>
          <p className="text-sm text-[#323250] font-medium">{c.hook}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-1">Caption</p>
          <p className="text-sm text-[#3D4246] whitespace-pre-wrap">{c.caption}</p>
        </div>
      </div>
    );
  }

  if (channel === "edm" && typeof copy === "object" && "subjectLine" in copy) {
    const c = copy as EDMCopy;
    return (
      <div className="space-y-3">
        {[
          { label: "Subject line", value: c.subjectLine },
          { label: "Preview text", value: c.previewText },
          { label: "Hero headline", value: c.heroHeadline },
          { label: "Body", value: c.body },
          { label: "CTA", value: c.cta },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-1">{label}</p>
            <p className="text-sm text-[#3D4246] whitespace-pre-wrap">{value}</p>
          </div>
        ))}
      </div>
    );
  }

  if (channel === "pdp" && typeof copy === "object" && "shortDesc" in copy) {
    const c = copy as PDPCopy;
    return (
      <div className="space-y-3">
        {c.shortDesc && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-1">Short description</p>
            <p className="text-sm text-[#3D4246]">{c.shortDesc}</p>
          </div>
        )}
        {c.bullets && c.bullets.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-1">Bullets</p>
            <ul className="space-y-1">
              {c.bullets.map((b, i) => (
                <li key={i} className="text-sm text-[#3D4246] flex gap-2">
                  <span className="text-[#ADDADF] mt-0.5">—</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {c.fullDesc && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-1">Full description</p>
            <p className="text-sm text-[#3D4246]">{c.fullDesc}</p>
          </div>
        )}
        {(c.seoTitle || c.seoMetaDesc) && (
          <div className="border-t border-[#f0eeeb] pt-3 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999]">SEO</p>
            {c.seoTitle && (
              <div>
                <p className="text-[10px] text-[#bbb] mb-0.5">Title <span className="text-[#ddd]">({c.seoTitle.length} chars)</span></p>
                <p className="text-sm text-[#3D4246]">{c.seoTitle}</p>
              </div>
            )}
            {c.seoMetaDesc && (
              <div>
                <p className="text-[10px] text-[#bbb] mb-0.5">Meta description <span className="text-[#ddd]">({c.seoMetaDesc.length} chars)</span></p>
                <p className="text-sm text-[#3D4246]">{c.seoMetaDesc}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (channel === "general" && typeof copy === "object" && "headline" in copy) {
    const c = copy as GeneralCopy;
    return (
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-1">Headline</p>
          <p className="text-sm text-[#323250] font-medium">{c.headline}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-1">Body</p>
          <p className="text-sm text-[#3D4246] whitespace-pre-wrap">{c.body}</p>
        </div>
      </div>
    );
  }

  return <p className="text-sm text-[#3D4246] whitespace-pre-wrap">{String(copy)}</p>;
}

function copyToClipboard(copy: CopyVariation["copy"], channel: Channel): string {
  if (channel === "edm" && typeof copy === "object" && "subjectLine" in copy) {
    const c = copy as EDMCopy;
    return `Subject: ${c.subjectLine}\nPreview: ${c.previewText}\n\n${c.heroHeadline}\n\n${c.body}\n\n${c.cta}`;
  }
  if (channel === "social" && typeof copy === "object" && "hook" in copy) {
    const c = copy as SocialCopy;
    return `HOOK: ${c.hook}\n\n${c.caption}`;
  }
  if (channel === "pdp" && typeof copy === "object" && "shortDesc" in copy) {
    const c = copy as PDPCopy;
    const bullets = c.bullets?.map((b) => `- ${b}`).join("\n") || "";
    const seo = [
      c.seoTitle ? `SEO Title: ${c.seoTitle}` : "",
      c.seoMetaDesc ? `SEO Meta: ${c.seoMetaDesc}` : "",
    ].filter(Boolean).join("\n");
    return [c.shortDesc, bullets, c.fullDesc, seo].filter(Boolean).join("\n\n");
  }
  if (channel === "general" && typeof copy === "object" && "headline" in copy) {
    const c = copy as GeneralCopy;
    return `${c.headline}\n\n${c.body}`;
  }
  return String(copy);
}

export default function VariationCard({ variation, channel, index }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const text = copyToClipboard(variation.copy, channel);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="memo-card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#ADDADF]">
          Option {index + 1}
        </span>
        <button
          onClick={handleCopy}
          className={`text-xs px-2.5 py-1 rounded border transition-colors ${
            copied
              ? "border-[#58735A] bg-[#58735A]/10 text-[#58735A]"
              : "border-[#e8e6e3] text-[#555] hover:border-[#323250] hover:text-[#323250]"
          }`}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <CopyDisplay copy={variation.copy} channel={channel} />

      {variation.rationale && (
        <p className="text-xs text-[#999] border-t border-[#f0eeeb] pt-3 italic">
          {variation.rationale}
        </p>
      )}
    </div>
  );
}
