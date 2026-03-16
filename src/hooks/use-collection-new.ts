import { useState, useEffect, useMemo } from "react";
import { useContract } from "@starknet-react/core";
import { Asset, LicenseType } from "@/types/asset";
import { Collection } from "@/lib/types";
import { isAssetReported } from "@/lib/reported-content";
import { Abi, shortString } from "starknet";
import { fetchIPFSMetadata, processIPFSHashToUrl } from "@/utils/ipfs";

// --- Minimal ABIs ---

const MINIMAL_COLLECTION_ABI = [
  {
    type: "struct",
    name: "core::integer::u256",
    members: [
      { name: "low", type: "core::integer::u128" },
      { name: "high", type: "core::integer::u128" },
    ],
  },
  {
    type: "struct",
    name: "core::byte_array::ByteArray",
    members: [
      { name: "data", type: "core::array::Array::<core::bytes_31::bytes31>" },
      { name: "pending_word", type: "core::felt252" },
      { name: "pending_word_len", type: "core::integer::u32" },
    ],
  },
  {
    type: "function",
    name: "get_collection_id",
    inputs: [],
    outputs: [{ type: "core::integer::u256" }],
    state_mutability: "view",
  },
  {
    type: "function",
    name: "total_supply",
    inputs: [],
    outputs: [{ type: "core::integer::u256" }],
    state_mutability: "view",
  },
  {
    type: "function",
    name: "owner_of",
    inputs: [{ name: "token_id", type: "core::integer::u256" }],
    outputs: [{ type: "core::starknet::contract_address::ContractAddress" }],
    state_mutability: "view",
  },
  {
    type: "function",
    name: "token_uri",
    inputs: [{ name: "token_id", type: "core::integer::u256" }],
    outputs: [{ type: "core::byte_array::ByteArray" }],
    state_mutability: "view",
  },
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ type: "core::byte_array::ByteArray" }],
    state_mutability: "view",
  },
] as const;

const MINIMAL_MIP_ABI = [
  {
    type: "struct",
    name: "core::integer::u256",
    members: [
      { name: "low", type: "core::integer::u128" },
      { name: "high", type: "core::integer::u128" },
    ],
  },
  {
    type: "struct",
    name: "core::byte_array::ByteArray",
    members: [
      { name: "data", type: "core::array::Array::<core::bytes_31::bytes31>" },
      { name: "pending_word", type: "core::felt252" },
      { name: "pending_word_len", type: "core::integer::u32" },
    ],
  },
  {
    type: "enum",
    name: "core::bool",
    variants: [
      { name: "False", type: "()" },
      { name: "True", type: "()" },
    ],
  },
  {
    type: "struct",
    name: "ip_collection_erc_721::types::Collection",
    members: [
      { name: "name", type: "core::byte_array::ByteArray" },
      { name: "symbol", type: "core::byte_array::ByteArray" },
      { name: "base_uri", type: "core::byte_array::ByteArray" },
      { name: "owner", type: "core::starknet::contract_address::ContractAddress" },
      { name: "ip_nft", type: "core::starknet::contract_address::ContractAddress" },
      { name: "is_active", type: "core::bool" },
    ],
  },
  {
    type: "function",
    name: "get_collection",
    inputs: [{ name: "collection_id", type: "core::integer::u256" }],
    outputs: [{ type: "ip_collection_erc_721::types::Collection" }],
    state_mutability: "view",
  },
] as const;

function resolveIpfsUrl(url: string): string {
  return processIPFSHashToUrl(url, "/placeholder.svg");
}

function mapStringToLicenseType(value: string): LicenseType {
  const normalized = value?.toLowerCase() || "";

  if (normalized === "cc-by" || normalized === "creative commons") return "cc-by";
  if (normalized === "cc-by-sa") return "cc-by-sa";
  if (normalized === "cc-by-nc") return "cc-by-nc";

  if (normalized === "all-rights-reserved" || normalized === "exclusive rights" || normalized === "exclusive") {
    return "all-rights-reserved";
  }

  // Legacy/Other mappings
  if (normalized.includes("commercial")) return "custom"; // "Commercial Use" -> Custom
  if (normalized.includes("personal")) return "all-rights-reserved"; // "Personal Use" -> All Rights Reserved (closest safe default)
  if (normalized.includes("open source") || normalized === "mit" || normalized === "apache-2.0") return "custom";

  return "all-rights-reserved"; // Default fallback
}

