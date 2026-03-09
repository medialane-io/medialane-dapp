import { useState, useCallback, useEffect } from "react";
import {
  useAccount,
  useContract,
  useSendTransaction,
  useProvider,
} from "@starknet-react/core";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { Abi, ProviderInterface, Contract, shortString } from "starknet";
import { ipCollectionAbi } from "@/abis/ip_collection";
import { COLLECTION_NFT_ABI } from "@/abis/ip_nft";
import { COLLECTION_CONTRACT_ADDRESS, IPFS_URL } from "@/lib/constants";
import { fetchWithRateLimit } from "@/lib/utils";
import { isCollectionReported } from "@/lib/reported-content";

import { fetchIPFSMetadata, processIPFSHashToUrl } from "@/utils/ipfs";
import { Collection, CollectionValidator } from "@/lib/types";

export interface ICreateCollection {
  name: string;
  symbol: string;
  base_uri: string;
}

export interface CollectionFormData {
  name: string;
  symbol: string;
  description: string;
  type: string;
  visibility: string;
  coverImage?: string;
}

export interface CollectionMetadata {
  id: string;
  name: string;
  symbol: string;
  base_uri: string;
  owner: string;
  ip_nft: string;
  is_active: boolean;
  total_minted: string;
  total_burned: string;
  total_transfers: string;
  last_mint_time: string;
  last_burn_time: string;
  last_transfer_time: string;
}



export interface UseCollectionReturn {
  createCollection: (formData: ICreateCollection) => Promise<string>;
  isCreating: boolean;
  error: string | null;
}

const COLLECTION_CONTRACT_ABI = ipCollectionAbi as Abi;

// Helper to decode Cairo 1 ByteArray from raw felt array
function decodeByteArray(data: string[]): string {
    if (!data || data.length < 1) return "";
    try {
        const numWords = parseInt(data[0]);
        let str = "";

        // Words are 31 bytes each
        for (let i = 0; i < numWords; i++) {
            const word = data[i + 1];
            if (word) {
                str += shortString.decodeShortString(word);
            }
        }

        // Pending word
        if (data.length >= numWords + 3) {
            const pendingWord = data[numWords + 1];
            const pendingLen = parseInt(data[numWords + 2]);
            if (pendingLen > 0 && pendingWord) {
                const decoded = shortString.decodeShortString(pendingWord);
                str += decoded.substring(0, pendingLen);
            }
        }

        return str.replace(/\0/g, "").trim();
    } catch (e) {
        return "";
    }
}

// Shared hook to get the collection registry contract instance
function useCollectionContract() {
  return useContract({
    abi: COLLECTION_CONTRACT_ABI,
    address: COLLECTION_CONTRACT_ADDRESS as `0x${string}`,
  });
}

/**
 * Binary-search-style probe to find the highest valid collection ID.
 * Starts with IDs 0-20, then probes ahead in increasing offsets until
 * no new valid IDs are found.
 */
async function findMaxCollectionId(contract: any): Promise<number> {
  let highestFound = -1;
  let startFound = false;

  const initialBatch = Array.from({ length: 21 }, (_, i) => i);
  const initialResults = await Promise.all(
    initialBatch.map((id) =>
      contract.call("is_valid_collection", [id.toString()]).catch(() => false)
    )
  );
  for (let i = 0; i < initialResults.length; i++) {
    if (initialResults[i]) {
      highestFound = Math.max(highestFound, initialBatch[i]);
      startFound = true;
    }
  }

  if (!startFound) {
    const probes = [50, 100, 1000];
    const probeResults = await Promise.all(
      probes.map(id => contract.call("is_valid_collection", [id.toString()]).catch(() => false))
    );
    for (let i = 0; i < probes.length; i++) {
      if (probeResults[i]) {
        highestFound = probes[i];
        startFound = true;
      }
    }
    if (!startFound) return -1;
  }

  let keepProbing = true;
  while (keepProbing) {
    const offsets = [1, 2, 3, 4, 5, 10, 20, 30, 40, 50, 100, 200, 300, 400, 500, 1000, 2000, 5000, 10000];
    const uniqueProbes = Array.from(new Set(offsets.map(o => highestFound + o)));

    const results = await Promise.all(
      uniqueProbes.map(id => contract.call("is_valid_collection", [id.toString()]).catch(() => false))
    );

    let foundNewTotal = false;
    for (let i = 0; i < uniqueProbes.length; i++) {
      if (results[i] && uniqueProbes[i] > highestFound) {
        highestFound = uniqueProbes[i];
        foundNewTotal = true;
      }
    }
    keepProbing = foundNewTotal;
  }
  return highestFound;
}

