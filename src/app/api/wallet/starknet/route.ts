import { NextRequest, NextResponse } from "next/server";
import { privyServer } from "@/lib/privy-server";

function toExternalId(userId: string): string {
  return userId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const claims = await privyServer.utils().auth().verifyAccessToken(token);
    const externalId = toExternalId(claims.user_id);

    let wallet;
    try {
      wallet = await privyServer.wallets().create({
        chain_type: "starknet",
        external_id: externalId,
      });
    } catch {
      // Wallet already exists — retrieve it by external_id
      for await (const w of privyServer.wallets().list({ external_id: externalId })) {
        wallet = w;
        break;
      }
      if (!wallet) throw new Error("Failed to create or retrieve wallet");
    }

    return NextResponse.json({
      id: wallet.id,
      address: wallet.address,
      publicKey: wallet.public_key ?? "",
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
