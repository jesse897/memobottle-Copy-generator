"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import ProductSelector from "@/components/ProductSelector";
import { Field, SubmitButton, textareaClass, selectClass, inputClass } from "./InstagramForm";

interface Props {
  onSubmit: (brief: Record<string, string | boolean>, productId: string) => void;
  loading: boolean;
}

export default function TikTokForm({ onSubmit, loading }: Props) {
  const [productId, setProductId] = useState("");
  const [videoContext, setVideoContext] = useState("");
  const [hookStyle, setHookStyle] = useState("Statement");
  const [angle, setAngle] = useState("");
  const [trend, setTrend] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ videoContext, hookStyle, angle, trend }, productId);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ProductSelector value={productId} onChange={(id: string, _p: Product | null) => setProductId(id)} />

      <Field label="What's happening in the video" required>
        <textarea
          required
          value={videoContext}
          onChange={(e) => setVideoContext(e.target.value)}
          rows={3}
          placeholder="e.g. Packing a carry-on bag, showing how the Slim fits flat between clothes"
          className={textareaClass}
        />
      </Field>

      <Field label="Hook style">
        <select value={hookStyle} onChange={(e) => setHookStyle(e.target.value)} className={selectClass}>
          {["Statement", "Question", "Observation", "Challenge"].map((o) => <option key={o}>{o}</option>)}
        </select>
      </Field>

      <Field label="Angle / idea" hint="Optional direction">
        <textarea value={angle} onChange={(e) => setAngle(e.target.value)} rows={2} className={textareaClass} />
      </Field>

      <Field label="Trend or sound" hint="Optional — if the video rides a specific trend">
        <input type="text" value={trend} onChange={(e) => setTrend(e.target.value)} className={inputClass} />
      </Field>

      <SubmitButton loading={loading} disabled={!productId || !videoContext} />
    </form>
  );
}
