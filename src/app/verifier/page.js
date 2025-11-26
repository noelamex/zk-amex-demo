"use client";

import { useState } from "react";

export default function VerifierPage() {
  const [proofPackageText, setProofPackageText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    let pkg;

    try {
      pkg = JSON.parse(proofPackageText);
    } catch {
      setError("Invalid proof package JSON");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/verifier/verify-age21", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proof: pkg.proof,
          issuerPubKey: pkg.issuerPubKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify");
      setResult(data.valid);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Verifier (Publix)</h1>
      <p className="text-gray-600 mb-4">
        Paste the proof package from the Holder page and verify the proof.
      </p>

      <form onSubmit={handleVerify} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium mb-1">Proof Package JSON</label>
          <textarea
            className="w-full border rounded p-2 text-xs font-mono min-h-[160px]"
            value={proofPackageText}
            onChange={(e) => setProofPackageText(e.target.value)}
            placeholder='{"proof": "...", "publicInputs": [...], "issuerPubKey": "..."}'
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-purple-600 text-white disabled:opacity-50"
        >
          {loading ? "Verifying…" : "Verify Proof"}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600 text-sm">Error: {error}</p>}

      {result !== null && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Verification Result</h2>
          <p className="text-lg">{result ? "✅ Proof is valid (age ≥ 21)" : "❌ Invalid proof"}</p>
        </div>
      )}
    </main>
  );
}
