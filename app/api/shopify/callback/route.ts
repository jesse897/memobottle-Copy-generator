import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchAllShopifyProducts, parseProductForDB } from "@/lib/shopify";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const shop = process.env.SHOPIFY_STORE;
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  if (!code || !shop || !clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/?error=shopify_auth_failed", request.url));
  }

  // Exchange code for access token
  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/?error=shopify_token_failed", request.url));
  }

  const { access_token } = await tokenRes.json();

  // Store token — expires in 24 hours
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.shopifyToken.upsert({
    where: { shop },
    update: { accessToken: access_token, expiresAt },
    create: { shop, accessToken: access_token, expiresAt },
  });

  // Auto-sync products after every authentication so the catalogue stays current
  try {
    const shopifyProducts = await fetchAllShopifyProducts();
    for (const p of shopifyProducts) {
      const data = parseProductForDB(p);
      await prisma.product.upsert({
        where: { shopifyId: data.shopifyId },
        update: data,
        create: data,
      });
    }
  } catch (e) {
    // Don't block the redirect if sync fails — products already in DB will still work
    console.error("Auto-sync after auth failed:", e);
  }

  return NextResponse.redirect(new URL("/generate/social", request.url));
}
