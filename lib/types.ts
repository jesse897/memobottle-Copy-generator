export type Channel = "social" | "edm" | "pdp" | "general";

// ── Product from Shopify ──────────────────────────────────────────────────────

export interface ProductVariant {
  title: string;
  sku: string;
  price: string;
}

export interface ProductImage {
  src: string;
  alt: string;
}

export interface Product {
  id: string;
  shopifyId: string;
  title: string;
  handle: string;
  productType: string | null;
  description: string | null;
  variants: ProductVariant[];
  tags: string | null;
  images: ProductImage[];
  specs: Record<string, string> | null;
  syncedAt: string;
}

// ── Copy variations ───────────────────────────────────────────────────────────

export interface EDMCopy {
  subjectLine: string;
  previewText: string;
  heroHeadline: string;
  body: string;
  cta: string;
}

export interface SocialCopy {
  hook: string;
  caption: string;
}

export interface PDPCopy {
  shortDesc: string;
  bullets: string[];
  fullDesc: string;
  seoTitle: string;
  seoMetaDesc: string;
}

export interface GeneralCopy {
  headline: string;
  body: string;
}

export type CopyContent = string | EDMCopy | SocialCopy | PDPCopy | GeneralCopy;

export interface CopyVariation {
  id: number;
  copy: CopyContent;
  rationale: string;
}

// ── Generation request/response ───────────────────────────────────────────────

export interface GenerateRequest {
  channel: Channel;
  brief: Record<string, string | boolean>;
  productId?: string;      // social / pdp — single product
  productIds?: string[];   // edm — zero, one, or many products
}

export interface GenerateResponse {
  variations: CopyVariation[];
  historyId: string;
  model: string;
  examplesUsed: number;
}

// ── Shopify Collection ────────────────────────────────────────────────────────

export interface ShopifyCollection {
  id: string;
  shopifyId: string;
  title: string;
  handle: string;
  description: string | null;
  productIds: string[];
  syncedAt: string;
}

// ── Examples ──────────────────────────────────────────────────────────────────

export interface CopyExample {
  id: string;
  channel: Channel;
  copyText: string;
  notes: string | null;
  source: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── History ───────────────────────────────────────────────────────────────────

export interface GenerationHistory {
  id: string;
  channel: Channel;
  brief: Record<string, string | boolean>;
  output: CopyVariation[];
  model: string;
  createdAt: string;
}

// ── Brief forms per channel ───────────────────────────────────────────────────

export interface SocialBrief {
  productId: string;
  contentPillar: string;
  mediaContext: string;
  hookStyle: string;
  angle: string;
  hashtags: boolean;
  wordLimit: string;
}

export interface EDMBrief {
  productId: string;
  emailType: string;
  offerOrHook: string;
  tone: string;
  ctaAction: string;
  ctaUrl: string;
  includeFooter: boolean;
  wordLimit: string;
}

export interface PDPBrief {
  productId: string;
  targetUse: string;
  includeShortDesc: boolean;
  includeBullets: boolean;
  includeFullDesc: boolean;
  additionalNotes: string;
}
