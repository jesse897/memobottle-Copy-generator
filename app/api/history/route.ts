import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidChannel } from "@/lib/channels";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 50);

  const where = channel && isValidChannel(channel) ? { channel } : {};

  try {
    const history = await prisma.generationHistory.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json({ data: history });
  } catch (error) {
    console.error("GET /api/history error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
