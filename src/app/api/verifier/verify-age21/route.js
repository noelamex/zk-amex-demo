// app/api/verifier/verify-age21/route.js
import { NextResponse } from "next/server";
import { verifyAmexAge21 } from "@/lib/zkBackend";
import { getDemoIssuerPubKey } from "@/lib/credential";

export async function POST(request) {
  try {
    const body = await request.json();
    const { proof, issuerPubKey } = body;

    if (!proof || !issuerPubKey) {
      return NextResponse.json({ error: "Missing proof or issuerPubKey" }, { status: 400 });
    }

    // Check issuer against trusted list (here we only trust demo Amex).
    if (issuerPubKey !== getDemoIssuerPubKey()) {
      return NextResponse.json({ error: "Issuer not trusted" }, { status: 400 });
    }

    // New zkBackend signature: only takes proof
    const valid = await verifyAmexAge21(proof);

    return NextResponse.json({ valid });
  } catch (err) {
    console.error("Error in verify-age21:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
