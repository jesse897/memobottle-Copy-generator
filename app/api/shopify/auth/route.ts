import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const shop = process.env.SHOPIFY_STORE;
  const redirectUri = process.env.SHOPIFY_REDIRECT_URI;

  if (!clientId || !shop || !redirectUri) {
    return NextResponse.json({ error: "Shopify credentials not configured" }, { status: 500 });
  }

  const scopes = "read_products";
  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return NextResponse.redirect(authUrl);
}
