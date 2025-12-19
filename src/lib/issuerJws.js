// src/lib/issuerJws.js
import { SignJWT, jwtVerify, importJWK, decodeProtectedHeader } from "jose";
import { CURRENT_KID } from "./issuerKeys";

async function getIssuerPrivateKey() {
  const envVar = process.env.ISSUER_PRIVATE_JWK;
  if (!envVar) {
    throw new Error("ISSUER_PRIVATE_JWK environment variable is not set.");
  }

  try {
    const jwk = JSON.parse(envVar);
    return importJWK(jwk, "EdDSA");
  } catch (error) {
    throw new Error(`Failed to parse ISSUER_PRIVATE_JWK: ${error.message}. `);
  }
}

// --- JWKS fetch + tiny in-memory cache (recommended) ---
let jwksCache = null;
let jwksCacheAt = 0;
const JWKS_TTL_MS = 5 * 60 * 1000;

async function fetchIssuerJwks() {
  const now = Date.now();
  if (jwksCache && now - jwksCacheAt < JWKS_TTL_MS) return jwksCache;

  // In production this would be the issuer domain:
  // e.g. https://issuer.example.com/.well-known/jwks.json
  const res = await fetch("http://localhost:3000/api/issuer/jwks");
  if (!res.ok) throw new Error("Failed to fetch issuer JWKS");
  const jwks = await res.json();

  jwksCache = jwks;
  jwksCacheAt = now;
  return jwks;
}

export async function signIssuerCredential(payload) {
  const key = await getIssuerPrivateKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "EdDSA", typ: "JWT", kid: CURRENT_KID })
    .setIssuedAt()
    .setIssuer("amex-demo")
    .setExpirationTime("30d")
    .sign(key);
}

export async function verifyIssuerCredential(token) {
  const { kid } = decodeProtectedHeader(token);
  if (!kid) throw new Error("Missing kid in JWT header");

  const jwks = await fetchIssuerJwks();
  const jwk = jwks.keys.find((k) => k.kid === kid);
  if (!jwk) throw new Error(`Unknown kid: ${kid}`);

  const key = await importJWK(jwk, "EdDSA");

  // issuer check is important
  const { payload } = await jwtVerify(token, key, { issuer: "amex-demo" });
  return payload;
}
