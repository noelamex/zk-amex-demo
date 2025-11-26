// app/api/issuer/issue-credential/route.js

import { NextResponse } from "next/server";
import { issueDemoCredential } from "@/lib/credential";

export async function POST() {
  // In a real app you'd authenticate the user as Amex customer here.
  const credential = issueDemoCredential();

  return NextResponse.json({
    credential,
  });
}
