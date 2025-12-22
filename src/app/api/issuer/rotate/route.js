// Add a rotation endpoint (demo toggle). Rotate without restarting.
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { loadKeyring, getCurrentKid, setCurrentKid } from "@/lib/issuerKeys";

export async function POST() {
  const ring = loadKeyring();
  const kids = ring.map((e) => e.kid);
  const current = getCurrentKid();

  const idx = kids.indexOf(current);
  const next = kids[(idx + 1) % kids.length];

  setCurrentKid(next);
  return NextResponse.json({ currentKid: next, allKids: kids });
}
