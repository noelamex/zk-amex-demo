// src/lib/challenge.js
import { randomBytes, createHash } from "crypto";

const FIELD_BYTES = 31;

// ---------- Generic helpers ----------

export function hexToFieldDecimal(hex) {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  return BigInt("0x" + clean).toString();
}

export function hexToFieldHex(hex) {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  return "0x" + clean.padStart(64, "0"); // 64 hex chars = 32 bytes
}

// ---------- Challenge ----------

export function generateChallengeHex() {
  return randomBytes(FIELD_BYTES).toString("hex"); // 31 bytes
}

// ---------- Context ----------

const CONTEXT_STRING = "publix:age_check:alcohol:v1";

export function getContextHex() {
  const full = createHash("sha256").update(CONTEXT_STRING, "utf8").digest("hex");

  // Truncate to fit field (31 bytes)
  return full.slice(0, FIELD_BYTES * 2);
}
