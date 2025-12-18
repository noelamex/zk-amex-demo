"use client";

import { useState } from "react";

export default function IssuerPage() {
  const [dobYear, setDobYear] = useState("1990");
  const [dobMonth, setDobMonth] = useState("1");
  const [dobDay, setDobDay] = useState("1");

  const [credentialToken, setCredentialToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleIssue() {
    setLoading(true);
    setError("");
    setCredentialToken("");

    try {
      const res = await fetch("/api/issuer/issue-credential", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dobYear: Number(dobYear),
          dobMonth: Number(dobMonth),
          dobDay: Number(dobDay),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to issue");

      setCredentialToken(data.credentialToken);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Issuer (Amex)</h1>
      <p className="text-gray-600 mb-6">
        Issue a signed credential token containing a DOB commitment (not the DOB).
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
        <label className="text-sm">
          Year
          <input
            className="mt-1 w-full border rounded p-2"
            value={dobYear}
            onChange={(e) => setDobYear(e.target.value)}
          />
        </label>
        <label className="text-sm">
          Month
          <input
            className="mt-1 w-full border rounded p-2"
            value={dobMonth}
            onChange={(e) => setDobMonth(e.target.value)}
          />
        </label>
        <label className="text-sm">
          Day
          <input
            className="mt-1 w-full border rounded p-2"
            value={dobDay}
            onChange={(e) => setDobDay(e.target.value)}
          />
        </label>
      </div>

      <button
        onClick={handleIssue}
        disabled={loading}
        className="mt-4 px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? "Issuing…" : "Issue Credential Token"}
      </button>

      {error && <p className="mt-4 text-red-600 text-sm">Error: {error}</p>}

      {credentialToken && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">credentialToken</h2>
          <textarea
            className="w-full h-40 border rounded p-3 text-xs"
            value={credentialToken}
            readOnly
          />
          <p className="text-xs text-gray-500 mt-2">Copy this into the Holder page.</p>
        </div>
      )}
    </main>
  );
}