// Helper to decode Cairo 1 ByteArray from raw felt array (object with data, pending_word, etc)
function decodeByteArray(data: any): string {
  if (!data) return "";
  
  // Handle already decoded string
  if (typeof data === 'string') return data;

  try {
    // If it's the new Starknet.js ByteArray object format
    if (data.data && Array.isArray(data.data)) {
      let str = "";
      // Words are 31 bytes each
      for (const word of data.data) {
        if (word) {
          str += shortString.decodeShortString(word);
        }
      }

      // Pending word
      if (data.pending_word && data.pending_word_len) {
        const pendingLen = Number(data.pending_word_len);
        if (pendingLen > 0) {
          const decoded = shortString.decodeShortString(data.pending_word);
          str += decoded.substring(0, pendingLen);
        }
      }
      return str.replace(/\0/g, "").trim();
    }
    
    // Fallback for old felt array format
    if (Array.isArray(data) && data.length > 0) {
        const numWords = parseInt(data[0]);
        let str = "";
        for (let i = 0; i < numWords; i++) {
            const word = data[i + 1];
            if (word) str += shortString.decodeShortString(word);
        }
        if (data.length >= numWords + 3) {
            const pendingWord = data[numWords + 1];
            const pendingLen = parseInt(data[numWords + 2]);
            if (pendingLen > 0 && pendingWord) {
                const decoded = shortString.decodeShortString(pendingWord);
                str += decoded.substring(0, pendingLen);
            }
        }
        return str.replace(/\0/g, "").trim();
    }
  } catch (e) {
    console.warn("Failed to decode ByteArray:", e);
  }
  return "";
}

