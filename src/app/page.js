// app/page.js

import Link from "next/link";

export default function HomePage() {
  const roles = [
    {
      title: "Issuer (Amex)",
      description: "Issue a demo age credential after KYC.",
      href: "/issuer",
    },
    {
      title: "Holder (Your Phone)",
      description: "Generate a ZK proof that you are 21+.",
      href: "/holder",
    },
    {
      title: "Verifier (Publix)",
      description: "Verify a proof from the holder.",
      href: "/verifier",
    },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">Amex as a Trusted ZK Issuer</h1>
      <p className="text-gray-600 mb-8 text-center max-w-xl">
        Demo of the issuer–holder–verifier flow for proving age ≥ 21 without revealing your date of
        birth.
      </p>

      <div className="grid gap-4 md:grid-cols-3 w-full max-w-5xl">
        {roles.map((role) => (
          <Link
            key={role.href}
            href={role.href}
            className="border rounded-lg p-4 hover:shadow transition"
          >
            <h2 className="font-semibold mb-2">{role.title}</h2>
            <p className="text-sm text-gray-600">{role.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
