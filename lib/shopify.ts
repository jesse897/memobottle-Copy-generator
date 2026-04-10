import { prisma } from "./prisma";

export interface ShopifyVariant {
  id: number;
  title: string;
  sku: string;
  price: string;
}

export interface ShopifyImage {
  src: string;
  alt: string | null;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  product_type: string;
  body_html: string;
  tags: string;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function getAccessToken(): Promise<string> {
  const shop = process.env.SHOPIFY_STORE;
  if (!shop) throw new Error("SHOPIFY_STORE not set");

  const token = await prisma.shopifyToken.findUnique({ where: { shop } });
  if (!token) throw new Error("Not authenticated with Shopify. Visit /api/shopify/auth to authenticate.");

  if (new Date() > new Date(token.expiresAt)) {
    throw new Error("Shopify token has expired. Visit /api/shopify/auth to re-authenticate.");
  }

  return token.accessToken;
}

export async function fetchAllShopifyProducts(): Promise<ShopifyProduct[]> {
  const shop = process.env.SHOPIFY_STORE;
  if (!shop) throw new Error("SHOPIFY_STORE not set");

  const accessToken = await getAccessToken();
  const products: ShopifyProduct[] = [];
  let pageInfo: string | null = null;

  do {
    const url = new URL(`https://${shop}/admin/api/2024-01/products.json`);
    url.searchParams.set("limit", "250");
    url.searchParams.set("status", "active");
    if (pageInfo) url.searchParams.set("page_info", pageInfo);

    const res = await fetch(url.toString(), {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Shopify API error ${res.status}: ${text}`);
    }

    const data = await res.json();
    products.push(...data.products);

    const linkHeader = res.headers.get("Link");
    pageInfo = null;
    if (linkHeader) {
      const nextMatch = linkHeader.match(/<[^>]+page_info=([^&>]+)[^>]*>;\s*rel="next"/);
      if (nextMatch) pageInfo = nextMatch[1];
    }
  } while (pageInfo);

  return products;
}

export interface ShopifyCollectionRaw {
  id: number;
  title: string;
  handle: string;
  body_html: string;
}

export async function fetchAllShopifyCollections(): Promise<ShopifyCollectionRaw[]> {
  const shop = process.env.SHOPIFY_STORE;
  if (!shop) throw new Error("SHOPIFY_STORE not set");
  const accessToken = await getAccessToken();

  const results: ShopifyCollectionRaw[] = [];

  // Fetch both custom and smart collections
  for (const type of ["custom_collections", "smart_collections"]) {
    let pageInfo: string | null = null;
    do {
      const url = new URL(`https://${shop}/admin/api/2024-01/${type}.json`);
      url.searchParams.set("limit", "250");
      if (pageInfo) url.searchParams.set("page_info", pageInfo);

      const res = await fetch(url.toString(), {
        headers: { "X-Shopify-Access-Token": accessToken, "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Shopify API error ${res.status}: ${text}`);
      }
      const data = await res.json();
      const key = type === "custom_collections" ? "custom_collections" : "smart_collections";
      results.push(...(data[key] || []));

      const linkHeader = res.headers.get("Link");
      pageInfo = null;
      if (linkHeader) {
        const nextMatch = linkHeader.match(/<[^>]+page_info=([^&>]+)[^>]*>;\s*rel="next"/);
        if (nextMatch) pageInfo = nextMatch[1];
      }
    } while (pageInfo);
  }

  return results;
}

export async function fetchCollectionProductIds(collectionId: number): Promise<string[]> {
  const shop = process.env.SHOPIFY_STORE;
  if (!shop) throw new Error("SHOPIFY_STORE not set");
  const accessToken = await getAccessToken();

  const productIds: string[] = [];
  let pageInfo: string | null = null;

  do {
    const url = new URL(`https://${shop}/admin/api/2024-01/collections/${collectionId}/products.json`);
    url.searchParams.set("limit", "250");
    url.searchParams.set("fields", "id");
    if (pageInfo) url.searchParams.set("page_info", pageInfo);

    const res = await fetch(url.toString(), {
      headers: { "X-Shopify-Access-Token": accessToken, "Content-Type": "application/json" },
    });
    if (!res.ok) break;

    const data = await res.json();
    productIds.push(...(data.products || []).map((p: { id: number }) => String(p.id)));

    const linkHeader = res.headers.get("Link");
    pageInfo = null;
    if (linkHeader) {
      const nextMatch = linkHeader.match(/<[^>]+page_info=([^&>]+)[^>]*>;\s*rel="next"/);
      if (nextMatch) pageInfo = nextMatch[1];
    }
  } while (pageInfo);

  return productIds;
}

export function parseCollectionForDB(c: ShopifyCollectionRaw, productIds: string[]) {
  return {
    shopifyId: String(c.id),
    title: c.title,
    handle: c.handle,
    description: stripHtml(c.body_html || ""),
    productIds,
    syncedAt: new Date(),
  };
}

export function parseProductForDB(p: ShopifyProduct) {
  return {
    shopifyId: String(p.id),
    title: p.title,
    handle: p.handle,
    productType: p.product_type || null,
    description: stripHtml(p.body_html),
    variants: p.variants.map((v) => ({
      title: v.title,
      sku: v.sku,
      price: v.price,
    })),
    tags: p.tags || null,
    images: p.images.slice(0, 3).map((img) => ({
      src: img.src,
      alt: img.alt || "",
    })),
    specs: null,
    syncedAt: new Date(),
  };
}
