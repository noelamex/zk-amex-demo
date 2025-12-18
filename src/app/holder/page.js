"use client";

import { useState } from "react";
import { proveDobBeforeCutoffBrowser } from "@/lib/zkClient";
import { getAge21CutoffDate } from "@/lib/credential";

export default function HolderPage() {
  const [credentialToken, setCredentialToken] = useState("");

  // Holder keeps DOB locally (private witness)
  const [dobYear, setDobYear] = useState("1990");
  const [dobMonth, setDobMonth] = useState("1");
  const [dobDay, setDobDay] = useState("1");

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

  async function inspectToken(token) {
    const res = await fetch("/api/issuer/inspect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credentialToken: token }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Invalid credential token");
    return data; // payload
  }

  async function handleProve(e) {
    e.preventDefault();
    setError("");
    setProofPkg(null);
    setVerifyResult(null);

    if (!credentialToken.trim()) {
      setError("Paste the credentialToken from Issuer first.");
      return;
    }

    if (!challengeHex || !contextHex) {
      setError("Get a challenge from Publix first.");
      return;
    }

    const cutoffDate = getAge21CutoffDate();

    setLoading(true);
    try {
      // Verify token + extract dobCommitHex on the server
      const payload = await inspectToken(credentialToken.trim());
      const { dobCommitHex } = payload;

      if (!dobCommitHex) {
        throw new Error("Token payload missing dobCommitHex");
      }

      const { proof } = await proveDobBeforeCutoffBrowser({
        dobYear: Number(dobYear),
        dobMonth: Number(dobMonth),
        dobDay: Number(dobDay),

        cutoffYear: cutoffDate.year,
        cutoffMonth: cutoffDate.month,
        cutoffDay: cutoffDate.day,

        challengeHex,
        contextHex,

        dobCommitHex, // binds private DOB to signed commitment
      });

      setProofPkg({
        proof,
        credentialToken: credentialToken.trim(),
        cutoffDate,
        challengeHex,
        contextHex,
      });
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
          credentialToken: proofPkg.credentialToken,
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

      <div className="mt-6 max-w-xl space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">credentialToken</label>
          <textarea
            className="w-full border rounded p-2 text-xs font-mono min-h-[140px]"
            value={credentialToken}
            onChange={(e) => setCredentialToken(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <label className="text-sm">
            DOB Year
            <input
              className="mt-1 w-full border rounded p-2"
              value={dobYear}
              onChange={(e) => setDobYear(e.target.value)}
            />
          </label>
          <label className="text-sm">
            DOB Month
            <input
              className="mt-1 w-full border rounded p-2"
              value={dobMonth}
              onChange={(e) => setDobMonth(e.target.value)}
            />
          </label>
          <label className="text-sm">
            DOB Day
            <input
              className="mt-1 w-full border rounded p-2"
              value={dobDay}
              onChange={(e) => setDobDay(e.target.value)}
            />
          </label>
        </div>

        <form onSubmit={handleProve} className="space-y-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
          >
            {loading ? "Generating proof…" : "Generate ZK Proof"}
          </button>
        </form>
      </div>

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
