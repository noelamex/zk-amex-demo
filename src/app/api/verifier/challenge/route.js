export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { generateChallengeHex, getContextHex } from "@/lib/challenge";

export async function GET() {
  const challengeHex = generateChallengeHex();
  const contextHex = getContextHex();
  return NextResponse.json({ challengeHex, contextHex });
}
