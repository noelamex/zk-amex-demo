"use client";

import { useState } from "react";
import { proveDobBeforeCutoffBrowser } from "@/lib/zkClient";
import { getAge21CutoffDate } from "@/lib/credential";

export default function HolderPage() {
  const [credentialText, setCredentialText] = useState("");
  const [proofPkg, setProofPkg] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [challengeHex, setChallengeHex] = useState("");
  const [contextHex, setContextHex] = useState("");

  async function fetchChallenge() {
    setError("");
    try {
      const res = await fetch("/api/verifier/challenge");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get challenge");
      setChallengeHex(data.challengeHex);
      setContextHex(data.contextHex);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleProve(e) {
    e.preventDefault();
    setError("");
    setProofPkg(null);
    setVerifyResult(null);

    let credential;
    try {
      credential = JSON.parse(credentialText);
    } catch {
      setError("Invalid credential JSON");
      return;
    }

    if (!challengeHex || !contextHex) {
      setError("Get a challenge from Publix first.");
      return;
    }

    const cutoffDate = getAge21CutoffDate();

    setLoading(true);
    try {
      const { proof } = await proveDobBeforeCutoffBrowser({
        dobYear: credential.dobYear,
        dobMonth: credential.dobMonth,
        dobDay: credential.dobDay,
        cutoffYear: cutoffDate.year,
        cutoffMonth: cutoffDate.month,
        cutoffDay: cutoffDate.day,
        challengeHex,
        contextHex,
      });

      const pkg = {
        proof,
        issuerPubKey: credential.issuerPubKey,
        cutoffDate,
        challengeHex,
        contextHex,
      };

      setProofPkg(pkg);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to generate proof");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendToVerifier() {
    if (!proofPkg) return;
    setVerifying(true);
    setVerifyResult(null);
    setError("");

    try {
      const res = await fetch("/api/verifier/verify-age21", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proof: proofPkg.proof,
          issuerPubKey: proofPkg.issuerPubKey,
          challengeHex: proofPkg.challengeHex,
          contextHex: proofPkg.contextHex,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verify failed");

      setVerifyResult(data.valid);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to verify via backend");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        Holder (Prove in browser, verify on Publix backend)
      </h1>
      <button
        type="button"
        onClick={fetchChallenge}
        className="px-3 py-2 rounded bg-blue-600 text-white text-sm"
      >
        Get challenge from Publix
      </button>

      {challengeHex && (
        <p className="mt-2 text-xs text-gray-600 break-all">Challenge: {challengeHex}</p>
      )}

      {contextHex && <p className="mt-1 text-xs text-gray-600 break-all">Context: {contextHex}</p>}

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

      {proofPkg && (
        <div className="mt-6 space-y-4">
          <div>
            <h2 className="font-semibold mb-2">Proof Package</h2>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(proofPkg, null, 2)}
            </pre>
          </div>

          <button
            onClick={handleSendToVerifier}
            disabled={verifying}
            className="px-4 py-2 rounded bg-purple-600 text-white disabled:opacity-50"
          >
            {verifying ? "Sending to Publix…" : "Send to Publix backend to verify"}
          </button>
        </div>
      )}

      {verifyResult !== null && (
        <div className="mt-4">
          <h2 className="font-semibold mb-2">Backend Verification Result</h2>
          <p className="text-lg">
            {verifyResult
              ? "✅ Publix backend verified the proof (age ≥ 21)."
              : "❌ Publix backend rejected the proof."}
          </p>
        </div>
      )}
    </main>
  );
}
