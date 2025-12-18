export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDemoIssuerPubKey } from "@/lib/credential";
import { hexToFieldHex } from "@/lib/challenge";
import { validateChallenge, consumeChallenge } from "@/lib/challengeStore";
import { verifyIssuerCredential } from "@/lib/issuerJws";
import { isRevoked } from "@/lib/revocationStore";

export async function POST(request) {
  try {
    const body = await request.json();
    const { proof, credentialToken, challengeHex, contextHex } = body;

    if (!proof || !credentialToken || !challengeHex || !contextHex) {
      return NextResponse.json(
        { error: "Missing proof, credentialToken, challengeHex, contextHex" },
        { status: 400 }
      );
    }

    // 1) Verify issuer signature (normal crypto)
    const payload = await verifyIssuerCredential(credentialToken);
    const { issuerPubKey, dobCommitHex, jti } = payload;

    // 🔒 revocation check
    if (isRevoked(jti)) {
      return NextResponse.json({ error: "Credential revoked" }, { status: 400 });
    }

    // 2) Issuer trust (Amex)
    if (issuerPubKey !== getDemoIssuerPubKey()) {
      return NextResponse.json({ error: "Issuer not trusted" }, { status: 400 });
    }

    // 3) Check challenge lifecycle + context binding at the app layer
    const challengeCheck = validateChallenge(challengeHex, contextHex);
    if (!challengeCheck.ok) {
      return NextResponse.json({ error: challengeCheck.error }, { status: 400 });
    }

    const publicInputs = proof.publicInputs || [];
    if (publicInputs.length < 6) {
      return NextResponse.json({ error: "Unexpected publicInputs length" }, { status: 400 });
    }

    // Circuit order:
    // [cutoff_year, cutoff_month, cutoff_day, challenge, context, dob_commit]
    const challengeFromProof = publicInputs[3];
    const contextFromProof = publicInputs[4];
    const dobCommitFromProof = publicInputs[5];

    if (challengeFromProof.toLowerCase() !== hexToFieldHex(challengeHex).toLowerCase())
      return NextResponse.json({ error: "Challenge mismatch" }, { status: 400 });

    if (contextFromProof.toLowerCase() !== hexToFieldHex(contextHex).toLowerCase())
      return NextResponse.json({ error: "Context mismatch" }, { status: 400 });

    if (dobCommitFromProof.toLowerCase() !== hexToFieldHex(dobCommitHex).toLowerCase())
      return NextResponse.json({ error: "DOB commitment mismatch" }, { status: 400 });

    // 4) Verify proof
    const resp = await fetch("http://localhost:4000/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proof }),
    });
    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data.error || "Verifier service error");
    }

    // If fully valid, mark the challenge as used (single-use)
    if (data.valid) {
      consumeChallenge(challengeHex);
    }

    return NextResponse.json({ valid: data.valid });
  } catch (err) {
    console.error("Error in verify-age21 API:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
