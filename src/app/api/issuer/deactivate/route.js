export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { deactivateCommitHex, getActiveRootHex } from "@/lib/activeMerkle";
import { verifyIssuerCredential } from "@/lib/issuerJws";

export async function POST(req) {
  try {
    const { credentialToken } = await req.json();
    if (!credentialToken) {
      return NextResponse.json({ error: "Missing credentialToken" }, { status: 400 });
    }

    // Verify token + extract commitment
    const payload = await verifyIssuerCredential(credentialToken);
    const dobCommitHex = payload?.dobCommitHex;
    if (!dobCommitHex) {
      return NextResponse.json({ error: "Token missing dobCommitHex" }, { status: 400 });
    }

    const ok = deactivateCommitHex(dobCommitHex);
    if (!ok) {
      return NextResponse.json({ error: "Commit not active" }, { status: 400 });
    }

    return NextResponse.json({
      deactivated: true,
      activeRootHex: getActiveRootHex(),
    });
  } catch (e) {
    console.error("Deactivate error:", e);
    return NextResponse.json({ error: "Internal deactivate error" }, { status: 500 });
  }
}
