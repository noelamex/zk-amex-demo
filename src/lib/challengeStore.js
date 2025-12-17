// In-memory store: challengeHex -> { contextHex, createdAt, used }
const challenges = new Map();

// e.g. 5 minutes TTL for a challenge
const TTL_MS = 5 * 60 * 1000;

export function registerChallenge(challengeHex, contextHex) {
  challenges.set(challengeHex, {
    contextHex,
    createdAt: Date.now(),
    used: false,
  });
}

// Validate but do NOT mark used yet
export function validateChallenge(challengeHex, contextHex) {
  const entry = challenges.get(challengeHex);
  if (!entry) {
    return { ok: false, error: "Unknown challenge" };
  }

  if (entry.used) {
    return { ok: false, error: "Challenge already used" };
  }

  if (entry.contextHex !== contextHex) {
    return { ok: false, error: "Context mismatch for challenge" };
  }

  if (Date.now() - entry.createdAt > TTL_MS) {
    challenges.delete(challengeHex);
    return { ok: false, error: "Challenge expired" };
  }

  return { ok: true };
}

// Mark as used AFTER successful verification
export function consumeChallenge(challengeHex) {
  const entry = challenges.get(challengeHex);
  if (!entry) return;
  entry.used = true;
  challenges.set(challengeHex, entry);
}
