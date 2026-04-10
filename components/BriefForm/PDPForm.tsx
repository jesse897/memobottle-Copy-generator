"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import ProductSelector from "@/components/ProductSelector";
import { Field, SubmitButton, textareaClass, selectClass, inputClass } from "./InstagramForm";

interface Props {
  onSubmit: (brief: Record<string, string | boolean>, productId: string) => void;
  loading: boolean;
}

export default function PDPForm({ onSubmit, loading }: Props) {
  const [productName, setProductName] = useState("");
  const [productBrief, setProductBrief] = useState("");
  const [similarToId, setSimilarToId] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(
      { productName, productBrief, additionalNotes },
      similarToId
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <Field label="Product name" required>
        <input
          type="text"
          required
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="e.g. memobottle A5 in Powder Blue"
          className={inputClass}
        />
      </Field>

      <Field label="Product brief" required hint="specs, material, finish, what makes it different">
        <textarea
          required
          value={productBrief}
          onChange={(e) => setProductBrief(e.target.value)}
          rows={6}
          placeholder={`e.g. New colourway — Powder Blue. Soft, sky-toned blue with a matte finish. Available on the Original memobottle across A5, A6, A7, and Slim sizes. Same flat, paper-inspired form factor. Made for people who want something calm and understated. Pairs well with the matching Silicone Sleeve and Lid.`}
          className={textareaClass}
        />
      </Field>

      <div>
        <label className="block text-xs font-medium text-[#323250] mb-1">
          Similar to <span className="font-normal text-[#999]">— optional, use as structural reference</span>
        </label>
        <ProductSelector
          value={similarToId}
          onChange={(id: string, _p: Product | null) => setSimilarToId(id)}
          required={false}
        />
        {similarToId && (
          <p className="text-[10px] text-[#999] mt-1">
            Existing product data will be sent as context — Claude will match the register and structure.
          </p>
        )}
      </div>

      <Field label="Additional notes" hint="anything else to factor in">
        <textarea
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          rows={2}
          className={textareaClass}
        />
      </Field>

      <SubmitButton loading={loading} disabled={!productName || !productBrief} />
    </form>
  );
}
