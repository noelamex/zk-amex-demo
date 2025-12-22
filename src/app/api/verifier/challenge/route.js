export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { generateChallengeHex } from "@/lib/challenge";
import { registerChallenge, TTL_MS } from "@/lib/challengeStore";
import { buildContextStr, contextStrToHex } from "@/lib/context";

export async function GET() {
  const challengeHex = generateChallengeHex();

  // Vendor-defined context (canonical)
  const contextStr = buildContextStr({
    domain: "publix.com",
    purpose: "age21",
    terminalId: "pos-001",
  });

  const contextHex = contextStrToHex(contextStr);

  const issuedAt = Date.now();
  const expiresAt = issuedAt + TTL_MS;

  // Store expected binding server-side
  registerChallenge(challengeHex, contextHex, issuedAt);

  return NextResponse.json({ challengeHex, contextStr, contextHex, issuedAt, expiresAt });
}
