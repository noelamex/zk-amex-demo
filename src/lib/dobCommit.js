// src/lib/dobCommit.js

// bn254 modulus so we behave like a Field
const P = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;

// Must match Noir constants
const C1 = 123456789123456789n;
const C2 = 987654321987654321n;
const C3 = 555555555555555555n;

function mod(x) {
  let r = x % P;
  if (r < 0n) r += P;
  return r;
}

// Returns a Field element as BigInt
export function computeDobCommitField(dobYear, dobMonth, dobDay) {
  const y = BigInt(dobYear);
  const m = BigInt(dobMonth);
  const d = BigInt(dobDay);
  return mod(y * C1 + m * C2 + d * C3);
}

// Hex form for transport (no 0x). This is what we'll put in the credential.
export function fieldToHex(f) {
  return f.toString(16);
}
