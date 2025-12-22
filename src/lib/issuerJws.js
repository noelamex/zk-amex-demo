// src/lib/issuerJws.js
import { SignJWT, jwtVerify, importJWK } from "jose";
import { getCurrentKid, loadKeyring } from "@/lib/issuerKeys";
import { ISSUER_ID } from "./constants";

function findEntryByKid(kid) {
  const ring = loadKeyring();
  const entry = ring.find((e) => e.kid === kid);
  if (!entry) throw new Error(`No keyring entry for kid: ${kid}`);
  return entry;
}

async function getIssuerPrivateKeyForKid(kid) {
  const { privateJwk } = findEntryByKid(kid);
  return importJWK(privateJwk, "EdDSA");
}

export async function signIssuerCredential(payload) {
  const kid = getCurrentKid();
  const key = await getIssuerPrivateKeyForKid(kid);
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "EdDSA", typ: "JWT", kid })
    .setIssuedAt()
    .setIssuer(ISSUER_ID)
    .setExpirationTime("30d")
    .sign(key);
  return { token, kid };
}

// Issuer-side verify (optional/debug). Verifier should use verifierJwt.js.
export async function verifyIssuerCredential(token) {
  // issuer can verify using ANY key in its own keyring
  const ring = loadKeyring();

  // try each public key until one verifies (simple issuer-side approach)
  for (const entry of ring) {
    const key = await importJWK(entry.publicJwk, "EdDSA");
    try {
      const { payload } = await jwtVerify(token, key, { issuer: ISSUER_ID });
      return payload;
    } catch {}
  }

  throw new Error("Token signature invalid for issuer keyring");
}
