import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAnthropic } from "@/lib/anthropic";
import { isValidChannel, getChannel } from "@/lib/channels";
import { buildSystemPrompt, buildUserMessage, parseVariations } from "@/lib/prompts";
import { GenerateRequest, Product } from "@/lib/types";
import { SOCIAL_EXAMPLES, PDP_EXAMPLES, EDM_EXAMPLES } from "@/lib/examples";
import { getCategoryProduct, isCategoryId } from "@/lib/productCategories";

const MODEL = "claude-sonnet-4-6";

// Weighted example sampling — boosts examples that match keywords from the selected product/collection
function sampleExamples(
  examples: string[],
  productContext: string,
  count = 100
): { copyText: string }[] {
  if (examples.length <= count) return examples.map((s) => ({ copyText: s }));

  // Extract keywords from product title/type/tags (lowercase, min 4 chars)
  const keywords = productContext
    .toLowerCase()
    .split(/[\s,/|]+/)
    .filter((w) => w.length >= 4);

  if (keywords.length === 0) {
    // No keywords — pure random sample
    return [...examples]
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .map((s) => ({ copyText: s }));
  }

  // Score each example by keyword matches
  const scored = examples.map((text) => {
    const lower = text.toLowerCase();
    const score = keywords.reduce((n, kw) => n + (lower.includes(kw) ? 1 : 0), 0);
    return { text, score };
  });

  // Take top 60% matching, fill remaining from random pool
  const topCount = Math.floor(count * 0.6);
  const topMatches = scored
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topCount)
    .map((e) => e.text);

  const topSet = new Set(topMatches);
  const remaining = scored
    .filter((e) => !topSet.has(e.text))
    .sort(() => Math.random() - 0.5)
    .slice(0, count - topMatches.length)
    .map((e) => e.text);

  return [...topMatches, ...remaining]
    .sort(() => Math.random() - 0.5)
    .map((s) => ({ copyText: s }));
}

