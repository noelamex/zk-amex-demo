"use client";

import { useState } from "react";

export default function HolderPage() {
  const [credentialText, setCredentialText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleProve(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    let credential;
    try {
      credential = JSON.parse(credentialText);
    } catch {
      setError("Invalid credential JSON");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/holder/prove-age21", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to prove");
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Holder (Your Phone)</h1>

      <form onSubmit={handleProve} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium mb-1">Credential JSON</label>
          <textarea
            className="w-full border rounded p-2 text-xs font-mono min-h-[160px]"
            value={credentialText}
            onChange={(e) => setCredentialText(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
        >
          {loading ? "Generating proof…" : "Generate ZK Proof"}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600 text-sm">Error: {error}</p>}

      {result && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Proof Package</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(
              {
                proof: result.proof,
                issuerPubKey: result.issuerPubKey,
                cutoffDate: result.cutoffDate,
              },
              null,
              2
            )}
          </pre>
          <p className="text-xs text-gray-500 mt-2">Copy this into the Verifier page.</p>
        </div>
      )}
    </main>
  );
}
