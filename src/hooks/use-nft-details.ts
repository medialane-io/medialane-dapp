import { useReadContract } from "@starknet-react/core";
import { Abi } from "starknet";
import { COLLECTION_721_CONTRACT } from "@/lib/constants";
import { useEffect, useState } from "react";
import { NFTMetadata } from "@/lib/types";
import { abi } from "@/abis/abi";

export interface NFTData {
  title: string;
  description: string;
  nftId: string;
  symbol: string;
  tokenId: string;
  tokenURI: string;
  owner: string;
  tokenStandard: string;
  collection: string;
  creator: string;
  imageUrl: string;
  blockchain: string;
  contractAddress: string;
  ipfsUrl: string;
  externalUrl: string;
}

export function useNFTDetails(tokenId: number) {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);

  // Read basic NFT information (name, symbol)
  const { data: nftSymbol } = useReadContract({
    abi: abi as Abi,
    functionName: "symbol",
    address: COLLECTION_721_CONTRACT,
    args: [],
  });

  // Read token name
  const { data: nftName } = useReadContract({
    abi: abi as Abi,
    functionName: "name",
    address: COLLECTION_721_CONTRACT,
    args: [],
  });

  // Read token URI for metadata
  const { data: tokenURI } = useReadContract({
    abi: abi as Abi,
    functionName: "tokenURI",
    address: COLLECTION_721_CONTRACT,
    args: [tokenId],
  });

  // Read token owner
  const { data: tokenOwner } = useReadContract({
    abi: abi as Abi,
    functionName: "ownerOf",
    address: COLLECTION_721_CONTRACT,
    args: [tokenId],
  });

  // Fetch metadata when tokenURI changes
  useEffect(() => {
    const fetchMetadata = async () => {
      if (tokenURI) {
        try {
          const response = await fetch(tokenURI);
          const data = await response.json();
          setMetadata(data);
        } catch (error) {
          console.error('Error fetching metadata:', error);
        }
      }
    };

    fetchMetadata();
  }, [tokenURI]);

  const nftData: NFTData = {
    title: metadata?.name || nftName || "Untitled",
    description: metadata?.description || "",
    nftId: "NFT #" + tokenId,
    symbol: nftSymbol || "MIP",
    tokenId: tokenId.toString(),
    tokenURI: tokenURI || "",
    owner: tokenOwner || "",
    tokenStandard: "ERC721",
    collection: nftName || "Collection",
    creator: (metadata?.author || tokenOwner || "Unknown").toString(),
    imageUrl: metadata?.image || "/background.jpg",
    blockchain: "Starknet",
    contractAddress: COLLECTION_721_CONTRACT || "",
    ipfsUrl: tokenURI || "",
    externalUrl: metadata?.externalUrl || ""
  };

  return {
    nftData,
    isLoading: !nftSymbol || !nftName || !tokenURI || !tokenOwner,
  };
} 