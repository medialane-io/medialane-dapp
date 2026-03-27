import { RpcProvider, shortString, hash } from "starknet";
import { normalizeAddress } from "@/lib/utils";
import { isAssetReported } from "@/lib/reported-content";
import { formatPrice, lookupToken } from "@/lib/activity-ui";
import { MEDIALANE_CONTRACT_ADDRESS } from "@/lib/constants";

const COLLECTION_ADDRESS = process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS;

// Registry event selectors (hardcoded — stable hashes from existing code)
const TOKEN_MINTED_SELECTOR = "0x3e517dedbc7bae62d4ace7e3dfd33255c4a7fe7c1c6f53c725d52b45f9c5a00";
const COLLECTION_CREATED_SELECTOR = "0xfca650bfd622aeae91aa1471499a054e4c7d3f0d75fbcb98bdb3bbb0358b0c";
const TOKEN_TRANSFERRED_SELECTOR = "0x3ddaa3f2d17cc7984d82075aa171282e6fff4db61944bf218f60678f95e2567";
const TRANSFER_SELECTOR = "0x99cd8bde557814842a3121e8ddfd433a539b8c9f14bf31ebf108d12e6196e9";

// Marketplace event selectors computed at runtime
const ORDER_CREATED_SELECTOR = hash.getSelectorFromName("OrderCreated");
const ORDER_FULFILLED_SELECTOR = hash.getSelectorFromName("OrderFulfilled");
const ORDER_CANCELLED_SELECTOR = hash.getSelectorFromName("OrderCancelled");

export const BLOCK_WINDOW_SIZE = 50000;

export interface ParsedEvent {
    id: string;
    type: "mint" | "transfer" | "collection" | "listing" | "offer" | "sale" | "cancel";
    source: "registry" | "marketplace";
    collectionId: string;
    collectionAddress?: string;
    tokenId?: string;
    owner: string;
    recipient?: string;
    metadataUri?: string;
    descriptor?: string;
    baseUri?: string;
    txHash: string;
    blockNumber: number;
    rawTimestamp?: number;
    // Marketplace-specific
    orderHash?: string;
    offerer?: string;
    fulfiller?: string;
}

export interface ResolvedOrder {
    orderType: "listing" | "offer";
    collectionAddress: string;
    tokenId: string;
    price: string;
    currency: string;
    priceDisplay: string;
}

// Named indices replace magic array positions — silently-breaking changes become compile errors
const ORDER_DETAIL_IDX = {
    OFFER_ITEM_TYPE: 1,
    OFFER_TOKEN: 2,
    OFFER_IDENTIFIER: 3,
    OFFER_START_AMOUNT: 4,
    CONSIDERATION_TOKEN: 7,
    CONSIDERATION_IDENTIFIER: 8,
    CONSIDERATION_START_AMOUNT: 9,
} as const;

// Helper to parse Cairo ByteArray from event data iterator
export function parseByteArray(dataIter: IterableIterator<string>): string {
    const lenResult = dataIter.next();
    if (lenResult.done) return "";
    const dataLen = parseInt(lenResult.value, 16);

    let result = "";
    for (let i = 0; i < dataLen; i++) {
        const chunk = dataIter.next().value;
        if (chunk) {
            try {
                result += shortString.decodeShortString(chunk);
            } catch {
                // skip invalid chunks
            }
        }
    }

    const pendingWord = dataIter.next().value;
    dataIter.next(); // pendingLen

    if (pendingWord && pendingWord !== "0x0" && pendingWord !== "0x00") {
        try {
            result += shortString.decodeShortString(pendingWord);
        } catch {
            // skip
        }
    }

    return result;
}

