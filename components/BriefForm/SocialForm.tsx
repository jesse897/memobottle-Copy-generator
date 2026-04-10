"use client";

import { useState, useRef } from "react";
import { Product } from "@/lib/types";
import ProductSelector from "@/components/ProductSelector";
import { Field, SubmitButton, inputClass, selectClass, textareaClass } from "./InstagramForm";

interface Props {
  onSubmit: (brief: Record<string, string | boolean>, productId: string) => void;
  loading: boolean;
}

export default function SocialForm({ onSubmit, loading }: Props) {
  const [productId, setProductId] = useState("");
  const [contentPillar, setContentPillar] = useState("");
  const [customPillar, setCustomPillar] = useState("");
  const [mediaContext, setMediaContext] = useState("");
  const [hookStyle, setHookStyle] = useState("General");
  const [angle, setAngle] = useState("");
  const [hashtags, setHashtags] = useState(true);
  const [wordLimit, setWordLimit] = useState("Standard");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState("image/jpeg");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const mime = file.type || "image/jpeg";
    setImageMimeType(mime);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      // result is data:image/jpeg;base64,<data> — strip the prefix
      const base64 = result.split(",")[1];
      setImageBase64(base64);
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImageBase64(null);
    setImagePreview(null);
    setImageMimeType("image/jpeg");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const resolvedPillar = contentPillar === "Other" ? customPillar : contentPillar;
    const brief: Record<string, string | boolean> = {
      ...(resolvedPillar ? { contentPillar: resolvedPillar } : {}),
      mediaContext,
      hookStyle,
      angle,
      hashtags,
      wordLimit,
    };
    if (imageBase64) {
      brief.imageBase64 = imageBase64;
      brief.imageMimeType = imageMimeType;
    }
    onSubmit(brief, productId);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ProductSelector
        value={productId}
        onChange={(id: string, _p: Product | null) => setProductId(id)}
      />

      {/* Angle — primary input, visually prominent */}
      <div className="rounded-lg border-2 border-[#323250] bg-white p-3 space-y-1">
        <label className="block text-xs font-semibold text-[#323250]">
          Your idea
          <span className="font-normal text-[#999] ml-1">— what do you want to say?</span>
        </label>
        <textarea
          value={angle}
          onChange={(e) => setAngle(e.target.value)}
          rows={4}
          placeholder="e.g. how it fits flat in a carry-on, a desk setup post, works for festivals..."
          className="w-full px-0 py-1 bg-transparent text-sm text-[#3D4246] placeholder:text-[#ccc] focus:outline-none resize-none"
        />
      </div>

      <Field label="Content pillar">
        <select
          value={contentPillar}
          onChange={(e) => { setContentPillar(e.target.value); setCustomPillar(""); }}
          className={selectClass}
        >
          <option value="">— none —</option>
          {["Form Factor", "Lifestyle", "Sustainability", "Design & Aesthetics", "Personalisation", "Gifting", "Other"].map(
            (o) => <option key={o}>{o}</option>
          )}
        </select>
        {contentPillar === "Other" && (
          <input
            type="text"
            value={customPillar}
            onChange={(e) => setCustomPillar(e.target.value)}
            placeholder="Describe the content pillar"
            className={`${inputClass} mt-2`}
          />
        )}
      </Field>

      <Field label="Hook style">
        <select
          value={hookStyle}
          onChange={(e) => setHookStyle(e.target.value)}
          className={selectClass}
        >
          {["General", "Statement", "Question", "Observation", "Challenge"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>

      <Field label="Photo or video context" hint="Optional — what's in the content">
        <textarea
          value={mediaContext}
          onChange={(e) => setMediaContext(e.target.value)}
          rows={2}
          className={textareaClass}
        />
      </Field>

      {/* Image upload */}
      <div>
        <label className="block text-xs font-medium text-[#323250] mb-1">
          Upload image
          <span className="font-normal text-[#999] ml-1">— Claude will write copy for it</span>
        </label>
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Upload preview"
              className="w-full rounded border border-[#e8e6e3] object-cover max-h-40"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-1.5 right-1.5 bg-white/90 hover:bg-white text-[#555] text-xs px-2 py-1 rounded border border-[#e8e6e3] transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <label className="flex items-center justify-center w-full h-16 rounded border border-dashed border-[#e8e6e3] bg-white cursor-pointer hover:border-[#323250] transition-colors">
            <span className="text-xs text-[#999]">Click to upload</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
            />
          </label>
        )}
      </div>

      <Field label="Length">
        <select
          value={wordLimit}
          onChange={(e) => setWordLimit(e.target.value)}
          className={selectClass}
        >
          {["Short", "Standard", "Long"].map((o) => (
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
