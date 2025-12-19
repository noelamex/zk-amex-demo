import { hexToFieldDecimal } from "@/lib/challenge";

let noirInstance = null;
let backendInstance = null;

async function initZk() {
  if (noirInstance && backendInstance) {
    return { noir: noirInstance, backend: backendInstance };
  }

  // These imports will run in the browser (from client components)
  const [{ Noir }, { UltraHonkBackend }, circuitModule] = await Promise.all([
    import("@noir-lang/noir_js"),
    import("@aztec/bb.js"),
    import("../circuits/amex_age21.json"),
  ]);

  const circuit = circuitModule.default ?? circuitModule;

  const noir = new Noir(circuit);
  const backend = new UltraHonkBackend(circuit.bytecode);

  noirInstance = noir;
  backendInstance = backend;

  return { noir, backend };
}

/**
 * Prove DOB <= cutoff date in the browser.
 */
export async function proveDobBeforeCutoffBrowser({
  dobYear,
  dobMonth,
  dobDay,
  cutoffYear,
  cutoffMonth,
  cutoffDay,
  challengeHex,
  contextHex,
  dobCommitHex,
  activeRootHex,
  activeLeafHex,
  activeIndex,
  activePathHex,
}) {
  const { noir, backend } = await initZk();

  if (!challengeHex) throw new Error("Missing challengeHex");
  if (!contextHex) throw new Error("Missing contextHex");

  const challengeField = hexToFieldDecimal(challengeHex);
  const contextField = hexToFieldDecimal(contextHex);
  const dobCommitField = hexToFieldDecimal(dobCommitHex);

  const inputs = {
    dob_year: dobYear,
    dob_month: dobMonth,
    dob_day: dobDay,
    cutoff_year: cutoffYear,
    cutoff_month: cutoffMonth,
    cutoff_day: cutoffDay,
    challenge: challengeField,
    context: contextField,
    dob_commit: dobCommitField,
    // active set membership
    active_root: hexToFieldDecimal(activeRootHex),
    active_leaf: hexToFieldDecimal(activeLeafHex),
    active_path: activePathHex.map(hexToFieldDecimal),
    active_index: activeIndex,
  };
  // 1) Execute circuit → witness
  const { witness } = await noir.execute(inputs);

  // 2) Generate proof
  const proof = await backend.generateProof(witness);
  return { proof };
}