export async function resolveOrderDetails(
    provider: RpcProvider,
    orderHash: string
): Promise<ResolvedOrder | null> {
    try {
        const result = await provider.callContract({
            contractAddress: MEDIALANE_CONTRACT_ADDRESS,
            entrypoint: "get_order_details",
            calldata: [orderHash],
        });

        if (!result || result.length < 12) return null;

        let offerItemType: string;
        try {
            offerItemType = shortString.decodeShortString(result[ORDER_DETAIL_IDX.OFFER_ITEM_TYPE]);
        } catch {
            offerItemType = "";
        }

        if (offerItemType === "ERC721") {
            // Listing: seller offers NFT, consideration is ERC20 (price)
            const collectionAddress = result[ORDER_DETAIL_IDX.OFFER_TOKEN];
            const tokenId = BigInt(result[ORDER_DETAIL_IDX.OFFER_IDENTIFIER]).toString();
            const priceRaw = result[ORDER_DETAIL_IDX.CONSIDERATION_START_AMOUNT];
            const currencyAddress = result[ORDER_DETAIL_IDX.CONSIDERATION_TOKEN];
            const token = lookupToken(currencyAddress);
            const currency = token?.symbol ?? "ETH";
            const decimals = token?.decimals ?? 18;
            const price = formatPrice(priceRaw, decimals);
            return {
                orderType: "listing",
                collectionAddress,
                tokenId,
                price,
                currency,
                priceDisplay: `${price} ${currency}`,
            };
        } else if (offerItemType === "ERC20") {
            // Buy offer: buyer offers ERC20, consideration is NFT
            const collectionAddress = result[ORDER_DETAIL_IDX.CONSIDERATION_TOKEN];
            const tokenId = BigInt(result[ORDER_DETAIL_IDX.CONSIDERATION_IDENTIFIER]).toString();
            const priceRaw = result[ORDER_DETAIL_IDX.OFFER_START_AMOUNT];
            const currencyAddress = result[ORDER_DETAIL_IDX.OFFER_TOKEN];
            const token = lookupToken(currencyAddress);
            const currency = token?.symbol ?? "ETH";
            const decimals = token?.decimals ?? 18;
            const price = formatPrice(priceRaw, decimals);
            return {
                orderType: "offer",
                collectionAddress,
                tokenId,
                price,
                currency,
                priceDisplay: `${price} ${currency}`,
            };
        }

        return null;
    } catch {
        return null;
    }
}

