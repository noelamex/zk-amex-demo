// src/app/api/issuer/issue-credential/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { computeDobCommitField, fieldToHex } from "@/lib/dobCommitPoseidon";
import { signIssuerCredential } from "@/lib/issuerJws";
import { activateCommitHex } from "@/lib/activeMerkle";

export async function POST(request) {
  try {
    const { dobYear, dobMonth, dobDay } = await request.json();

    const dobCommit = await computeDobCommitField(dobYear, dobMonth, dobDay);
    const dobCommitHex = fieldToHex(dobCommit);

    const payload = { dobCommitHex };
    const { token: credentialToken, kid } = await signIssuerCredential(payload);

    // Only activate if issuance succeeded
    activateCommitHex(dobCommitHex);
    return NextResponse.json({ credentialToken, kid });
  } catch (e) {
    console.error("Issue credential error:", e);
    return NextResponse.json({ error: "Internal issuer error" }, { status: 500 });
  }
}
