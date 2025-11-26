"use client";

import { useState } from "react";

export default function IssuerPage() {
  const [credential, setCredential] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleIssue() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/issuer/issue-credential", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to issue");
      setCredential(data.credential);
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
      <p className="text-gray-600 mb-4">
        Click the button to issue a demo credential for a user who is 21+.
      </p>

      <button
        onClick={handleIssue}
        disabled={loading}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? "Issuing…" : "Issue Demo Credential"}
      </button>

      {error && <p className="mt-4 text-red-600 text-sm">Error: {error}</p>}

      {credential && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Issued Credential</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(credential, null, 2)}
          </pre>
          <p className="text-xs text-gray-500 mt-2">
            Copy this into the Holder page as if it&apos;s stored on the user&apos;s device.
          </p>
        </div>
      )}
    </main>
  );
}