// Fetch registry events for a block range
export async function fetchRegistryEventsInRange(
    provider: RpcProvider,
    fromBlock: number,
    toBlock: number,
    walletAddress: string | null
): Promise<ParsedEvent[]> {
    if (!COLLECTION_ADDRESS) return [];

    const rangeEvents: ParsedEvent[] = [];
    let continuationToken: string | undefined = undefined;
    let pageCount = 0;
    const maxPagesPerWindow = 50;

    try {
        do {
            const response = await provider.getEvents({
                address: COLLECTION_ADDRESS,
                keys: [[
                    TOKEN_MINTED_SELECTOR,
                    COLLECTION_CREATED_SELECTOR,
                    TOKEN_TRANSFERRED_SELECTOR,
                    TRANSFER_SELECTOR,
                ]],
                from_block: { block_number: fromBlock },
                to_block: { block_number: toBlock },
                chunk_size: 100,
                continuation_token: continuationToken,
            });

            for (const event of response.events) {
                try {
                    const eventKey = event.keys[0];
                    const data = event.data;
                    const dataIter = data[Symbol.iterator]();

                    if (eventKey === TOKEN_MINTED_SELECTOR) {
                        const cIdLow = dataIter.next().value;
                        const cIdHigh = dataIter.next().value;
                        if (!cIdLow || !cIdHigh) continue;
                        const collectionId = (BigInt(cIdLow) + (BigInt(cIdHigh) << 128n)).toString();
                        const collectionAddress = "0x" + (BigInt(cIdLow) + (BigInt(cIdHigh) << 128n)).toString(16);

                        const tIdLow = dataIter.next().value;
                        const tIdHigh = dataIter.next().value;
                        if (!tIdLow || !tIdHigh) continue;
                        const tokenId = (BigInt(tIdLow) + (BigInt(tIdHigh) << 128n)).toString();

                        const assetId = `${collectionAddress}-${tokenId}`;
                        if (isAssetReported(assetId)) continue;

                        const owner = dataIter.next().value;
                        if (!owner) continue;

                        if (walletAddress) {
                            const normalizedOwner = normalizeAddress(owner.toLowerCase());
                            if (normalizedOwner !== walletAddress) continue;
                        }

                        const metadataUri = parseByteArray(dataIter);

                        rangeEvents.push({
                            id: `${event.transaction_hash}-${tokenId}`,
                            type: "mint",
                            source: "registry",
                            collectionId,
                            collectionAddress,
                            tokenId,
                            owner,
                            metadataUri,
                            txHash: event.transaction_hash || "",
                            blockNumber: event.block_number || 0,
                        });

                    } else if (eventKey === COLLECTION_CREATED_SELECTOR) {
                        const cIdLow = dataIter.next().value;
                        const cIdHigh = dataIter.next().value;
                        if (!cIdLow || !cIdHigh) continue;
                        const collectionId = (BigInt(cIdLow) + (BigInt(cIdHigh) << 128n)).toString();

                        const owner = dataIter.next().value;
                        const collectionName = parseByteArray(dataIter);
                        parseByteArray(dataIter); // symbol
                        const baseUri = parseByteArray(dataIter);

                        if (!owner) continue;

                        if (walletAddress) {
                            const normalizedOwner = normalizeAddress(owner.toLowerCase());
                            if (normalizedOwner !== walletAddress) continue;
                        }

                        rangeEvents.push({
                            id: `${event.transaction_hash}-${collectionId}`,
                            type: "collection",
                            source: "registry",
                            collectionId,
                            owner,
                            descriptor: collectionName,
                            baseUri,
                            txHash: event.transaction_hash || "",
                            blockNumber: event.block_number || 0,
                        });

                    } else if (eventKey === TOKEN_TRANSFERRED_SELECTOR) {
                        const cIdLow = dataIter.next().value;
                        const cIdHigh = dataIter.next().value;
                        if (!cIdLow || !cIdHigh) continue;
                        const collectionId = (BigInt(cIdLow) + (BigInt(cIdHigh) << 128n)).toString();
                        const collectionAddress = "0x" + (BigInt(cIdLow) + (BigInt(cIdHigh) << 128n)).toString(16);

                        const tIdLow = dataIter.next().value;
                        const tIdHigh = dataIter.next().value;
                        if (!tIdLow || !tIdHigh) continue;
                        const tokenId = (BigInt(tIdLow) + (BigInt(tIdHigh) << 128n)).toString();

                        const operator = dataIter.next().value;
                        const tsHex = dataIter.next().value;
                        if (!operator || !tsHex) continue;

                        if (walletAddress) {
                            const normalizedOperator = normalizeAddress(operator.toLowerCase());
                            if (normalizedOperator !== walletAddress) continue;
                        }

                        const timestamp = parseInt(tsHex, 16);

                        rangeEvents.push({
                            id: `${event.transaction_hash}-${tokenId}-tr`,
                            type: "transfer",
                            source: "registry",
                            collectionId,
                            collectionAddress,
                            tokenId,
                            owner: operator,
                            txHash: event.transaction_hash || "",
                            blockNumber: event.block_number || 0,
                            rawTimestamp: timestamp,
                        });

                    } else if (eventKey === TRANSFER_SELECTOR) {
                        const fromAddress = event.keys[1] as string;
                        const toAddress = event.keys[2] as string;

                        const tIdLow = dataIter.next().value;
                        const tIdHigh = dataIter.next().value;

                        if (fromAddress && toAddress && tIdLow && tIdHigh) {
                            const tokenId = (BigInt(tIdLow) + (BigInt(tIdHigh) << 128n)).toString();
                            if (BigInt(fromAddress) === 0n) continue; // ignore mints

                            if (walletAddress) {
                                const normalizedFrom = normalizeAddress(fromAddress.toLowerCase());
                                const normalizedTo = normalizeAddress(toAddress.toLowerCase());
                                if (normalizedFrom !== walletAddress && normalizedTo !== walletAddress) continue;
                            }

                            rangeEvents.push({
                                id: `${event.transaction_hash}-${tokenId}-transfer`,
                                type: "transfer",
                                source: "registry",
                                collectionId: "0",
                                collectionAddress: COLLECTION_ADDRESS || "",
                                tokenId,
                                owner: fromAddress,
                                recipient: toAddress,
                                txHash: event.transaction_hash || "",
                                blockNumber: event.block_number || 0,
                            });
                        }
                    }
                } catch {
                    // skip malformed event
                }
            }

            continuationToken = response.continuation_token;
            pageCount++;
        } while (continuationToken && pageCount < maxPagesPerWindow);
    } catch (err) {
        console.error(`Registry events fetch error ${fromBlock}-${toBlock}:`, err);
    }

    return rangeEvents;
}

