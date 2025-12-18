export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { revokedJtis } from "@/lib/revocationStore";

export async function GET() {
  return NextResponse.json({
    revoked: Array.from(revokedJtis),
  });
}
