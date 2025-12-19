// src/app/api/issuer/jwks/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { CURRENT_KID } from "@/lib/issuerKeys";

export async function GET() {
  const envVar = process.env.ISSUER_PUBLIC_JWK;
  if (!envVar) {
    return NextResponse.json({ error: "ISSUER_PUBLIC_JWK not set" }, { status: 500 });
  }

  let jwk;
  try {
    jwk = JSON.parse(envVar);
  } catch (e) {
    return NextResponse.json({ error: "Invalid ISSUER_PUBLIC_JWK JSON" }, { status: 500 });
  }

  return NextResponse.json({
    keys: [
      {
        ...jwk,
        kid: CURRENT_KID,
        use: "sig",
        alg: "EdDSA",
      },
    ],
  });
}