export async function POST(request: NextRequest) {
  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { channel, brief, productId, productIds } = body;

  if (!channel || !isValidChannel(channel)) {
    return NextResponse.json(
      { error: "channel must be one of: social, edm, pdp" },
      { status: 400 }
    );
  }

  if (!brief || typeof brief !== "object") {
    return NextResponse.json({ error: "brief is required" }, { status: 400 });
  }

  // Extract image data from brief (only used for social channel)
  const imageBase64 = typeof brief.imageBase64 === "string" ? brief.imageBase64 : null;
  const imageMimeType = (typeof brief.imageMimeType === "string" ? brief.imageMimeType : "image/jpeg") as
    | "image/jpeg"
    | "image/png"
    | "image/gif"
    | "image/webp";

  // Strip image fields before saving to history / formatting
  const { imageBase64: _imgData, imageMimeType: _imgType, ...cleanBrief } = brief;

  // Resolve product context
  // EDM: productIds[] (multi-product) takes priority
  // Social/PDP: productId (single)
  let product: Product | null = null;
  let resolvedProducts: Product[] = [];
  let productKeywords = "";

  // EDM multi-product resolution
  if (channel === "edm" && productIds && productIds.length > 0) {
    for (const pid of productIds) {
      if (pid.startsWith("collection:")) {
        const shopifyId = pid.replace("collection:", "");
        const collection = await (prisma as any).collection.findUnique({ where: { shopifyId } });
        if (collection) {
          const collectionProducts = await prisma.product.findMany({
            where: { shopifyId: { in: (collection.productIds as string[]) } },
          });
          const variantSummary = collectionProducts
            .slice(0, 10)
            .flatMap((p: any) =>
              (p.variants as { title: string; sku: string; price: string }[]).slice(0, 3).map(
                (v) => `${p.title} — ${v.title} ($${v.price})`
              )
            )
            .join(", ");
          resolvedProducts.push({
            id: pid,
            shopifyId,
            title: collection.title,
            handle: collection.handle,
            productType: "Collection",
            description: collection.description || "",
            variants: [],
            tags: collectionProducts.map((p: any) => p.tags).filter(Boolean).join(", "),
            images: [],
            specs: variantSummary ? { variants: variantSummary } : null,
            syncedAt: collection.syncedAt,
          } as unknown as Product);
        }
      } else if (isCategoryId(pid)) {
        const cat = getCategoryProduct(pid);
        if (cat) resolvedProducts.push(cat as unknown as Product);
      } else {
        const dbProduct = await prisma.product.findUnique({ where: { id: pid } });
        if (dbProduct) resolvedProducts.push(dbProduct as unknown as Product);
      }
    }
    productKeywords = resolvedProducts.map((p) => [p.title, p.tags].filter(Boolean).join(" ")).join(" ");
  }

  if (productId) {
    if (productId.startsWith("collection:")) {
      const shopifyId = productId.replace("collection:", "");
      const collection = await (prisma as any).collection.findUnique({
        where: { shopifyId },
      });
      if (collection) {
        // Fetch all products in this collection
        const collectionProducts = await prisma.product.findMany({
          where: { shopifyId: { in: (collection.productIds as string[]) } },
        });

        // Build a synthetic product that aggregates the collection
        const variantSummary = collectionProducts
          .slice(0, 20)
          .flatMap((p: any) =>
            (p.variants as { title: string; sku: string; price: string }[]).map(
              (v) => `${p.title} — ${v.title} (SKU: ${v.sku}, $${v.price})`
            )
          )
          .join("\n");

        const descriptions = collectionProducts
          .filter((p: any) => p.description)
          .slice(0, 5)
          .map((p: any) => `${p.title}: ${p.description}`)
          .join("\n\n");

        product = {
          id: productId,
          shopifyId,
          title: collection.title,
          handle: collection.handle,
          productType: "Collection",
          description: [
            collection.description,
            descriptions ? `\n\nProducts in this collection:\n${descriptions}` : "",
          ]
            .filter(Boolean)
            .join(""),
          variants: [],
          tags: collectionProducts
            .map((p: any) => p.tags)
            .filter(Boolean)
            .join(", "),
          images: [],
          specs: variantSummary ? { variants: variantSummary } : null,
          syncedAt: collection.syncedAt,
        } as unknown as Product;

        productKeywords = [collection.title, collection.handle].join(" ");
      }
    } else if (isCategoryId(productId)) {
      const cat = getCategoryProduct(productId);
      product = cat as unknown as Product;
      productKeywords = [cat?.title, cat?.tags].filter(Boolean).join(" ");
    } else {
      const dbProduct = await prisma.product.findUnique({ where: { id: productId } });
      product = dbProduct as unknown as Product;
      productKeywords = [dbProduct?.title, dbProduct?.productType, dbProduct?.tags]
        .filter(Boolean)
        .join(" ");
    }
  }

  // Weighted example sampling — bias toward examples relevant to this product/collection
  const allExamples =
    channel === "social" ? SOCIAL_EXAMPLES : channel === "pdp" ? PDP_EXAMPLES : EDM_EXAMPLES;
  const sampled = sampleExamples(allExamples, productKeywords, 100);

  const channelConfig = getChannel(channel);
  const systemPrompt = buildSystemPrompt(channel, sampled);
  const userMessage = buildUserMessage(
    channel,
    cleanBrief,
    product as Parameters<typeof buildUserMessage>[2],
    resolvedProducts.length > 0 ? resolvedProducts as Parameters<typeof buildUserMessage>[3] : undefined
  );

  const anthropic = getAnthropic();
  let rawText: string;

  try {
    const messageContent =
      channel === "social" && imageBase64
        ? [
            {
              type: "image" as const,
              source: { type: "base64" as const, media_type: imageMimeType, data: imageBase64 },
            },
            { type: "text" as const, text: userMessage },
          ]
        : userMessage;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: channelConfig.maxTokens,
      temperature: 0.8,
      system: systemPrompt,
      messages: [{ role: "user", content: messageContent }],
    });

    const block = response.content[0];
    if (block.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }
    rawText = block.text;
  } catch (error) {
    console.error("Claude API error:", error);
    const message = error instanceof Error ? error.message : "Claude API error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  let variations;
  try {
    variations = parseVariations(rawText);
  } catch (error) {
    console.error("JSON parse error. Raw response:", rawText);
    return NextResponse.json(
      { error: "Failed to parse Claude response", raw: rawText },
      { status: 500 }
    );
  }

  // Save to history (without image data)
  const history = await prisma.generationHistory.create({
    data: {
      channel,
      brief: cleanBrief as object,
      output: variations as unknown as object,
      model: MODEL,
    },
  });

  // Prune to last 50 per channel
  const toDelete = await prisma.generationHistory.findMany({
    where: { channel },
    orderBy: { createdAt: "desc" },
    skip: 50,
    select: { id: true },
  });
  if (toDelete.length > 0) {
    await prisma.generationHistory.deleteMany({
      where: { id: { in: (toDelete as { id: string }[]).map((r) => r.id) } },
    });
  }

  return NextResponse.json({
    data: {
      variations,
      historyId: history.id,
      model: MODEL,
      examplesUsed: sampled.length,
    },
  });
}
