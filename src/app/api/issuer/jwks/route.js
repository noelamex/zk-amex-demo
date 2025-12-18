export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
  const jwk = JSON.parse(process.env.ISSUER_PUBLIC_JWK);

  return NextResponse.json({
    keys: [
      {
        ...jwk,
        kid: "amex-ed25519-2025-01",
        use: "sig",
        alg: "EdDSA",
      },
    ],
  });
}
