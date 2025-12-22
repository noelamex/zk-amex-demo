// In-memory store: challengeHex -> { contextHex, createdAt, used }
const challenges = new Map();

// e.g. 5 minutes TTL for a challenge
export const TTL_MS = 5 * 60 * 1000;

export function registerChallenge(challengeHex, contextHex, issuedAt = Date.now()) {
  challenges.set(challengeHex.toLowerCase(), {
    contextHex: contextHex.toLowerCase(),
    issuedAt,
  });
}

// Validate but do NOT mark used yet
export function validateChallenge(challengeHex, contextHex) {
  const key = challengeHex.toLowerCase();
  const entry = challenges.get(key);
  if (!entry) return { ok: false, error: "Unknown or already-used challenge" };

  if (entry.contextHex !== contextHex.toLowerCase()) {
    return { ok: false, error: "Context mismatch for challenge" };
  }

  const age = Date.now() - entry.issuedAt;
  if (age > TTL_MS) {
    challenges.delete(key);
    return { ok: false, error: "Challenge expired" };
  }

  return { ok: true };
}

// Delete AFTER successful verification
export function consumeChallenge(challengeHex) {
  challenges.delete(challengeHex.toLowerCase());
}
