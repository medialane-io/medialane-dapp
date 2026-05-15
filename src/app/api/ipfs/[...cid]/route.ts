import { type NextRequest, NextResponse } from "next/server";

const PINATA_JWT = process.env.PINATA_JWT;
// Dedicated gateway takes precedence; falls back to Pinata public gateway.
// Set PINATA_DEDICATED_GATEWAY in Vercel/Railway to your Pinata dedicated gateway URL.
const GATEWAY =
  process.env.PINATA_DEDICATED_GATEWAY ||
  "https://gateway.pinata.cloud";
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;
const MAX_RESPONSE_BYTES = 25 * 1024 * 1024;

const ipCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipCounts.get(ip);
  if (!entry || now >= entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

/**
 * GET /api/ipfs/[...cid]
 *
 * Server-side IPFS proxy. Fetches content from Pinata using the server-only
 * PINATA_JWT, then streams it back to the browser. This avoids:
 *  - Pinata's Cross-Origin-Resource-Policy: same-origin header on free plans
 *  - Browser-visible rate limit (429) errors from the public gateway
 *  - The need for a dedicated Pinata gateway on the client
 *
 * Supports paths: /api/ipfs/QmXxx  and  /api/ipfs/QmXxx/image.png
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cid: string[] }> }
) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { cid: segments } = await params;
  const cidPath = segments.join("/");

  // Validate CID format — CIDv0 (Qm...) or CIDv1 (bafy..., bafk..., etc.)
  // Optional sub-path after the CID (letters, digits, dots, dashes, underscores, slashes)
  if (!/^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[a-z2-7]{58,})(\/[\w.\-/]*)?$/.test(cidPath)) {
    return NextResponse.json({ error: "Invalid IPFS path" }, { status: 400 });
  }

  const url = `${GATEWAY}/ipfs/${cidPath}`;

  const headers: HeadersInit = {};
  if (PINATA_JWT) {
    headers["Authorization"] = `Bearer ${PINATA_JWT}`;
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, { headers, next: { revalidate: 86400 } });
  } catch {
    return NextResponse.json({ error: "Failed to fetch from IPFS" }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json({ error: "IPFS content unavailable" }, { status: upstream.status });
  }

  const upstreamContentType = upstream.headers.get("content-type") ?? "";
  const upstreamContentLength = Number(upstream.headers.get("content-length") ?? 0);
  if (upstreamContentLength > MAX_RESPONSE_BYTES) {
    return NextResponse.json({ error: "IPFS content too large" }, { status: 413 });
  }

  // Allowlist safe MIME type prefixes — reject text/html, text/javascript,
  // image/svg+xml and other scriptable types that could execute in browser context.
  const SAFE_PREFIXES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif",
    "video/", "audio/", "model/", "font/", "application/json", "application/octet-stream"];
  const safeContentType = SAFE_PREFIXES.some((p) => upstreamContentType.startsWith(p))
    ? upstreamContentType
    : "application/octet-stream";

  const body = await upstream.arrayBuffer();
  if (body.byteLength > MAX_RESPONSE_BYTES) {
    return NextResponse.json({ error: "IPFS content too large" }, { status: 413 });
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": safeContentType,
      "X-Content-Type-Options": "nosniff",
      // Cache aggressively — IPFS content is immutable by CID
      "Cache-Control": "public, max-age=31536000, immutable",
      // Allow any origin to embed this content (images, etc.)
      "Access-Control-Allow-Origin": "*",
    },
  });
}
