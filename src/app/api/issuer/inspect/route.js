export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { verifyIssuerCredential } from "@/lib/issuerJws";
export async function POST(req) {
  const { credentialToken } = await req.json();
  const payload = await verifyIssuerCredential(credentialToken);
  return NextResponse.json(payload);
}
