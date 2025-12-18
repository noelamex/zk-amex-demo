// src/lib/issuerJwt.js
import { createHmac } from "crypto";

const ISSUER_SECRET = process.env.ISSUER_SECRET || "dev-only-secret-change-me";

function base64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replaceAll("=", "")
    .replaceAll("+", "-")
    .replaceAll("/", "_");
}

export function signCredentialPayload(payload) {
  const header = { alg: "HS256", typ: "JWT" };

  const h = base64url(JSON.stringify(header));
  const p = base64url(JSON.stringify(payload));

  const data = `${h}.${p}`;
  const sig = createHmac("sha256", ISSUER_SECRET).update(data).digest();
  const s = base64url(sig);

  return `${data}.${s}`;
}

export function verifyCredentialToken(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, error: "Bad token format" };

  const [h, p, s] = parts;
  const data = `${h}.${p}`;

  const expected = base64url(createHmac("sha256", ISSUER_SECRET).update(data).digest());

  if (expected !== s) return { ok: false, error: "Bad signature" };

  const payloadJson = Buffer.from(p.replaceAll("-", "+").replaceAll("_", "/"), "base64").toString(
    "utf8"
  );
  return { ok: true, payload: JSON.parse(payloadJson) };
}
