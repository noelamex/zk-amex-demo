import { poseidon2Hash } from "@zkpassport/poseidon2";

// Returns a BigInt field element
export async function computeDobCommitField(dobYear, dobMonth, dobDay) {
  const hash = poseidon2Hash([BigInt(dobYear), BigInt(dobMonth), BigInt(dobDay)]);
  return hash;
}

export function fieldToHex32(f) {
  const hex = f.toString(16);
  return "0x" + hex.padStart(64, "0");
}

// return hex WITHOUT 0x (consistent with your challenge/context style)
export function fieldToHex(f) {
  return f.toString(16);
}
