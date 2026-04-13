import { Channel, Product, CopyVariation } from "./types";
import { getChannel } from "./channels";
import { TOV_GUIDE } from "./tov";

function formatProductBlock(product: Product): string {
  const lines: string[] = [];
  lines.push(`PRODUCT: ${product.title}`);
  if (product.productType && product.productType !== "Collection") {
    lines.push(`TYPE: ${product.productType}`);
  }
  if (product.description) lines.push(`DESCRIPTION: ${product.description}`);
  if (product.tags) lines.push(`TAGS / COLOURWAYS: ${product.tags}`);
  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (variants.length > 0) {
    const variantList = variants
      .slice(0, 12)
      .map((v: { title: string; sku: string; price: string }) =>
        `${v.title} (SKU: ${v.sku}, $${v.price})`
      )
      .join(", ");
    lines.push(`VARIANTS: ${variantList}`);
  }
  return lines.join("\n");
}

// Format brief fields into a readable block for the user message
function formatBrief(
  channel: Channel,
  brief: Record<string, string | boolean>,
  product: Product | null,
  products?: Product[]   // EDM multi-product
): string {
  const lines: string[] = [];

  // EDM: structured brief with new fields at top
  if (channel === "edm") {
    const theme = typeof brief.theme === "string" ? brief.theme.trim() : "";
    const emailType = typeof brief.emailType === "string" ? brief.emailType : "";
    const commercialObjective = typeof brief.commercialObjective === "string" ? brief.commercialObjective : "";
    const customerType = typeof brief.customerType === "string" ? brief.customerType : "";
    const ctaAction = typeof brief.ctaAction === "string" ? brief.ctaAction : "";
    const ctaUrl = typeof brief.ctaUrl === "string" ? brief.ctaUrl : "";
    const wordLimit = typeof brief.wordLimit === "string" ? brief.wordLimit : "";
    const includeFooter = brief.includeFooter;

    if (theme) lines.push(`THEME (overriding): ${theme}`);
    if (emailType) lines.push(`EMAIL TYPE: ${emailType}`);
    if (commercialObjective) lines.push(`COMMERCIAL OBJECTIVE: ${commercialObjective}`);
    if (customerType) lines.push(`CUSTOMER TYPE: ${customerType}`);

    // Products
    const productList = products && products.length > 0 ? products : product ? [product] : [];
    if (productList.length === 0) {
      lines.push(`PRODUCTS: None — brand / lifestyle focus`);
    } else if (productList.length === 1) {
      lines.push("");
      lines.push(formatProductBlock(productList[0]));
    } else {
      lines.push("");
      lines.push(`PRODUCTS (${productList.length}):`);
      for (const p of productList) {
        lines.push("---");
        lines.push(formatProductBlock(p));
      }
    }

    lines.push("");
    if (ctaAction) lines.push(`CTA: ${ctaAction}${ctaUrl ? ` → ${ctaUrl}` : ""}`);
    if (wordLimit) lines.push(`LENGTH: ${wordLimit}`);
    if (includeFooter !== undefined) lines.push(`FOOTER: ${includeFooter ? "Yes — include B Corp / Water.org block" : "No"}`);

    return lines.join("\n");
  }

  // PDP: structured brief
  if (channel === "pdp") {
    lines.push(`NEW PRODUCT NAME: ${brief.productName || ""}`);
    lines.push(`\nPRODUCT BRIEF:\n${brief.productBrief || ""}`);

    if (product) {
      lines.push(`\nSIMILAR TO (use as structural and tonal reference — match register, bullet style, and form factor framing):`);
      lines.push(formatProductBlock(product));
    }

    if (brief.additionalNotes) lines.push(`\nADDITIONAL NOTES: ${brief.additionalNotes}`);

    return lines.join("\n");
  }

  // General: freeform prompt + optional products
  if (channel === "general") {
    const format = typeof brief.format === "string" && brief.format ? brief.format : null;
    const prompt = typeof brief.prompt === "string" ? brief.prompt : "";
    const notes = typeof brief.notes === "string" && brief.notes ? brief.notes : null;

    if (format) lines.push(`FORMAT: ${format}`);
    lines.push(`BRIEF: ${prompt}`);

    const productList = products && products.length > 0 ? products : product ? [product] : [];
    if (productList.length > 0) {
      lines.push("");
      if (productList.length === 1) {
        lines.push(formatProductBlock(productList[0]));
      } else {
        lines.push(`PRODUCTS (${productList.length}):`);
        for (const p of productList) {
          lines.push("---");
          lines.push(formatProductBlock(p));
        }
      }
    }

    if (notes) lines.push(`\nADDITIONAL NOTES: ${notes}`);

    return lines.join("\n");
  }

  // Social: original format
  if (product) {
    lines.push(formatProductBlock(product));
  }

  const skip = new Set(["productId", "productIds", "imageBase64", "imageMimeType", "theme"]);
  for (const [key, val] of Object.entries(brief)) {
    if (skip.has(key)) continue;
    if (val === "" || val === undefined) continue;
    const label = key
      .replace(/([A-Z])/g, " $1")
      .toUpperCase()
      .trim();
    if (typeof val === "boolean") {
      lines.push(`${label}: ${val ? "Yes" : "No"}`);
    } else {
      lines.push(`${label}: ${val}`);
    }
  }

  return lines.join("\n");
}

