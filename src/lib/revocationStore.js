// Demo only (in production: DB or signed status list)
export const revokedJtis = new Set();

export function revokeJti(jti) {
  revokedJtis.add(jti);
}

export function isRevoked(jti) {
  return revokedJtis.has(jti);
}
