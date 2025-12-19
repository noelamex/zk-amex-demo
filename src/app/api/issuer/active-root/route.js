export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { getActiveRootHex } from "@/lib/activeMerkle";

export async function GET() {
  return NextResponse.json({ activeRootHex: getActiveRootHex() });
}
