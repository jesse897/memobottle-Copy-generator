"use client";

import { useState } from "react";
import MultiProductSelector from "@/components/MultiProductSelector";
import { Field, SubmitButton, textareaClass, selectClass } from "./InstagramForm";

interface Props {
  onSubmit: (brief: Record<string, string | boolean>, productId: string, productIds?: string[]) => void;
  loading: boolean;
}

const FORMAT_OPTIONS = [
  "General",
  "Blog post",
  "Instagram script",
  "TikTok script",
  "YouTube script",
  "Email",
];

export default function GeneralForm({ onSubmit, loading }: Props) {
  const [prompt, setPrompt] = useState("");
  const [format, setFormat] = useState("General");
  const [productIds, setProductIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(
      { prompt, format: format !== "General" ? format : "", notes },
      "",
      productIds.length > 0 ? productIds : undefined
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <Field label="What do you need written?" required hint="e.g. A blog post about why flat bottles are better for travel, a TikTok script about the Slim, an email to a wholesale partner">
        <textarea
          required
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={8}
          placeholder="Describe what you need — the format, the angle, the audience, what you want people to feel or do after reading it."
          className={`${textareaClass} border-2 border-[#323250]/20 focus:border-[#323250]`}
        />
      </Field>

      <Field label="Format">
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className={selectClass}
        >
          {FORMAT_OPTIONS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </Field>

      <div>
        <label className="block text-xs font-medium text-[#323250] mb-1">
          Products <span className="font-normal text-[#999]">— optional, include for product-specific content</span>
        </label>
        <MultiProductSelector
          value={productIds}
          onChange={setProductIds}
        />
      </div>

      <Field label="Additional notes" hint="anything else to factor in">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={textareaClass}
        />
      </Field>

      <SubmitButton loading={loading} disabled={!prompt} />
    </form>
  );
}
