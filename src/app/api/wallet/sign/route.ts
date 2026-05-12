import { NextRequest, NextResponse } from "next/server";
import { privyServer } from "@/lib/privy-server";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { walletId: string; hash: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { walletId, hash } = body;
  if (!walletId || !hash) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  try {
    await privyServer.utils().auth().verifyAccessToken(token);

    const result = await privyServer.wallets().rawSign(walletId, {
      params: { hash: hash as `0x${string}` },
    });

    return NextResponse.json({ signature: result.signature });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
