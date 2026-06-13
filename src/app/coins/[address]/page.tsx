import type { Metadata } from "next";
import { fetchCollectionMeta, ipfsToHttpServer } from "@/lib/api-server";
import CollectionPageClient from "@/app/collections/[contract]/collection-page-client";

export const revalidate = 60;

interface Props {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  const col = await fetchCollectionMeta(address);

  const name = col?.name ?? "Creator Coin";
  const description = col?.description ?? `Buy, hold, and trade ${name} on Medialane.`;
  const rawImage = col?.image;
  const imageUrl = rawImage ? ipfsToHttpServer(rawImage) : undefined;

  return {
    title: name,
    description,
    // Canonical lives at /coins/[address]; /collections/[address] still resolves
    // the same coin view for old links and points here.
    alternates: { canonical: `/coins/${address}` },
    openGraph: {
      title: `${name} | Medialane`,
      description,
      ...(imageUrl && { images: [{ url: imageUrl, width: 1200, height: 630, alt: name }] }),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: `${name} | Medialane`,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

// Creator Coins render through the same dispatcher as collections (it
// early-returns the coin view for `uiVariant === "coin"`); the client reads the
// `address` route param. /coins/[address] is the friendlier canonical URL.
export default function CoinDetailPage() {
  return <CollectionPageClient />;
}
