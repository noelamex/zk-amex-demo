// src/app/api/issuer/issue-credential/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { computeDobCommitField, fieldToHex } from "@/lib/dobCommitPoseidon";
import { getDemoIssuerPubKey } from "@/lib/credential";
import { signIssuerCredential } from "@/lib/issuerJws";

export async function POST(request) {
  try {
    const { dobYear, dobMonth, dobDay } = await request.json();

    const dobCommit = await computeDobCommitField(dobYear, dobMonth, dobDay);
    const dobCommitHex = fieldToHex(dobCommit);

    // Payload contains NO DOB, just the commitment + metadata
    const payload = {
      issuer: "amex-demo",
      issuerPubKey: getDemoIssuerPubKey(),
      dobCommitHex,
      issuedAt: Date.now(),
    };

    const credentialToken = await signIssuerCredential(payload);
    return NextResponse.json({ credentialToken });
  } catch (e) {
    console.error("Issue credential error:", e);
    return NextResponse.json({ error: "Internal issuer error" }, { status: 500 });
  }
}
