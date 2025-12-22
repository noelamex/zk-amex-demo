// src/lib/verifierJwt.js
import { jwtVerify, importJWK, decodeProtectedHeader, decodeJwt } from "jose";
import { getTrustedIssuer } from "@/lib/trustedIssuers";

// Cache: jwksUrl -> { jwks, fetchedAt }
const jwksCache = new Map();
const JWKS_TTL_MS = 5 * 60 * 1000;

async function fetchJwks(jwksUrl, force = false) {
  const now = Date.now();
  const cached = jwksCache.get(jwksUrl);
  if (!force && cached && now - cached.fetchedAt < JWKS_TTL_MS) return cached.jwks;

  const res = await fetch(jwksUrl);
  if (!res.ok) throw new Error(`Failed to fetch JWKS: ${jwksUrl}`);
  const jwks = await res.json();

  jwksCache.set(jwksUrl, { jwks, fetchedAt: now });
  return jwks;
}

export async function verifyCredentialToken(token) {
  // 1) Read header → kid
  const { kid } = decodeProtectedHeader(token);
  if (!kid) throw new Error("Missing kid in JWT header");

  // 2) Read payload (UNVERIFIED) → iss
  const unverified = decodeJwt(token);
  const iss = unverified?.iss;
  if (!iss) throw new Error("Missing iss in JWT payload");

  // 3) Check trusted issuer registry
  const trusted = getTrustedIssuer(iss);
  if (!trusted) throw new Error(`Untrusted issuer: ${iss}`);

  // 4) Fetch JWKS for that issuer and pick key by kid
  let jwks = await fetchJwks(trusted.jwksUrl);
  let jwk = jwks?.keys?.find((k) => k.kid === kid);

  if (!jwk) {
    // rotation may have happened; refetch ignoring cache once
    jwks = await fetchJwks(trusted.jwksUrl, true);
    jwk = jwks?.keys?.find((k) => k.kid === kid);
  }
  if (!jwk) throw new Error(`Unknown kid for issuer ${iss}: ${kid}`);

  const key = await importJWK(jwk, "EdDSA");

  // 5) Verify signature + issuer claim
  const { payload } = await jwtVerify(token, key, { issuer: iss });

  return {
    payload,
    issuer: { iss, ...trusted },
    kid,
  };
}
