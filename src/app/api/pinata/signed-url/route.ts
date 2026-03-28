/**
 * POST /api/pinata/signed-url
 *
 * Returns a short-lived Pinata signed upload URL so the client can upload
 * images directly to Pinata without routing the file through this server.
 * This bypasses Next.js's 4 MB route body limit — supporting up to 10 MB.
 *
 * Response: { url: string }
 */

import { NextResponse } from "next/server";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud",
});

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST() {
  try {
    const url = await pinata.upload.public.createSignedURL({
      expires: 120, // 2 minutes — enough for slow connections
      maxFileSize: MAX_FILE_BYTES,
      mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/svg+xml", "image/webp"],
    });
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[/api/pinata/signed-url]", err);
    const message = err instanceof Error ? err.message : "Failed to create upload URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
