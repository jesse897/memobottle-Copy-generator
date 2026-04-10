import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const shop = process.env.SHOPIFY_STORE;
  if (!shop) return NextResponse.json({ authenticated: false, productCount: 0, lastSyncedAt: null });

  const [token, productCount, latestProduct] = await Promise.all([
    prisma.shopifyToken.findUnique({ where: { shop } }),
    prisma.product.count(),
    prisma.product.findFirst({ orderBy: { syncedAt: "desc" }, select: { syncedAt: true } }),
  ]);

  if (!token) {
    return NextResponse.json({
      authenticated: false,
      productCount,
      lastSyncedAt: latestProduct?.syncedAt ?? null,
    });
  }

  const expired = new Date() > new Date(token.expiresAt);
  return NextResponse.json({
    authenticated: !expired,
    expiresAt: token.expiresAt,
    expired,
    productCount,
    lastSyncedAt: latestProduct?.syncedAt ?? null,
  });
}