function formatExamples(examples: { copyText: string }[]): string {
  if (examples.length === 0) return "";
  const list = examples
    .map((e, i) => `Example ${i + 1}:\n${e.copyText}`)
    .join("\n\n");
  return `VOICE REFERENCE — 5 YEARS OF APPROVED MEMOBOTTLE COPY:
These are real posts that have been published and approved. This is the voice standard. Your output must match this register precisely — the rhythm, the sentence length, the confidence, the dry wit where it appears, the way product truths are stated rather than sold. Do not write in a different register and then adjust. Start from this voice.

${list}`;
}

function outputFormatInstruction(channel: Channel): string {
  const base = `RESPONSE FORMAT:
Return exactly 3 variations as a valid JSON array. No markdown fences, no preamble, no explanation outside the JSON.`;

  if (channel === "social") {
    return `${base}

[
  { "id": 1, "copy": { "hook": "Max 8 word hook line", "caption": "1-3 sentence caption. Hashtags on new line if requested." }, "rationale": "One sentence explaining the angle." },
  { "id": 2, "copy": { "hook": "...", "caption": "..." }, "rationale": "..." },
  { "id": 3, "copy": { "hook": "...", "caption": "..." }, "rationale": "..." }
]`;
  }

  if (channel === "edm") {
    return `${base}

[
  {
    "id": 1,
    "copy": {
      "subjectLine": "Subject line here",
      "previewText": "Preview text that extends the subject",
      "heroHeadline": "HERO HEADLINE",
      "body": "Para 1.\\n\\nPara 2.\\n\\nPara 3.",
      "cta": "Shop Now"
    },
    "rationale": "One sentence."
  },
  { "id": 2, "copy": { "subjectLine": "...", "previewText": "...", "heroHeadline": "...", "body": "...", "cta": "..." }, "rationale": "..." },
  { "id": 3, "copy": { "subjectLine": "...", "previewText": "...", "heroHeadline": "...", "body": "...", "cta": "..." }, "rationale": "..." }
]`;
  }

  if (channel === "pdp") {
    return `${base}

[
  {
    "id": 1,
    "copy": {
      "shortDesc": "1-2 sentence short description.",
      "bullets": ["Bullet one.", "Bullet two.", "Bullet three.", "Bullet four."],
      "fullDesc": "2-4 sentence full description.",
      "seoTitle": "Product Name — Key differentiator (max 60 chars)",
      "seoMetaDesc": "Benefit-led sentence that reads naturally, 140-155 characters."
    },
    "rationale": "One sentence."
  },
  { "id": 2, "copy": { "shortDesc": "...", "bullets": ["..."], "fullDesc": "...", "seoTitle": "...", "seoMetaDesc": "..." }, "rationale": "..." },
  { "id": 3, "copy": { "shortDesc": "...", "bullets": ["..."], "fullDesc": "...", "seoTitle": "...", "seoMetaDesc": "..." }, "rationale": "..." }
]`;
  }

  if (channel === "general") {
    return `${base}

[
  { "id": 1, "copy": { "headline": "Title of the piece", "body": "Full content here. Can span multiple paragraphs separated by \\n\\n." }, "rationale": "One sentence explaining the angle." },
  { "id": 2, "copy": { "headline": "...", "body": "..." }, "rationale": "..." },
  { "id": 3, "copy": { "headline": "...", "body": "..." }, "rationale": "..." }
]`;
  }

  return base;
}

export function buildSystemPrompt(
  channel: Channel,
  examples: { copyText: string }[]
): string {
  const channelConfig = getChannel(channel);
  const examplesBlock = formatExamples(examples);

  const parts = [
    TOV_GUIDE,
    "---",
    channelConfig.rules,
  ];

  if (examplesBlock) {
    parts.push("---", examplesBlock);
  }

  parts.push("---", outputFormatInstruction(channel));

  return parts.join("\n\n");
}

export function buildUserMessage(
  channel: Channel,
  brief: Record<string, string | boolean>,
  product: Product | null,
  products?: Product[]   // EDM multi-product
): string {
  const channelLabel = channel === "social" ? "SOCIAL (INSTAGRAM / TIKTOK)" : channel.toUpperCase();

  // Social: angle field as CRITICAL DIRECTION
  const angle = channel === "social" && typeof brief.angle === "string" && brief.angle.trim()
    ? brief.angle.trim()
    : null;

  // EDM: theme field as CRITICAL DIRECTION
  const theme = channel === "edm" && typeof brief.theme === "string" && brief.theme.trim()
    ? brief.theme.trim()
    : null;

  const criticalDirection = angle
    ? `\n\nCRITICAL DIRECTION — this is the angle all 3 variations must be built around: "${angle}". Do not default to generic product copy. Every variation should clearly reflect this specific direction.`
    : theme
    ? `\n\nCRITICAL DIRECTION — this is the overriding theme all 3 email variations must be built around: "${theme}". Every variation — subject line, hero, body — must serve this theme. Do not drift toward generic product copy.`
    : "";

  return `Generate copy for the following brief:

CHANNEL: ${channelLabel}

${formatBrief(channel, brief, product, products)}${criticalDirection}`;
}

export function parseVariations(raw: string): CopyVariation[] {
  // Strip markdown fences if present
  let cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  // Try direct parse first
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed as CopyVariation[];
  } catch {
    // fall through to extraction
  }

  // Claude added preamble/postamble — extract the JSON array from within the text
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (match) {
    const parsed = JSON.parse(match[0]);
    if (Array.isArray(parsed)) return parsed as CopyVariation[];
  }

  throw new Error("Could not extract JSON array from response");
}