// function to process collection metadata with validation
async function processCollectionMetadata(
  id: string,
  metadata: CollectionMetadata,
  provider?: ProviderInterface
): Promise<Collection> {
  let baseUri = metadata.base_uri;
  let nftAddress = metadata.ip_nft;
  if (nftAddress && nftAddress !== "0" && nftAddress !== "0x0") {
    try {
      // Convert decimal string to hex if needed
      if (!String(nftAddress).startsWith("0x")) {
        nftAddress = `0x${BigInt(nftAddress).toString(16)}`;
      }
    } catch (e) {
      console.warn(`Error formatting address for collection ${id}:`, e);
    }
  } else {
    nftAddress = "";
  }
  let isValidIPFS = false;

  if (typeof baseUri === 'string') {
    // Process baseUri
    const processedBaseUri = processIPFSHashToUrl(baseUri, '/placeholder.svg');
    // Check if the processed URL is valid for IPFS metadata fetching
    if (processedBaseUri && processedBaseUri.includes('/ipfs/')) {
      baseUri = processedBaseUri;
      isValidIPFS = true;
    }
  }

  // Fetch IPFS metadata if available
  let ipfsMetadata = null;
  try {
    if (isValidIPFS && baseUri && baseUri.includes('/ipfs/')) {
      const cidMatch = baseUri.match(/\/ipfs\/([a-zA-Z0-9]{46,})/);
      if (cidMatch) {
        const cid = cidMatch[1];
        if (cid.length >= 46) {
          ipfsMetadata = await fetchIPFSMetadata(cid);
        }
      }
    }
  } catch (error) {
    console.warn(`Failed to fetch IPFS metadata for collection ${id}:`, error);
    ipfsMetadata = null;
  }

  // Clean the name - remove null bytes and trim
  let cleanName = metadata.name;
  if (typeof cleanName === 'string') {
    cleanName = cleanName.replace(/\0/g, '').trim();
  }

  // Use total_minted for total supply 
  const totalSupply = parseInt(metadata.total_minted) || 0;

  // Process image with priority: IPFS metadata > valid IPFS URL > fallback to token > placeholder
  let image = '/placeholder.svg';
  if (ipfsMetadata?.coverImage) {
    image = processIPFSHashToUrl(ipfsMetadata.coverImage as string, '/placeholder.svg');
  } else if (ipfsMetadata?.image) {
    image = processIPFSHashToUrl(ipfsMetadata.image as string, '/placeholder.svg');
  } else if (isValidIPFS && baseUri) {
    image = baseUri;
  }

  // FALLBACK: If image is still placeholder but tokens have been minted, try to get image from first token
  if (image === '/placeholder.svg' && totalSupply > 0 && nftAddress && provider) {
    try {
      const nftContract = new Contract({ abi: COLLECTION_NFT_ABI as Abi, address: nftAddress, providerOrAccount: provider });
      
      // We try to get token_uri for token #1 (common first token ID)
      // or try to get token_by_index(0) if it's Enumerable.
      // Based on my research, token ID 1 or token_by_index(0) are good bets.
      let tokenUriBA;
      try {
          // Try token_uri(1) first as it's most common
          tokenUriBA = await nftContract.call("token_uri", ["1", "0"]);
      } catch (e) {
          try {
              // Try token_by_index(0) then token_uri
              const tokenId: any = await nftContract.call("token_by_index", ["0", "0"]);
              tokenUriBA = await nftContract.call("token_uri", [tokenId]);
          } catch (e2) {}
      }

      if (tokenUriBA) {
          const tokenUri = decodeByteArray(tokenUriBA as any);
          if (tokenUri) {
              const cid = tokenUri.replace('ipfs://', '').replace(/^ipfs\//, '').replace('https://ipfs.io/ipfs/', '').replace('https://gateway.pinata.cloud/ipfs/', '');
              if (cid && cid.length >= 32) {
                  const tokenMetadata = await fetchIPFSMetadata(cid);
                  if (tokenMetadata?.image) {
                      image = processIPFSHashToUrl(tokenMetadata.image as string, '/placeholder.svg');
                  }
              }
          }
      }
    } catch (err) {
      console.warn(`Failed to fetch fallback image for collection ${id}:`, err);
    }
  }

  // Additional check: if the IPFS metadata itself has "undefined/" prefix, handle it
  if (ipfsMetadata && typeof ipfsMetadata === 'object') {
    // Check if any field in the metadata has "undefined/" prefix
    Object.keys(ipfsMetadata).forEach(key => {
      const value = ipfsMetadata[key];
      if (typeof value === 'string' && value.startsWith('undefined/')) {
        const cid = value.replace('undefined/', '');
        if (cid.match(/^[a-zA-Z0-9]{34,}$/)) {
          ipfsMetadata[key] = `${IPFS_URL}/ipfs/${cid}`;
        }
      }
    });
  }

  // Create the collection object
  const collection: Collection = {
    id: id,
    name: cleanName || 'MIP Collection',
    description: ipfsMetadata?.description || 'Programmable Intellectual Property Collection',
    image: image,
    nftAddress: nftAddress,

    owner: metadata.owner && metadata.owner !== "0" && metadata.owner !== "0x0" ? `0x${BigInt(metadata.owner).toString(16)}` : "",

    isActive: metadata.is_active,
    totalMinted: parseInt(metadata.total_minted) || 0,
    totalBurned: parseInt(metadata.total_burned) || 0,
    totalTransfers: parseInt(metadata.total_transfers) || 0,
    lastMintTime: metadata.last_mint_time,
    lastBurnTime: metadata.last_burn_time,
    lastTransferTime: metadata.last_transfer_time,
    itemCount: (parseInt(metadata.total_minted) || 0) - (parseInt(metadata.total_burned) || 0),
    totalSupply: totalSupply,
    baseUri: baseUri,
    symbol: metadata.symbol,
    type: typeof ipfsMetadata?.type === 'string' ? ipfsMetadata.type : undefined,
    visibility: typeof ipfsMetadata?.visibility === 'string' ? ipfsMetadata.visibility : undefined,
    enableVersioning: typeof ipfsMetadata?.enableVersioning === 'boolean' ? ipfsMetadata.enableVersioning : undefined,
    allowComments: typeof ipfsMetadata?.allowComments === 'boolean' ? ipfsMetadata.allowComments : undefined,
    requireApproval: typeof ipfsMetadata?.requireApproval === 'boolean' ? ipfsMetadata.requireApproval : undefined,
  };

  // Validate and normalize the collection
  const validatedCollection = CollectionValidator.validateAndNormalize(collection);
  if (!validatedCollection) {
    // Return a minimal valid collection as fallback
    return {
      id: id,
      name: 'Invalid Collection',
      description: 'This collection has invalid data',
      image: '/placeholder.svg',
      nftAddress: '',
      owner: '',
      isActive: false,
      totalMinted: 0,
      totalBurned: 0,
      totalTransfers: 0,
      lastMintTime: '',
      lastBurnTime: '',
      lastTransferTime: '',
      itemCount: 0,
      totalSupply: 0,
      baseUri: '',
    };
  }

  return validatedCollection;
}

export function useCollection(): UseCollectionReturn {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const { contract } = useCollectionContract();

  const { sendAsync: createCollectionSend } = useSendTransaction({
    calls: [],
  });

  const mutation = useMutation({
    mutationFn: async (formData: ICreateCollection) => {
      if (!address) throw new Error("Wallet not connected");
      if (!contract) throw new Error("Contract not available");
      if (!formData.name || formData.name.trim() === "") throw new Error("Collection name is required");
      if (!formData.base_uri || formData.base_uri.trim() === "") throw new Error("Base URI is required");

      const cleanSymbol = (formData.symbol || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const symbol = cleanSymbol || "COLL";

      const contractCall = contract.populate("create_collection", [
        formData.name,
        symbol,
        formData.base_uri,
      ]);

      const response = await createCollectionSend([contractCall]);
      return response.transaction_hash;
    },
    onSuccess: () => {
      // Invalidate collections to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    }
  });

  return {
    createCollection: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error ? mutation.error.message : null,
  };
}

interface UseGetAllCollectionsReturn {
  collections: Collection[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useGetAllCollections(): UseGetAllCollectionsReturn {
  const { contract } = useCollectionContract();
  const { provider } = useProvider();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["collections", "all"],
    queryFn: async () => {
      if (!contract) throw new Error("Contract not ready");

      const maxId = await findMaxCollectionId(contract);
      if (maxId < 0) return [];

      const allIds = Array.from({ length: maxId + 1 }, (_, i) => i);
      const BATCH_SIZE = 50;
      const validIds: number[] = [];

      for (let i = 0; i < allIds.length; i += BATCH_SIZE) {
        const batch = allIds.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(
          batch.map(id => contract!.call("is_valid_collection", [id.toString()]).catch(() => false))
        );
        results.forEach((isValid, index) => {
          if (isValid) validIds.push(batch[index]);
        });
      }

      const collectionsData = await Promise.all(
        validIds.map(async (id) => {
          try {
            const collection = await contract!.call("get_collection", [id.toString()]);
            const collectionStat = await contract!.call("get_collection_stats", [id.toString()]);
            const metadata = { id: id.toString(), ...collection, ...collectionStat } as CollectionMetadata;
            return await processCollectionMetadata(id.toString(), metadata, provider);
          } catch (e) {
            return null;
          }
        })
      );

      return collectionsData
        .filter(c => c !== null)
        .filter(c => !isCollectionReported(c!.nftAddress)) as Collection[];
    },
    enabled: !!contract,
    staleTime: 60000,
  });

  return {
    collections: data || [],
    loading: isLoading,
    error: error ? error.message : null,
    reload: () => refetch()
  };
}

interface UseGetCollectionReturn {
  fetchCollection: (id: string) => Promise<Collection>;
}

export function useGetCollection(): UseGetCollectionReturn {
  const { contract } = useCollectionContract();
  const { provider } = useProvider();

  const fetchCollection = useCallback(
    async (id: string): Promise<Collection> => {
      if (!contract) throw new Error("Contract not ready");

      try {
        // Get collection data
        const collection = await contract.call("get_collection", [String(id)]);
        const collectionStat = await contract.call("get_collection_stats", [String(id)]);
        const metadata = { id, ...collection, ...collectionStat } as CollectionMetadata;

        return await processCollectionMetadata(id, metadata, provider);

      } catch (error) {
        console.error(`Error fetching collection ${id}:`, error);
        throw error;
      }
    },
    [contract]
  );

  return { fetchCollection };
}

interface UseGetCollectionsReturn {
  collections: Collection[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useGetCollections(walletAddress?: `0x${string}`): UseGetCollectionsReturn {
  const { contract } = useCollectionContract();

  const { fetchCollection } = useGetCollection();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["collections", "user", walletAddress],
    queryFn: async () => {
      if (!contract || !walletAddress) throw new Error("Contract or wallet not ready");

      const ids: string[] = await contract.call(
        "list_user_collections",
        [walletAddress],
        { parseRequest: true, parseResponse: true }
      );

      const results = await fetchWithRateLimit(
        ids.map((id) => () => fetchCollection(id)),
        700
      );

      return results.filter(c => !isCollectionReported(c.nftAddress));
    },
    enabled: !!contract && !!walletAddress,
    staleTime: 60000,
  });

  return {
    collections: data || [],
    loading: isLoading,
    error: error ? error.message : null,
    reload: () => refetch()
  };
}

export function useIsCollectionOwner() {
  const { contract } = useCollectionContract();

  const checkOwnership = useCallback(
    async (collectionId: string, owner: string): Promise<boolean> => {
      if (!contract) throw new Error("Contract not available");

      return await contract.call("is_collection_owner", [collectionId, owner]);
    },
    [contract]
  );

  return { checkOwnership };
}

export interface UsePaginatedCollectionsReturn {
  collections: Collection[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  reload: () => void;
}

export function usePaginatedCollections(pageSize: number = 12): UsePaginatedCollectionsReturn {
  const { contract } = useCollectionContract();
  const { provider } = useProvider();

  const fetchBatch = async (startId: number, count: number) => {
    if (!contract) return { data: [], nextStartId: startId };

    const newCollections: Collection[] = [];
    let currentId = startId;
    const SCAN_WINDOW = 50;
    const MAX_TOTAL_SCAN = 500;
    let totalScanned = 0;

    while (newCollections.length < count && currentId >= 0 && totalScanned < MAX_TOTAL_SCAN) {
      const batchSize = Math.min(SCAN_WINDOW, currentId + 1);
      const batchIds = Array.from({ length: batchSize }, (_, i) => currentId - i);

      try {
        const validityResults = await Promise.all(
          batchIds.map(id =>
            contract!.call("is_valid_collection", [id.toString()])
              .then(valid => ({ id, valid }))
              .catch(() => ({ id, valid: false }))
          )
        );

        const validIds = validityResults.filter(r => r.valid).map(r => r.id);

        if (validIds.length > 0) {
          const details = await Promise.all(
            validIds.map(async (id) => {
              try {
                const collection = await contract!.call("get_collection", [id.toString()]);
                const collectionStat = await contract!.call("get_collection_stats", [id.toString()]);
                const metadata = { id: id.toString(), ...collection, ...collectionStat } as CollectionMetadata;
                return await processCollectionMetadata(id.toString(), metadata, provider);
              } catch (e) {
                return null;
              }
            })
          );

          const validDetails = details.filter(c => c !== null) as Collection[];
          newCollections.push(...validDetails.filter(c => !isCollectionReported(c.nftAddress)));
        }
      } catch (e) {
        console.warn("Error scanning batch:", e);
      }

      currentId -= batchSize;
      totalScanned += batchSize;
    }
    return { data: newCollections, nextStartId: currentId };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    error,
    refetch,
    isInitialLoading,
  } = useInfiniteQuery({
    queryKey: ["collections", "paginated", pageSize],
    queryFn: async ({ pageParam }) => {
      if (!contract) throw new Error("Contract not ready");

      // For the first page, we dynamically find the maximum collection ID.
      let startId = pageParam;
      if (startId === null) {
        startId = await findMaxCollectionId(contract);
      }

      if (startId < 0) {
        // No collections exist at all
        return { data: [], nextStartId: -1 };
      }

      return await fetchBatch(startId, pageSize);
    },
    initialPageParam: null as number | null,
    getNextPageParam: (lastPage) => {
      // If we went below 0, there are no more IDs to scan
      if (lastPage.nextStartId < 0) return undefined;
      return lastPage.nextStartId;
    },
    enabled: !!contract,
    staleTime: 60000,
  });

  const collections = data ? data.pages.flatMap((page) => page.data) : [];

  return {
    collections,
    loading: isInitialLoading,
    loadingMore: isFetchingNextPage,
    error: error ? error.message : null,
    hasMore: !!hasNextPage,
    loadMore: async () => { await fetchNextPage(); },
    reload: () => refetch(),
  };
}


export function useFeaturedCollections(featuredIds: number[] = []): UseGetAllCollectionsReturn {
  const { contract } = useCollectionContract();
  const { provider } = useProvider();

  const idsKey = featuredIds.join(',');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["collections", "featured", idsKey],
    queryFn: async () => {
      if (!contract) throw new Error("Contract not ready");

      const promises = featuredIds.map(async (id) => {
        try {
          const isValid = await contract.call("is_valid_collection", [id.toString()]);
          if (isValid) {
            const collection = await contract.call("get_collection", [id.toString()]);
            const collectionStat = await contract.call("get_collection_stats", [id.toString()]);
            const metadata = { id, ...collection, ...collectionStat } as CollectionMetadata;
            return await processCollectionMetadata(id.toString(), metadata, provider);
          }
        } catch (e) {
          console.warn(`Error fetching featured collection ${id}`, e);
        }
        return null;
      });

      const results = await Promise.all(promises);
      return results
        .filter((c): c is Collection => c !== null)
        .filter(c => !isCollectionReported(c.nftAddress));
    },
    enabled: !!contract && featuredIds.length > 0,
    staleTime: 60000,
  });

  return {
    collections: data || [],
    loading: isLoading,
    error: error ? error.message : null,
    reload: () => refetch()
  };
}


