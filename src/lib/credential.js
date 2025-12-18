// In reality, Amex would sign this with a private key.
// For demo we just make a fake deterministic signature string.

const DEMO_ISSUER_PUBKEY = "AMEX_DEMO_PUBKEY_V1";

/**
 * Simple cutoff date: "today minus 21 years".
 * For demo we don't worry about time zones, etc.
 */
export function getAge21CutoffDate() {
  const now = new Date();
  const cutoff = new Date(now.getFullYear() - 21, now.getMonth(), now.getDate());

  return {
    year: cutoff.getFullYear(),
    month: cutoff.getMonth() + 1,
    day: cutoff.getDate(),
  };
}

export function getDemoIssuerPubKey() {
  return DEMO_ISSUER_PUBKEY;
}
