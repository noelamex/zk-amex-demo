import { NextResponse } from "next/server";
import { proveAmexAge21 } from "@/lib/zkBackend";
import { getAge21CutoffDate } from "@/lib/credential";

export async function POST(request) {
  try {
    const body = await request.json();
    const { credential } = body;

    if (!credential) {
      return NextResponse.json({ error: "Missing credential" }, { status: 400 });
    }

    // In this version we derive the cutoff date server-side.
    // If you prefer, you can pass it from the client instead.
    const cutoffDate = getAge21CutoffDate();

    const { proof } = await proveAmexAge21({
      credential,
      cutoffDate,
    });

    return NextResponse.json({
      proof,
      issuerPubKey: credential.issuerPubKey,
      cutoffDate,
    });
  } catch (err) {
    console.error("Error in prove-age21:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
