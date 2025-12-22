import { createHash } from "crypto";

// 31 bytes so it always fits in bn254 field
const FIELD_BYTES = 31;

export function buildContextStr({ domain, purpose, terminalId }) {
  // keep canonical + predictable
  return `${domain}|${purpose}|${terminalId}`;
}

export function contextStrToHex(contextStr) {
  const digest = createHash("sha256").update(contextStr, "utf8").digest(); // 32 bytes
  const fieldBytes = digest.subarray(0, FIELD_BYTES); // truncate to 31 bytes
  return fieldBytes.toString("hex"); // no 0x
}
