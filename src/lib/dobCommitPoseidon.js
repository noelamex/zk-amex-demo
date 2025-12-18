import { buildPoseidon } from "circomlibjs";

let _poseidon = null;

async function poseidon() {
  if (!_poseidon) _poseidon = await buildPoseidon();
  return _poseidon;
}

// Returns a BigInt field element
export async function computeDobCommitField(dobYear, dobMonth, dobDay) {
  const p = await poseidon();
  const out = p.F.toObject(p([BigInt(dobYear), BigInt(dobMonth), BigInt(dobDay)]));
  return out; // BigInt
}

export function fieldToHex32(f) {
  const hex = f.toString(16);
  return "0x" + hex.padStart(64, "0");
}

// return hex WITHOUT 0x (consistent with your challenge/context style)
export function fieldToHex(f) {
  return f.toString(16);
}
