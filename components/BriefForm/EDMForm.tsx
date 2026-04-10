"use client";

import { useState } from "react";
import MultiProductSelector from "@/components/MultiProductSelector";
import { Field, SubmitButton, textareaClass, selectClass, inputClass } from "./InstagramForm";

interface Props {
  onSubmit: (brief: Record<string, string | boolean>, productId: string, productIds?: string[]) => void;
  loading: boolean;
}

const CTA_OPTIONS = [
  "Shop Now",
  "Explore the Range",
  "Shop the Collection",
  "See What's New",
  "Shop the Sale",
  "Discover More",
  "Other",
];

export default function EDMForm({ onSubmit, loading }: Props) {
  const [productIds, setProductIds] = useState<string[]>([]);
  const [theme, setTheme] = useState("");
  const [emailType, setEmailType] = useState("Evergreen");
  const [commercialObjective, setCommercialObjective] = useState("");
  const [customerType, setCustomerType] = useState("General audience");
  const [ctaOption, setCtaOption] = useState("Shop Now");
  const [ctaCustom, setCtaCustom] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [includeFooter, setIncludeFooter] = useState(true);
  const [wordLimit, setWordLimit] = useState("Standard (3-4 paras)");

  const ctaAction = ctaOption === "Other" ? ctaCustom : ctaOption;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(
      {
        theme,
        emailType,
        commercialObjective,
        customerType,
        ctaAction,
        ctaUrl,
        includeFooter,
        wordLimit,
      },
      "",          // productId unused for EDM
      productIds
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Theme — overriding direction */}
      <div className="rounded-lg border-2 border-[#323250] bg-white p-3 space-y-1">
        <label className="block text-xs font-semibold text-[#323250]">
          Theme
          <span className="font-normal text-[#999] ml-1">— the overriding idea or story for this email</span>
        </label>
        <textarea
          required
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          rows={3}
          placeholder="e.g. Summer travel — the bottle that fits where others don't. Feeling of freedom and movement."
          className="w-full px-0 py-1 bg-transparent text-sm text-[#3D4246] placeholder:text-[#ccc] focus:outline-none resize-none"
        />
      </div>

      <MultiProductSelector value={productIds} onChange={setProductIds} />

      <Field label="Email type" required>
        <select value={emailType} onChange={(e) => setEmailType(e.target.value)} className={selectClass}>
          {["Evergreen", "Product Launch", "Promotion/Sale", "Seasonal", "Restock", "New Colourway", "Welcome", "Abandoned Cart", "Winback"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>

      <Field label="Commercial objective">
        <select value={commercialObjective} onChange={(e) => setCommercialObjective(e.target.value)} className={selectClass}>
          <option value="">— none —</option>
          {["Drive sales", "New product awareness", "Re-engage lapsed customers", "Build brand affinity", "Promote a specific offer", "Grow loyalty / repeat purchase", "Drive traffic to site"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>

      <Field label="Customer type">
        <select value={customerType} onChange={(e) => setCustomerType(e.target.value)} className={selectClass}>
          {["General audience", "High intent (browsed / added to cart)", "Winback — lapsed customer", "New subscriber", "VIP / Loyal customer", "Post-purchase"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>

      <Field label="CTA" required>
        <select value={ctaOption} onChange={(e) => setCtaOption(e.target.value)} className={selectClass}>
          {CTA_OPTIONS.map((o) => <option key={o}>{o}</option>)}
        </select>
        {ctaOption === "Other" && (
          <input
            type="text"
            required
            value={ctaCustom}
            onChange={(e) => setCtaCustom(e.target.value)}
            placeholder="e.g. Explore Sage"
            className={`${inputClass} mt-2`}
          />
        )}
      </Field>

      <Field label="CTA URL" hint="Optional, for context only">
        <input type="text" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} className={inputClass} />
      </Field>

      <Field label="Length">
        <select value={wordLimit} onChange={(e) => setWordLimit(e.target.value)} className={selectClass}>
          {["Concise (1-2 short paras)", "Standard (3-4 paras)", "Long-form"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={includeFooter}
          onChange={(e) => setIncludeFooter(e.target.checked)}
          className="w-4 h-4 rounded border-[#e8e6e3] text-[#323250] focus:ring-[#323250]"
        />
        <span className="text-sm text-[#3D4246]">Include standard trust footer (B Corp, Water.org)</span>
      </label>

      <SubmitButton loading={loading} disabled={!theme || !ctaAction} />
    </form>
  );
}
