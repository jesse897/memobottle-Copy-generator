import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const collections = await (prisma as any).collection.findMany({
      orderBy: { title: "asc" },
    });
    return NextResponse.json({ data: collections });
  } catch (error) {
    console.error("GET /api/collections error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
