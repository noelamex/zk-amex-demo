// This file wraps Noir + UltraHonkBackend and exposes two helpers:
//   - proveAmexAge21: generate a proof from a credential (DOB + cutoff)
//   - verifyAmexAge21: verify a proof on the verifier side

let noirInstance = null;
let backendInstance = null;

async function initBackend() {
  if (noirInstance && backendInstance) {
    return { noir: noirInstance, backend: backendInstance };
  }

  // Dynamic imports for Next.js (avoid SSR/webpack headaches)
  const [{ Noir }, { UltraHonkBackend }, circuitModule] = await Promise.all([
    import("@noir-lang/noir_js"),
    import("@aztec/bb.js"),
    import("../circuits/amex_age21.json"),
  ]);

  console.log(circuitModule);

  // Some bundlers put JSON under `.default`
  const circuit = circuitModule.default ?? circuitModule;

  const noir = new Noir(circuit);
  const backend = new UltraHonkBackend(circuit.bytecode);

  noirInstance = noir;
  backendInstance = backend;

  return { noir, backend };
}

/**
 * Prove "DOB <= cutoff date" using the current circuit.
 */
export async function proveAmexAge21({ credential, cutoffDate }) {
  const { noir, backend } = await initBackend();

  // Map JS → Noir inputs (must match main() exactly)
  const inputs = {
    dob_year: credential.dobYear,
    dob_month: credential.dobMonth,
    dob_day: credential.dobDay,
    cutoff_year: cutoffDate.year,
    cutoff_month: cutoffDate.month,
    cutoff_day: cutoffDate.day,
  };

  // 1) Execute circuit → witness
  const { witness } = await noir.execute(inputs);

  // 2) Prove using UltraHonkBackend
  const proof = await backend.generateProof(witness);

  return { proof };
}

/**
 * Verify proof on the verifier side.
 */
export async function verifyAmexAge21(proof) {
  const { backend } = await initBackend();
  const isValid = await backend.verifyProof(proof);
  return isValid;
}
