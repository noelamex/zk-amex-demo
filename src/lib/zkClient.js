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
  contextHex
}) {
  const { noir, backend } = await initZk();

  if (!challengeHex) throw new Error("Missing challengeHex");
  if (!contextHex) throw new Error("Missing contextHex");

  const challengeField = hexToFieldDecimal(challengeHex);
  const contextField = hexToFieldDecimal(contextHex);

  const inputs = {
    dob_year: dobYear,
    dob_month: dobMonth,
    dob_day: dobDay,
    cutoff_year: cutoffYear,
    cutoff_month: cutoffMonth,
    cutoff_day: cutoffDay,
    challenge: challengeField,
    context: contextField,
  };

  // 1) Execute circuit → witness
  const { witness } = await noir.execute(inputs);

  // 2) Generate proof
  const proof = await backend.generateProof(witness);
  return { proof };
}
