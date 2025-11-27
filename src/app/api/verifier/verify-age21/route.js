export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDemoIssuerPubKey } from "@/lib/credential";

export async function POST(request) {
  try {
    const body = await request.json();
    const { proof, issuerPubKey } = body;

    if (!proof || !issuerPubKey) {
      return NextResponse.json({ error: "Missing proof or issuerPubKey" }, { status: 400 });
    }

    // 1) Issuer trust check (Amex)
    if (issuerPubKey !== getDemoIssuerPubKey()) {
      return NextResponse.json({ error: "Issuer not trusted" }, { status: 400 });
    }

    // 2) Forward proof to the verifier service
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
