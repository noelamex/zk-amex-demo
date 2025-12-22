// src/lib/challenge.js
import { randomBytes } from "crypto";

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
