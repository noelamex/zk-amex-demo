import { poseidon2Hash } from "@zkpassport/poseidon2";

export const ACTIVE_TREE_DEPTH = 8; // MUST match circuit
const N = 1 << ACTIVE_TREE_DEPTH;

const leaves = new Array(N).fill(0n);
let levels = null;

// demo mapping: commitHex -> index
const commitToIndex = new Map();
let nextFree = 0;

function hexToBigInt(hex) {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  return clean ? BigInt("0x" + clean) : 0n;
}

function bigIntToHexNo0x(x) {
  return x.toString(16);
}

function hash2(l, r) {
  return poseidon2Hash([l, r]);
}

function rebuild() {
  levels = [];
  levels.push(leaves.slice());
  for (let d = 0; d < ACTIVE_TREE_DEPTH; d++) {
    const prev = levels[d];
    const next = new Array(prev.length / 2);
    for (let i = 0; i < next.length; i++) {
      next[i] = hash2(prev[2 * i], prev[2 * i + 1]);
    }
    levels.push(next);
  }
}
function ensure() {
  if (!levels) rebuild();
}

export function getActiveRootHex() {
  ensure();
  return bigIntToHexNo0x(levels[ACTIVE_TREE_DEPTH][0]);
}

// Call this when issuing a credential
export function activateCommitHex(commitHex) {
  ensure();
  if (commitToIndex.has(commitHex)) return commitToIndex.get(commitHex);

  while (nextFree < N && leaves[nextFree] !== 0n) nextFree++;
  if (nextFree >= N) throw new Error("Active tree full");

  const idx = nextFree;
  leaves[idx] = hexToBigInt(commitHex);
  commitToIndex.set(commitHex, idx);
  nextFree++;

  rebuild();
  return idx;
}

// For demo “revocation”
export function deactivateCommitHex(commitHex) {
  ensure();
  const idx = commitToIndex.get(commitHex);
  if (idx === undefined) return false;

  leaves[idx] = 0n;
  commitToIndex.delete(commitHex);
  rebuild();
  return true;
}

export function getWitnessForCommitHex(commitHex) {
  ensure();
  const idx = commitToIndex.get(commitHex);
  if (idx === undefined) throw new Error("Commit not active");

  const leaf = leaves[idx];
  const path = [];
  let i = idx;

  for (let d = 0; d < ACTIVE_TREE_DEPTH; d++) {
    const siblingIdx = i ^ 1;
    path.push(levels[d][siblingIdx]);
    i = Math.floor(i / 2);
  }

  return {
    activeRootHex: getActiveRootHex(),
    activeLeafHex: bigIntToHexNo0x(leaf),
    activeIndex: idx,
    activePathHex: path.map(bigIntToHexNo0x),
  };
}