export function useCollectionMetadata(collectionAddress: string) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const MIPAddress = process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS!;

  const normalizedAddress = useMemo(() => {
    if (!collectionAddress) return undefined;
    if (String(collectionAddress).toLowerCase().startsWith("0x")) return collectionAddress;
    try {
      return "0x" + BigInt(collectionAddress).toString(16);
    } catch {
      return collectionAddress;
    }
  }, [collectionAddress]);

  const { contract: collectionContract } = useContract({
    abi: MINIMAL_COLLECTION_ABI as any,
    address: normalizedAddress as `0x${string}`,
  });

  const { contract: mipContract } = useContract({
    abi: MINIMAL_MIP_ABI as any,
    address: MIPAddress as `0x${string}`,
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!collectionAddress || !MIPAddress || !collectionContract || !mipContract) return;

      setLoading(true);
      setError(null);

      try {
        const collectionIdResult = await collectionContract.call("get_collection_id", [] as any[]);
        const collectionIdCasted = collectionIdResult as any;
        const collectionId = typeof collectionIdCasted === 'object'
          ? (BigInt(collectionIdCasted.high) << 128n) + BigInt(collectionIdCasted.low)
          : BigInt(collectionIdCasted);

        const totalSupplyResult = await collectionContract.call("total_supply", [] as any[]);
        const totalSupplyCasted = totalSupplyResult as any;
        const totalSupply = typeof totalSupplyCasted === 'object'
          ? (BigInt(totalSupplyCasted.high) << 128n) + BigInt(totalSupplyCasted.low)
          : BigInt(totalSupplyCasted);

        const collectionDetails: any = await mipContract.call("get_collection", [collectionId.toString()] as any[]);

        const name = collectionDetails.name;
        const symbol = collectionDetails.symbol;
        const rawBaseUri = collectionDetails.base_uri || "";
        const owner = collectionDetails.owner ? `0x${BigInt(collectionDetails.owner).toString(16)}` : "";

        let description = "";
        let image = "/placeholder.svg";
        let resolvedBaseUri = "";

        if (rawBaseUri) {
          try {
            const isDirectory = rawBaseUri.endsWith("/");

            // Candidate URLs to try, in order of preference.
            // If base_uri is a directory (token base), try well-known collection metadata paths first.
            // If base_uri is a file CID, fetch it directly as collection metadata.
            const candidates = isDirectory
              ? [
                  rawBaseUri + "collection",       // OpenSea/Manifold standard
                  rawBaseUri + "collection.json",  // Alternative extension
                  rawBaseUri + "contract",          // Used by some protocols
                  rawBaseUri + "0",                 // Some collections store collection metadata at token 0
                ]
              : [rawBaseUri];

            for (const candidate of candidates) {
              try {
                const metadataUrl = resolveIpfsUrl(candidate);
                if (!metadataUrl || metadataUrl === "/placeholder.svg") continue;

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                const res = await fetch(metadataUrl, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!res.ok) continue;
                const json = await res.json();

                // Validate it looks like metadata (not a binary or error response)
                if (typeof json !== "object" || json === null) continue;

                description = json.description || "";
                // OpenSea collection standard: image, image_url, cover_image, banner_image_url, featured_image
                const rawImage = json.image || json.image_url || json.cover_image || json.coverImage ||
                  json.banner_image_url || json.featured_image;
                if (rawImage) {
                  image = resolveIpfsUrl(rawImage);
                }
                resolvedBaseUri = resolveIpfsUrl(rawBaseUri);
                break;
              } catch {
                // Try next candidate
              }
            }
          } catch (e) {
            console.warn("Failed to fetch collection IPFS metadata", e);
          }
        }

        // --- FALLBACKS ---

        // 1. Fallback for Name: If registry name is empty or too generic, try NFT contract name()
        let finalName = decodeByteArray(name);
        if (!finalName || finalName === "IP Collection" || finalName === "MIP Collection") {
          try {
            const nftNameResult = await collectionContract.call("name", []);
            const decodedNftName = decodeByteArray(nftNameResult);
            if (decodedNftName) finalName = decodedNftName;
          } catch (e) {
            // nft.name() might not exist or fail
          }
        }

        // 2. Fallback for Description/Image: If baseUri was empty or fetch failed, try first token
        if ((!description || image === "/placeholder.svg") && Number(totalSupply) > 0) {
          try {
            // Try token #1 then token #0 (as found in some collections)
            let tokenUriBA: any = null;
            try {
              tokenUriBA = await collectionContract.call("token_uri", ["1", "0"]);
            } catch (e) {
              try {
                tokenUriBA = await collectionContract.call("token_uri", ["0", "0"]);
              } catch (e2) {}
            }

            if (tokenUriBA) {
              const tokenUri = decodeByteArray(tokenUriBA);
              if (tokenUri) {
                const cid = tokenUri.replace('ipfs://', '').replace(/^ipfs\//, '').replace('https://ipfs.io/ipfs/', '').replace('https://gateway.pinata.cloud/ipfs/', '');
                if (cid && cid.length >= 32) {
                  const tokenMetadata = await fetchIPFSMetadata(cid);
                  if (tokenMetadata) {
                    if (!description) description = tokenMetadata.description || "";
                    if (image === "/placeholder.svg") {
                      const tokenImage = tokenMetadata.image || tokenMetadata.image_url ||
                        tokenMetadata.assetUrl || tokenMetadata.asset_url ||
                        tokenMetadata.cover_image || tokenMetadata.coverImage ||
                        tokenMetadata.banner_image_url || tokenMetadata.featured_image ||
                        tokenMetadata.thumbnail_uri;
                      if (tokenImage) {
                        image = resolveIpfsUrl(tokenImage as string);
                      }
                    }
                  }
                }
              }
            }
          } catch (err) {
            console.warn("Failed to fetch fallback token metadata", err);
          }
        }

        setCollection({
          id: collectionId.toString(),
          name: finalName || "IP Collection",
          symbol: decodeByteArray(symbol) || "MIP",
          description: description || "Programmable Intellectual Property Collection",
          image: image,
          nftAddress: normalizedAddress as string,
          owner: owner,
          isActive: collectionDetails.is_active,
          totalMinted: Number(totalSupply),
          totalBurned: 0,
          totalTransfers: 0,
          lastMintTime: "",
          lastBurnTime: "",
          lastTransferTime: "",
          itemCount: Number(totalSupply),
          totalSupply: Number(totalSupply),
          baseUri: resolvedBaseUri,
        });

      } catch (err: any) {
        console.error("Error fetching collection metadata:", err);
        setError(err.message || "Failed to fetch collection data");
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [collectionAddress, MIPAddress, collectionContract, mipContract]);

  return { collection, loading, error };
}

export function useCollectionAssets(collectionAddress: string) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizedAddress = useMemo(() => {
    if (!collectionAddress) return undefined;
    if (String(collectionAddress).toLowerCase().startsWith("0x")) return collectionAddress;
    try {
      return "0x" + BigInt(collectionAddress).toString(16);
    } catch {
      return collectionAddress;
    }
  }, [collectionAddress]);

  const { contract: collectionContract } = useContract({
    abi: MINIMAL_COLLECTION_ABI as any,
    address: normalizedAddress as `0x${string}`,
  });

  useEffect(() => {
    const fetchAssets = async () => {
      if (!collectionAddress || !collectionContract) return;

      setLoading(true);
      setError(null);

      try {
        const totalSupplyResult = await collectionContract.call("total_supply", [] as any[]);
        const totalSupplyCasted = totalSupplyResult as any;
        const totalSupply = Number(
          typeof totalSupplyCasted === 'object'
            ? (BigInt(totalSupplyCasted.high) << 128n) + BigInt(totalSupplyCasted.low)
            : BigInt(totalSupplyCasted)
        );

        const tokenIds = Array.from({ length: totalSupply }, (_, i) => i);

        // Fetch owners
        const ownersPromises = tokenIds.map(id => collectionContract.call("owner_of", [id] as any[]));
        const ownersResults = await Promise.allSettled(ownersPromises);

        const validOwners = ownersResults.map((result, index) => {
          if (result.status === "fulfilled") {
            const val = result.value as any;
            const owner = val ? `0x${BigInt(val).toString(16)}` : "";
            return { tokenId: index, owner };
          }
          return null;
        }).filter((item): item is { tokenId: number, owner: string } => item !== null && !!item.owner && item.owner !== "0x0");

        // Fetch URIs
        const uriPromises = validOwners.map(({ tokenId }) => collectionContract.call("token_uri", [tokenId] as any[]));
        const uriResults = await Promise.allSettled(uriPromises);

        const validUris = uriResults.map((result, index) => {
          if (result.status === "fulfilled") {
            return { tokenId: validOwners[index].tokenId, owner: validOwners[index].owner, uri: resolveIpfsUrl(decodeByteArray(result.value)) };
          }
          return null;
        }).filter((item): item is { tokenId: number, owner: string, uri: string } => item !== null && !!item.uri && item.uri !== "/placeholder.svg");

        // Fetch Metadata using the more robust fetchIPFSMetadata
        const metadataPromises = validUris.map(async ({ tokenId, owner, uri }) => {
          try {
            // Extract CID from URI if possible
            const cid = uri.replace('ipfs://', '').replace(/^ipfs\//, '').replace('https://ipfs.io/ipfs/', '').replace('https://gateway.pinata.cloud/ipfs/', '');
            const metadata = await fetchIPFSMetadata(cid);
            if (metadata) {
              return { tokenId, owner, metadata };
            }
            // Fallback for non-IPFS URIs
            const res = await fetch(uri);
            if (res.ok) {
              const directMetadata = await res.json();
              return { tokenId, owner, metadata: directMetadata };
            }
            return null;
          } catch (e) {
            console.warn(`Failed to fetch metadata for ${tokenId}`, e);
            return null;
          }
        });

        const metadataResults = (await Promise.all(metadataPromises)).filter((item): item is { tokenId: number, owner: string, metadata: any } => item !== null);

        const parsedAssets: Asset[] = metadataResults.map(({ tokenId, owner, metadata }) => {
          const licenseAttribute = metadata.attributes?.find((attr: any) => attr.trait_type === "License");
          const licenseType = mapStringToLicenseType(licenseAttribute?.value || "Personal Use");

          const typeAttribute = metadata.attributes?.find((attr: any) => attr.trait_type === "Type");

          // Exhaustive image field check
          const rawImage = metadata.image || metadata.image_url || metadata.assetUrl || metadata.asset_url || metadata.cover_image || metadata.coverImage || metadata.thumbnail_uri;
          return {
            id: `${normalizedAddress}-${tokenId}`,
            name: metadata.name || `Asset #${tokenId}`,
            creator: owner,
            verified: true,
            image: resolveIpfsUrl((rawImage || "/placeholder.svg") as string),
            collection: normalizedAddress as string,
            licenseType,
            description: metadata.description || "",
            type: typeAttribute?.value || "Unknown",
            metadata
          };
        });

        setAssets(parsedAssets.filter(asset => !isAssetReported(asset.id)));

      } catch (err: any) {
        console.error("Error fetching collection assets:", err);
        setError(err.message || "Failed to fetch assets");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [collectionAddress, collectionContract]);

  return { assets, loading, error };
}
