import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/track/pv
// Increments the page view counter for today. Called client-side on every navigation.
// No personal data is stored ,only a date and a count.
export async function POST() {
  const date = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  try {
    await prisma.pageView.upsert({
      where: { date },
      update: { count: { increment: 1 } },
      create: { date, count: 1 },
    });
  } catch {
    // Silently fail ,analytics should never break the user experience
  }

  return NextResponse.json({ ok: true });
}
