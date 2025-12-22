export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { loadKeyring } from "@/lib/issuerKeys";

export async function GET() {
  const ring = loadKeyring();

  return NextResponse.json({
    keys: ring.map((e) => ({
      ...e.publicJwk,
      kid: e.kid,
      use: "sig",
      alg: "EdDSA",
    })),
  });
}
