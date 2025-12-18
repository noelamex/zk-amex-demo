import express from "express";
import { UltraHonkBackend } from "@aztec/bb.js";

// 1. Clean Import: Use createRequire to load JSON relative to this file
import circuit from "../src/circuits/amex_age21.json" with {type:'json'}

// 2. Initialize Once: Backend setup is synchronous
const backend = new UltraHonkBackend(circuit.bytecode);

const app = express();
app.use(express.json({ limit: "10mb" }));

app.post("/verify", async (req, res) => {
  const { proof } = req.body;
  if (!proof) return res.status(400).json({ error: "Missing proof" });

  try {
    // 3. Smart Parsing: Handle both Array and Object formats in one line
    // If it's an object {"0":12, "1":255}, Object.values extracts [12, 255] in order.
    const proofBytes = new Uint8Array(
      Array.isArray(proof.proof) ? proof.proof : Object.values(proof.proof)
    );

    const valid = await backend.verifyProof({
      proof: proofBytes,
      publicInputs: proof.publicInputs || [],
    });

    res.json({ valid });
  } catch (err) {
    console.error("Verification failed:", err.message);
    res.status(500).json({ error: "Verification failed" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Verifier running on port ${PORT}`));
