export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDemoIssuerPubKey } from "@/lib/credential";
import { hexToFieldHex } from "@/lib/challenge";

export async function POST(request) {
  try {
    const body = await request.json();
    const { proof, issuerPubKey, challengeHex, contextHex } = body;

    if (!proof || !issuerPubKey || !challengeHex || !contextHex) {
      return NextResponse.json(
        { error: "Missing proof, issuerPubKey, challengeHex or contextHex" },
        { status: 400 }
      );
    }

    // 1) Issuer trust (Amex)
    if (issuerPubKey !== getDemoIssuerPubKey()) {
      return NextResponse.json({ error: "Issuer not trusted" }, { status: 400 });
    }

    const publicInputs = proof.publicInputs || [];
    if (publicInputs.length < 5) {
      return NextResponse.json({ error: "Unexpected publicInputs length" }, { status: 400 });
    }

    // Order from circuit:
    // [cutoff_year, cutoff_month, cutoff_day, challenge, context]
    const challengeFromProof = publicInputs[3];
    const contextFromProof = publicInputs[4];

    const expectedChallengeFieldHex = hexToFieldHex(challengeHex);
    const expectedContextFieldHex = hexToFieldHex(contextHex);

    // 2) Challenge binding
    if (
      typeof challengeFromProof !== "string" ||
      challengeFromProof.toLowerCase() !== expectedChallengeFieldHex.toLowerCase()
    ) {
      return NextResponse.json({ error: "Challenge mismatch" }, { status: 400 });
    }

    // 3) Context binding
    if (
      typeof contextFromProof !== "string" ||
      contextFromProof.toLowerCase() !== expectedContextFieldHex.toLowerCase()
    ) {
      return NextResponse.json({ error: "Context mismatch" }, { status: 400 });
    }

    // 4) Forward to verifier service (math check)
    const resp = await fetch("http://localhost:4000/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proof }),
    });
    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data.error || "Verifier service error");
    }

    return NextResponse.json({ valid: data.valid });
  } catch (err) {
    console.error("Error in verify-age21 API:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
