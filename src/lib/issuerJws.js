// src/lib/issuerJws.js
import { SignJWT, jwtVerify, importJWK } from "jose";
import { CURRENT_KID } from "./issuerKeys";
import { randomUUID } from "crypto";

async function getIssuerPrivateKey() {
  const envVar = process.env.ISSUER_PRIVATE_JWK;
  if (!envVar) {
    throw new Error(
      "ISSUER_PRIVATE_JWK environment variable is not set. " +
        "Please create a .env.local file with ISSUER_PRIVATE_JWK."
    );
  }

  try {
    const jwk = JSON.parse(envVar);
    return importJWK(jwk, "EdDSA");
  } catch (error) {
    throw new Error(
      `Failed to parse ISSUER_PRIVATE_JWK: ${error.message}. ` + "Ensure it's a valid JSON string."
    );
  }
}

async function getIssuerPublicKey() {
  const envVar = process.env.ISSUER_PUBLIC_JWK;
  if (!envVar) {
    throw new Error(
      "ISSUER_PUBLIC_JWK environment variable is not set. " +
        "Please create a .env.local file with ISSUER_PUBLIC_JWK."
    );
  }

  try {
    const jwk = JSON.parse(envVar);
    return importJWK(jwk, "EdDSA");
  } catch (error) {
    throw new Error(
      `Failed to parse ISSUER_PUBLIC_JWK: ${error.message}. ` + "Ensure it's a valid JSON string."
    );
  }
}

export async function signIssuerCredential(payload) {
  const key = await getIssuerPrivateKey();

  // Typical JWT fields: iss, iat, exp, etc.
  return new SignJWT({
    ...payload,
    jti: randomUUID(),
  })
    .setProtectedHeader({ alg: "EdDSA", typ: "JWT", kid: CURRENT_KID })
    .setIssuedAt()
    .setIssuer("amex-demo")
    .setExpirationTime("30d")
    .sign(key);
}

export async function verifyIssuerCredential(token) {
  const key = await getIssuerPublicKey();

  // issuer check is important
  const { payload } = await jwtVerify(token, key, {
    issuer: "amex-demo",
  });

  return payload;
}
