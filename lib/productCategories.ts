import { Product } from "./types";

// Category-level "products" — used when the post isn't tied to a specific size or colour.
// These are injected into the prompt exactly like a synced Shopify product.
// IDs use a "category:" prefix so the generate route can identify them without a DB lookup.

export interface CategoryProduct extends Omit<Product, "shopifyId" | "syncedAt"> {
  isCategory: true;
}

export const PRODUCT_CATEGORIES: CategoryProduct[] = [
  {
    id: "category:original",
    isCategory: true,
    title: "Original memobottle",
    handle: "original-memobottle",
    productType: "Bottle",
    description:
      "The original flat, paper-shaped reusable water bottle. Available in A5 (750ml), A6 (375ml), A7 (180ml), and Slim (450ml) sizes. Made from BPA-free Tritan plastic. Leak-proof with a simple screw lid. Designed to fit flat in bags alongside books, laptops, and everyday essentials — the flat profile is the core product truth.",
    tags: "flat, paper-shaped, BPA-free, Tritan, leak-proof, A5, A6, A7, Slim",
    variants: [],
    images: [],
    specs: {
      material: "BPA-free Tritan plastic",
      sizes: "A5 (750ml), A6 (375ml), A7 (180ml), Slim (450ml)",
      closure: "Screw lid, leak-proof",
    },
  },
  {
    id: "category:stainless",
    isCategory: true,
    title: "Stainless Steel memobottle",
    handle: "stainless-steel-memobottle",
    productType: "Bottle",
    description:
      "The memobottle form factor in premium food-grade 304 stainless steel. Same paper-inspired flat design, now with a durable powder-coat or satin sandblasted finish. Features an internalised thread mouthpiece for a clean, uninterrupted drinking experience. Available in A5, A6, A7, and Slim. Scratch-proof, stain-resistant, and built to last.",
    tags: "stainless steel, powder coat, satin, sandblasted, durable, premium, A5, A6, A7, Slim",
    variants: [],
    images: [],
    specs: {
      material: "Food-grade 304 stainless steel",
      finish: "Powder coat or satin sandblasted",
      sizes: "A5, A6, A7, Slim",
      mouthpiece: "Internalised thread",
    },
  },
  {
    id: "category:titanium",
    isCategory: true,
    title: "Titanium memobottle",
    handle: "titanium-memobottle",
    productType: "Bottle",
    description:
      "The Titanium Ultralight memobottle — the lightest and most premium version of the flat bottle. Grade 1 titanium construction, flat enough for any bag, tough enough for outdoor and travel use. Minimal, refined, and built for those who want the best materials with no compromise on the flat form factor.",
    tags: "titanium, ultralight, premium, outdoor, travel, limited edition",
    variants: [],
    images: [],
    specs: {
      material: "Grade 1 titanium",
      profile: "Ultralight",
    },
  },
  {
    id: "category:coloured-bundle",
    isCategory: true,
    title: "Coloured Bundle",
    handle: "coloured-bundle",
    productType: "Bundle",
    description:
      "Limited-edition coloured memobottle bundles — bottle paired with matching silicone sleeve, lid, and desk stand in a coordinated colourway. Available in seasonal colours including Mandarin, Pink Salt, Pistachio, Butter Yellow, Cool Grey, and others. Designed for gifting and self-expression.",
    tags: "coloured, bundle, limited edition, gifting, colourway, seasonal",
    variants: [],
    images: [],
    specs: {
      includes: "Bottle, silicone sleeve, lid, desk stand",
      availability: "Limited edition colourways",
    },
  },
  {
    id: "category:silicone-sleeve",
    isCategory: true,
    title: "Silicone Sleeve",
    handle: "silicone-sleeve",
    productType: "Accessory",
    description:
      "Soft silicone sleeves for the memobottle. Adds grip, insulation, and a pop of colour. Available in a range of colourways to match or contrast with the bottle. Fits Original and Stainless Steel memobottles. Sold individually or as part of a bundle.",
    tags: "silicone, sleeve, accessory, colour, grip, protection, insulation",
    variants: [],
    images: [],
    specs: {
      material: "Food-grade silicone",
      function: "Grip, insulation, protection",
    },
  },
  {
    id: "category:coloured-lid",
    isCategory: true,
    title: "Coloured Lid",
    handle: "coloured-lid",
    productType: "Accessory",
    description:
      "Replacement and accent lids for the memobottle in coordinated colourways. A simple way to personalise the bottle or match a new sleeve colour. Compatible with Original memobottle sizes.",
    tags: "lid, accessory, colour, replacement, personalisation",
    variants: [],
    images: [],
    specs: {
      compatibility: "Original memobottle (A5, A6, A7, Slim)",
    },
  },
  {
    id: "category:deskstand",
    isCategory: true,
    title: "Desk Stand",
    handle: "desk-stand",
    productType: "Accessory",
    description:
      "The Universal Desk Stand gives the memobottle a home on your workspace. Holds the bottle upright on a desk, keeping it within reach without taking up a footprint. Minimal and functional, available in colourways to match the bottle range.",
    tags: "desk stand, accessory, workspace, WFH, desk setup, organisation",
    variants: [],
    images: [],
    specs: {
      compatibility: "Universal — fits all memobottle sizes",
    },
  },
  {
    id: "category:totebag",
    isCategory: true,
    title: "Tote Bag",
    handle: "tote-bag",
    productType: "Bag",
    description:
      "The memobottle tote bag — part of the expanding reusable lifestyle range. Designed with the same minimal, functional aesthetic as the bottle. Reusable, practical, and on-brand.",
    tags: "tote bag, reusable, lifestyle, bag, carry",
    variants: [],
    images: [],
    specs: null,
  },
];

export function getCategoryProduct(id: string): CategoryProduct | null {
  return PRODUCT_CATEGORIES.find((c) => c.id === id) ?? null;
}

export function isCategoryId(id: string): boolean {
  return id.startsWith("category:");
}
