"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import ProductSelector from "@/components/ProductSelector";

interface Props {
  onSubmit: (brief: Record<string, string | boolean>, productId: string) => void;
  loading: boolean;
}

export default function InstagramForm({ onSubmit, loading }: Props) {
  const [productId, setProductId] = useState("");
  const [contentPillar, setContentPillar] = useState("Form Factor");
  const [angle, setAngle] = useState("");
  const [imageContext, setImageContext] = useState("");
  const [hashtags, setHashtags] = useState(true);
  const [wordLimit, setWordLimit] = useState("Standard");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ contentPillar, angle, imageContext, hashtags, wordLimit }, productId);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ProductSelector
        value={productId}
        onChange={(id: string, _p: Product | null) => setProductId(id)}
      />

      <Field label="Content pillar" required>
        <select value={contentPillar} onChange={(e) => setContentPillar(e.target.value)} className={selectClass}>
          {["Form Factor", "Lifestyle", "Sustainability", "Design & Aesthetics", "Personalisation", "Gifting"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>

      <Field label="Angle / idea" hint="e.g. travel, airport packing, carry-on essentials">
        <textarea value={angle} onChange={(e) => setAngle(e.target.value)} rows={2} className={textareaClass} />
      </Field>

      <Field label="Image context" hint="Brief description of what's in the photo">
        <textarea value={imageContext} onChange={(e) => setImageContext(e.target.value)} rows={2} className={textareaClass} />
      </Field>

      <Field label="Length">
        <select value={wordLimit} onChange={(e) => setWordLimit(e.target.value)} className={selectClass}>
          {["Short (1 sentence)", "Standard (2-3 sentences)", "Long (3+ sentences)"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={hashtags}
          onChange={(e) => setHashtags(e.target.checked)}
          className="w-4 h-4 rounded border-[#e8e6e3] text-[#323250] focus:ring-[#323250]"
        />
        <span className="text-sm text-[#3D4246]">Include hashtags</span>
      </label>

      <SubmitButton loading={loading} disabled={!productId} />
    </form>
  );
}

// Shared primitives
export function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#323250] mb-1">
        {label}{required && <span className="text-[#BB3C55] ml-0.5">*</span>}
        {hint && <span className="font-normal text-[#999] ml-1">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

export function SubmitButton({ loading, disabled }: { loading: boolean; disabled: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full py-2.5 rounded bg-[#323250] text-white text-sm font-medium hover:bg-[#2a2a44] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Generating..." : "Generate copy"}
    </button>
  );
}

export const inputClass = "w-full px-3 py-2 rounded border border-[#e8e6e3] bg-white text-sm text-[#3D4246] focus:outline-none focus:border-[#323250] transition-colors";
export const selectClass = "w-full px-3 py-2 rounded border border-[#e8e6e3] bg-white text-sm text-[#3D4246] focus:outline-none focus:border-[#323250] transition-colors";
export const textareaClass = "w-full px-3 py-2 rounded border border-[#e8e6e3] bg-white text-sm text-[#3D4246] focus:outline-none focus:border-[#323250] transition-colors resize-none";
