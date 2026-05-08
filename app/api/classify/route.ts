import { NextRequest, NextResponse } from "next/server";
import { classify } from "@/lib/classify";
import { ClassifyResult, ClassifyError } from "@/lib/types";

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ClassifyResult | ClassifyError>> {
  const body = await req.json().catch(() => null);
  const raw: unknown = body?.url;

  if (typeof raw !== "string" || raw.trim() === "") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const url = normalizeUrl(raw);
  if (!url) {
    return NextResponse.json({ error: "Invalid URL — must be http or https" }, { status: 400 });
  }

  try {
    const result = await classify(url);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Classification failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
