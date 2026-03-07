import type { Activity } from "@/hooks/use-activities";
import type { ParsedEvent, ResolvedOrder } from "@/lib/activity-events";
import { resolveOrderDetails } from "@/lib/activity-events";
import { RpcProvider } from "starknet";
import { processIPFSHashToUrl } from "@/utils/ipfs";
import { formatPrice, lookupToken } from "@/lib/activity-ui";
import { normalizeStarknetAddress } from "@/lib/utils";

// Module-level — persists across page navigations and shared across all hook instances.
// Block timestamps are immutable on-chain data so this cache never needs invalidation.
export const blockTimestampCache = new Map<number, string>();

export async function buildActivities(
    eventsToProcess: ParsedEvent[],
    existingActivities: Activity[],
    provider: RpcProvider,
    resolvedOrdersCache: Map<string, ResolvedOrder | null>,
    normalizedWallet: string | null,
    signal: AbortSignal,
): Promise<{ activities: Activity[]; timestampsAdded: boolean }> {
    if (signal.aborted) return { activities: [], timestampsAdded: false };

    // 1. Fetch missing block timestamps in batches of 5
    const uniqueBlocks = [...new Set(eventsToProcess.map(e => e.blockNumber))];
    const missingBlocks = uniqueBlocks.filter(bn => !blockTimestampCache.has(bn));
    let timestampsAdded = false;

    if (missingBlocks.length > 0) {
        const batchSize = 5;
        for (let i = 0; i < missingBlocks.length; i += batchSize) {
            if (signal.aborted) return { activities: [], timestampsAdded: false };
            const batch = missingBlocks.slice(i, i + batchSize);
            await Promise.all(batch.map(async (bn) => {
                try {
                    const block = await provider.getBlock(bn);
                    blockTimestampCache.set(bn, new Date(block.timestamp * 1000).toISOString());
                } catch {
                    blockTimestampCache.set(bn, new Date().toISOString());
                }
            }));
        }
        timestampsAdded = true;
    }

    if (signal.aborted) return { activities: [], timestampsAdded: false };

    // 2. Resolve uncached marketplace orders in batches of 10
    const marketplaceItems = eventsToProcess.filter(
        e => e.source === "marketplace" && e.orderHash && !resolvedOrdersCache.has(e.id)
    );

    if (marketplaceItems.length > 0) {
        const batchSize = 10;
        for (let i = 0; i < marketplaceItems.length; i += batchSize) {
            if (signal.aborted) return { activities: [], timestampsAdded: false };
            const batch = marketplaceItems.slice(i, i + batchSize);
            await Promise.all(batch.map(async (event) => {
                if (event.orderHash) {
                    const resolved = await resolveOrderDetails(provider, event.orderHash);
                    resolvedOrdersCache.set(event.id, resolved);
                }
            }));
        }
    }

    if (signal.aborted) return { activities: [], timestampsAdded: false };

    // 3. Determine which events need processing vs. can reuse existing activities
    const existingMap = new Map(existingActivities.map(a => [a.id, a]));
    const processedMap = new Map<number, Activity>();
    const itemsToProcess: { event: ParsedEvent; index: number }[] = [];

    for (let i = 0; i < eventsToProcess.length; i++) {
        const evt = eventsToProcess[i];
        const existing = existingMap.get(evt.id);
        if (existing) {
            const ts = evt.rawTimestamp
                ? new Date(evt.rawTimestamp * 1000).toISOString()
                : blockTimestampCache.get(evt.blockNumber);
            // Reuse existing activity if timestamp is unchanged
            if (!ts || existing.timestamp === ts) {
                processedMap.set(i, existing);
                continue;
            }
        }
        itemsToProcess.push({ event: evt, index: i });
    }

    // 4. Process new/changed items in batches of 10
    const batchSize = 10;
    for (let i = 0; i < itemsToProcess.length; i += batchSize) {
        if (signal.aborted) return { activities: [], timestampsAdded: false };
        const batch = itemsToProcess.slice(i, i + batchSize);

        await Promise.all(batch.map(async ({ event: parsed, index }) => {
            const timestamp = parsed.rawTimestamp
                ? new Date(parsed.rawTimestamp * 1000).toISOString()
                : (blockTimestampCache.get(parsed.blockNumber) || new Date().toISOString());

            if (parsed.source === "marketplace") {
                const resolved = resolvedOrdersCache.get(parsed.id) ?? null;

                let finalType: Activity["type"] = parsed.type as Activity["type"];
                if (parsed.type === "listing" && resolved?.orderType === "offer") {
                    finalType = "offer";
                }

                let details = "Marketplace order";
                if (resolved) {
                    if (finalType === "listing") {
                        details = `Listed for ${resolved.priceDisplay}`;
                    } else if (finalType === "offer") {
                        details = `Offered ${resolved.priceDisplay}`;
                    } else if (finalType === "sale") {
                        if (normalizedWallet && parsed.fulfiller) {
                            const normalizedFulfiller = normalizeStarknetAddress(parsed.fulfiller.toLowerCase());
                            details = normalizedFulfiller === normalizedWallet
                                ? `Purchased for ${resolved.priceDisplay}`
                                : `Sold for ${resolved.priceDisplay}`;
                        } else {
                            details = `Purchased for ${resolved.priceDisplay}`;
                        }
                    } else if (finalType === "cancel") {
                        details = `Cancelled ${resolved.orderType === "listing" ? "listing" : "offer"}`;
                    }
                }

                const assetName = resolved?.collectionAddress && resolved?.tokenId
                    ? `Asset #${resolved.tokenId}`
                    : "Marketplace order";
                const assetKey = resolved?.collectionAddress && resolved?.tokenId
                    ? `${resolved.collectionAddress}-${resolved.tokenId}`
                    : parsed.orderHash || parsed.id;

                processedMap.set(index, {
                    id: parsed.id,
                    type: finalType,
                    assetId: assetKey,
                    assetName,
                    assetImage: "/placeholder.svg",
                    user: parsed.offerer || parsed.owner,
                    counterparty: parsed.fulfiller,
                    timestamp,
                    details,
                    txHash: parsed.txHash,
                    price: resolved?.priceDisplay,
                    currency: resolved?.currency,
                    blockNumber: parsed.blockNumber,
                    tokenId: resolved?.tokenId,
                    collectionAddress: resolved?.collectionAddress,
                });
                return;
            }

            // Registry events
            let activityType: Activity["type"] = parsed.type as Activity["type"];
            let assetName = parsed.descriptor || (parsed.tokenId ? `Asset #${parsed.tokenId}` : "Unknown");
            let assetImage = "/placeholder.svg";
            let details = "";

            if (activityType === "collection") {
                details = "Created a new collection";
                assetName = parsed.descriptor || `Collection #${parsed.collectionId}`;

                if (parsed.baseUri) {
                    try {
                        const ipfsUrl = processIPFSHashToUrl(parsed.baseUri, "/placeholder.svg");
                        if (ipfsUrl !== "/placeholder.svg") {
                            const res = await fetch(ipfsUrl).catch(() => null);
                            if (res && res.ok) {
                                const metadata = await res.json();
                                const img = metadata.image || metadata.cover_image || metadata.coverImage;
                                if (img) assetImage = processIPFSHashToUrl(img, "/placeholder.svg");
                            }
                        }
                    } catch {
                        // ignore
                    }
                }
            } else if (activityType === "transfer") {
                details = parsed.recipient
                    ? `Transferred to ${parsed.recipient.slice(0, 6)}...${parsed.recipient.slice(-4)}`
                    : "Transferred asset";
            } else {
                details = "Programmable IP minted";
            }

            if (parsed.type === "mint" && parsed.metadataUri) {
                try {
                    const ipfsUrl = processIPFSHashToUrl(parsed.metadataUri, "/placeholder.svg");
                    if (ipfsUrl !== "/placeholder.svg") {
                        const res = await fetch(ipfsUrl, { signal: AbortSignal.timeout(5000) });
                        if (res.ok) {
                            const metadata = await res.json();
                            assetName = metadata.name || assetName;
                            assetImage = processIPFSHashToUrl(metadata.image || "/placeholder.svg", "/placeholder.svg");

                        }
                    }
                } catch {
                    // ignore
                }
            }

            const assetKey = parsed.type === "collection"
                ? parsed.collectionId
                : (parsed.collectionAddress && parsed.tokenId
                    ? `${parsed.collectionAddress}-${parsed.tokenId}`
                    : (parsed.tokenId || parsed.collectionId));

            processedMap.set(index, {
                id: parsed.id,
                type: activityType,
                assetId: assetKey,
                assetName,
                assetImage,
                user: parsed.owner,
                recipient: parsed.recipient,
                timestamp,
                details,
                txHash: parsed.txHash,
                blockNumber: parsed.blockNumber,
                tokenId: parsed.tokenId,
                collectionAddress: parsed.collectionAddress,
            });
        }));
    }

    if (signal.aborted) return { activities: [], timestampsAdded: false };

    // 5. Collect results preserving original event order
    const activities: Activity[] = [];
    for (let i = 0; i < eventsToProcess.length; i++) {
        const a = processedMap.get(i);
        if (a) activities.push(a);
    }
    return { activities, timestampsAdded };
}
