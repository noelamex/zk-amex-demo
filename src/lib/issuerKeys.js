// src/lib/issuerKeys.js

let currentKid = process.env.CURRENT_KID || "amex-ed25519-2025-01";

export function getCurrentKid() {
  return currentKid;
}

// dev/demo only (in prod, rotation is config/deploy)
export function setCurrentKid(kid) {
  currentKid = kid;
}

export function loadKeyring() {
  const raw = process.env.ISSUER_KEYRING_JSON;
  if (!raw) throw new Error("ISSUER_KEYRING_JSON is not set");

  const ring = JSON.parse(raw);
  if (!Array.isArray(ring) || ring.length === 0)
    throw new Error("ISSUER_KEYRING_JSON must be a non-empty array");
  return ring;
}
