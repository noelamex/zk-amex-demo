export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { generateChallengeHex } from "@/lib/challenge";

export async function GET() {
  const challengeHex = generateChallengeHex();
  return NextResponse.json({ challengeHex });
}
