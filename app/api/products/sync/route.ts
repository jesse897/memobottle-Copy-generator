import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  fetchAllShopifyProducts,
  parseProductForDB,
  fetchAllShopifyCollections,
  fetchCollectionProductIds,
  parseCollectionForDB,
} from "@/lib/shopify";

export async function POST() {
  try {
    // Sync products
    const shopifyProducts = await fetchAllShopifyProducts();
    let syncedProducts = 0;
    for (const p of shopifyProducts) {
      const data = parseProductForDB(p);
      await prisma.product.upsert({
        where: { shopifyId: data.shopifyId },
        update: data,
        create: data,
      });
      syncedProducts++;
    }

    // Sync collections (custom + smart)
    const shopifyCollections = await fetchAllShopifyCollections();
    let syncedCollections = 0;
    for (const c of shopifyCollections) {
      const productIds = await fetchCollectionProductIds(c.id);
      const data = parseCollectionForDB(c, productIds);
      await (prisma as any).collection.upsert({
        where: { shopifyId: data.shopifyId },
        update: data,
        create: data,
      });
      syncedCollections++;
    }

    return NextResponse.json({
      data: { syncedProducts, syncedCollections },
    });
  } catch (error) {
    console.error("POST /api/products/sync error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
