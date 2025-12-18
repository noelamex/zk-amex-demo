// scripts/gen-ed25519-jwk.mjs
import { generateKeyPair, exportJWK, exportPKCS8 } from "jose";

const { publicKey, privateKey } = await generateKeyPair("EdDSA", {
  extractable: true,
});

console.log("ISSUER_PRIVATE_JWK=");
console.log(await exportJWK(privateKey));
console.log("\nISSUER_PUBLIC_JWK=");
console.log(await exportJWK(publicKey));
