export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { revokeJti } from "@/lib/revocationStore";

export async function POST(req) {
  const { jti } = await req.json();
  revokeJti(jti);
  return NextResponse.json({ revoked: true });
}
