export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { generateChallengeHex, getContextHex } from "@/lib/challenge";
import { registerChallenge } from "@/lib/challengeStore";

export async function GET() {
  const challengeHex = generateChallengeHex();
  const contextHex = getContextHex();
  registerChallenge(challengeHex, contextHex);
  return NextResponse.json({ challengeHex, contextHex });
}