// Fetch marketplace events for a block range
export async function fetchMarketplaceEventsInRange(
    provider: RpcProvider,
    fromBlock: number,
    toBlock: number,
    walletAddress: string | null
): Promise<ParsedEvent[]> {
    if (!MEDIALANE_CONTRACT_ADDRESS) return [];

    const rangeEvents: ParsedEvent[] = [];
    let continuationToken: string | undefined = undefined;
    let pageCount = 0;
    const maxPagesPerWindow = 50;

    try {
        do {
            const response = await provider.getEvents({
                address: MEDIALANE_CONTRACT_ADDRESS,
                keys: [[
                    ORDER_CREATED_SELECTOR,
                    ORDER_FULFILLED_SELECTOR,
                    ORDER_CANCELLED_SELECTOR,
                ]],
                from_block: { block_number: fromBlock },
                to_block: { block_number: toBlock },
                chunk_size: 100,
                continuation_token: continuationToken,
            });

            for (const event of response.events) {
                try {
                    const eventKey = event.keys[0];
                    // All fields are keys: [selector, order_hash, offerer, (fulfiller for Fulfilled)]
                    const orderHash = event.keys[1] as string;
                    const offerer = event.keys[2] as string;
                    const fulfiller = event.keys[3] as string | undefined;

                    if (!orderHash || !offerer) continue;

                    if (walletAddress) {
                        const normalizedOfferer = normalizeAddress(offerer.toLowerCase());
                        const normalizedFulfiller = fulfiller
                            ? normalizeAddress(fulfiller.toLowerCase())
                            : null;

                        if (eventKey === ORDER_CREATED_SELECTOR || eventKey === ORDER_CANCELLED_SELECTOR) {
                            if (normalizedOfferer !== walletAddress) continue;
                        } else if (eventKey === ORDER_FULFILLED_SELECTOR) {
                            if (normalizedOfferer !== walletAddress && normalizedFulfiller !== walletAddress) continue;
                        }
                    }

                    let type: ParsedEvent["type"];
                    if (eventKey === ORDER_CREATED_SELECTOR) {
                        type = "listing"; // provisional — resolved to listing or offer in buildActivities
                    } else if (eventKey === ORDER_FULFILLED_SELECTOR) {
                        type = "sale";
                    } else {
                        type = "cancel";
                    }

                    rangeEvents.push({
                        id: `${event.transaction_hash}-${orderHash}`,
                        type,
                        source: "marketplace",
                        collectionId: "",
                        owner: offerer,
                        txHash: event.transaction_hash || "",
                        blockNumber: event.block_number || 0,
                        orderHash,
                        offerer,
                        fulfiller,
                    });
                } catch {
                    // skip malformed event
                }
            }

            continuationToken = response.continuation_token;
            pageCount++;
        } while (continuationToken && pageCount < maxPagesPerWindow);
    } catch (err) {
        console.error(`Marketplace events fetch error ${fromBlock}-${toBlock}:`, err);
    }

    return rangeEvents;
}

export async function scanBlockRange(
    provider: RpcProvider,
    effectiveStart: number,
    toBlock: number,
    targetCount: number,
    normalizedWallet: string | null,
): Promise<{ events: ParsedEvent[]; nextToBlock: number; reachedStart: boolean }> {
    const events: ParsedEvent[] = [];
    let currentToBlock = toBlock;
    let attempts = 0;
    const maxAttempts = 10;

    while (events.length < targetCount && attempts < maxAttempts && currentToBlock > effectiveStart) {
        const windowFrom = Math.max(effectiveStart, currentToBlock - BLOCK_WINDOW_SIZE);
        const [reg, mkt] = await Promise.all([
            fetchRegistryEventsInRange(provider, windowFrom, currentToBlock, normalizedWallet),
            fetchMarketplaceEventsInRange(provider, windowFrom, currentToBlock, normalizedWallet),
        ]);
        events.push(...reg, ...mkt);
        currentToBlock = windowFrom - 1;
        attempts++;
        if (currentToBlock < effectiveStart) break;
    }
    return { events, nextToBlock: currentToBlock, reachedStart: currentToBlock <= effectiveStart };
}
