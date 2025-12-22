export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { hexToFieldHex } from "@/lib/challenge";
import { validateChallenge, consumeChallenge } from "@/lib/challengeStore";
import { verifyCredentialToken } from "@/lib/verifierJwt";
import { getActiveRootHex } from "@/lib/activeMerkle";

export async function POST(request) {
  try {
    const body = await request.json();
    const { presentation } = body;
    if (!presentation) {
      return NextResponse.json({ error: "Missing presentation" }, { status: 400 });
    }

    const { version, proof, credentialToken, challengeHex, contextHex, presentationIssuedAt } =
      presentation;

    if (version !== "1") {
      return NextResponse.json({ error: "Unsupported presentation version" }, { status: 400 });
    }

    // Verify issuer signature (normal crypto)
    const { payload, issuer } = await verifyCredentialToken(credentialToken);
    const { dobCommitHex } = payload;

    if (!dobCommitHex) {
      return NextResponse.json({ error: "Token missing dobCommitHex" }, { status: 400 });
    }

    // Check challenge lifecycle + context binding at the app layer
    const challengeCheck = validateChallenge(challengeHex, contextHex);
    if (!challengeCheck.ok) {
      return NextResponse.json({ error: challengeCheck.error }, { status: 400 });
    }

    const publicInputs = proof.publicInputs || [];
    if (publicInputs.length < 7) {
      return NextResponse.json({ error: "Unexpected publicInputs length" }, { status: 400 });
    }

    // Circuit order:
    // [cutoff_year, cutoff_month, cutoff_day, challenge, context, dob_commit, active_root]
    const challengeFromProof = publicInputs[3];
    const contextFromProof = publicInputs[4];
    const dobCommitFromProof = publicInputs[5];
    const rootFromProof = publicInputs[6];

    const expectedRoot = hexToFieldHex(getActiveRootHex());

    if (challengeFromProof.toLowerCase() !== hexToFieldHex(challengeHex).toLowerCase())
      return NextResponse.json({ error: "Challenge mismatch" }, { status: 400 });

    if (contextFromProof.toLowerCase() !== hexToFieldHex(contextHex).toLowerCase())
      return NextResponse.json({ error: "Context mismatch" }, { status: 400 });

    if (dobCommitFromProof.toLowerCase() !== hexToFieldHex(dobCommitHex).toLowerCase())
      return NextResponse.json({ error: "DOB commitment mismatch" }, { status: 400 });

    if (rootFromProof.toLowerCase() !== expectedRoot.toLowerCase()) {
      return NextResponse.json({ error: "Active root mismatch" }, { status: 400 });
    }

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

    return NextResponse.json({ valid: data.valid, issuer: issuer.iss });
  } catch (err) {
    console.error("Error in verify-age21 API:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
