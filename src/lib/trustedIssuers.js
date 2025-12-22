// src/lib/trustedIssuers.js

import { ISSUER_ID } from "./constants";

export const TRUSTED_ISSUERS = {
  [ISSUER_ID]: {
    name: "Amex Demo Issuer",
    jwksUrl: "http://localhost:3000/api/issuer/jwks",
  },

  // Later you can add:
  // "chase-demo": { name: "Chase Demo", jwksUrl: "http://localhost:3001/api/issuer/jwks" },
};

export function getTrustedIssuer(iss) {
  return TRUSTED_ISSUERS[iss] || null;
}
