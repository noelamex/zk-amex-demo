let backendInstance = null;

async function initBackend() {
  if (backendInstance) return backendInstance;

  const [{ UltraHonkBackend }, circuitModule] = await Promise.all([
    import("@aztec/bb.js"),
    import("../circuits/amex_age21.json"),
  ]);

  const circuit = circuitModule.default ?? circuitModule;
  const backend = new UltraHonkBackend(circuit.bytecode);

  backendInstance = backend;
  return backend;
}

/**
 * Server-side verification: Publix backend checks the proof.
 * No need to execute the circuit again — just use UltraHonkBackend.verifyProof.
 */
export async function verifyDobProofServer(proof) {
  const backend = await initBackend();
  const isValid = await backend.verifyProof(proof);
  return isValid;
}
