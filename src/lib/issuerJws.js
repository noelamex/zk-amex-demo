// src/lib/issuerJws.js
import { SignJWT, jwtVerify, importJWK } from "jose";

/**
 * For a demo: keep keys in env as JWK JSON strings.
 * In production: use a KMS/HSM and rotate keys; publish the public JWK via JWKS endpoint.
 */

/**
 * Environment Variables Setup:
 *
 * Create a `.env.local` file in the project root with:
 *
 * ISSUER_PRIVATE_JWK='{"kty":"OKP","crv":"Ed25519","x":"...","d":"..."}'
 * ISSUER_PUBLIC_JWK='{"kty":"OKP","crv":"Ed25519","x":"..."}'
 *
 * Next.js automatically loads environment variables from:
 * - .env.local (loaded in all environments, ignored by git)
 * - .env.development (loaded in development)
 * - .env.production (loaded in production)
 * - .env (loaded in all environments, can be committed)
 *
 * Note: Restart the dev server after creating/modifying .env files
 */

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
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "EdDSA", typ: "JWT" })
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
