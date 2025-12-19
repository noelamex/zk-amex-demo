export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { verifyIssuerCredential } from "@/lib/issuerJws";
import { getWitnessForCommitHex } from "@/lib/activeMerkle";

export async function POST(req) {
  try {
    const { credentialToken } = await req.json();
    if (!credentialToken) {
      return NextResponse.json({ error: "Missing credentialToken" }, { status: 400 });
    }

    const payload = await verifyIssuerCredential(credentialToken);
    const { dobCommitHex } = payload;
    if (!dobCommitHex) {
      return NextResponse.json({ error: "Token missing dobCommitHex" }, { status: 400 });
    }

    // This throws if commit not active
    const w = getWitnessForCommitHex(dobCommitHex);

    return NextResponse.json({
      dobCommitHex,
      ...w,
    });
  } catch (e) {
    const msg = String(e?.message || e);

    // ✅ expected case after deactivation
    if (msg.toLowerCase().includes("not active") || msg.toLowerCase().includes("commit not active")) {
      return NextResponse.json(
        { error: "Credential is not active (deactivated). Re-issue a new credential." },
        { status: 400 }
      );
    }

    console.error("presentation-params error:", e);
    return NextResponse.json({ error: "Failed to build presentation params" }, { status: 500 });
  }
}
