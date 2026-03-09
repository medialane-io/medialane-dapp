import {
  useAccount,
  useContract,
  useSendTransaction,
} from "@starknet-react/core";
import { IPListingABI } from "@/abis/ip_listing";
import { Abi } from "starknet";
import { Listing } from "@/types/marketplace";

import { useUnifiedWallet } from "@/hooks/use-unified-wallet";

export interface CreateListingParams {
  assetContract: string;
  tokenId: string;
  startTime: number;
  secondsUntilEndTime: number;
  quantityToList: number;
  currencyToAccept: string;
  buyoutPricePerToken: string;
  tokenTypeOfListing: number;
}

export const useCreateIPLising = (data: CreateListingParams) => {
  const { address, account } = useAccount();
  const { execute: unifiedExecute } = useUnifiedWallet();

  // Initialize contract
  const { contract: IPListingContract } = useContract({
    address: process.env.NEXT_PUBLIC_LISTING_CONTRACT_ADDRESS as `0x${string}`,
    abi: IPListingABI as any, // fallback for tight Abi constraint issues
  });

  const createListing = async () => {
    try {
      if (!IPListingContract || !account) {
        console.error("Contract or account not available");
        return false;
      }

      console.log("Sending transaction to create listing...");

      // Format the data for the contract call
      const formattedData = [
        data.assetContract,
        BigInt(data.tokenId),
        BigInt(data.startTime),
        BigInt(data.secondsUntilEndTime),
        BigInt(data.quantityToList),
        data.currencyToAccept,
        BigInt(data.buyoutPricePerToken),
        BigInt(data.tokenTypeOfListing),
      ];

      console.log("Formatted data:", formattedData);

      // Create the transaction call directly via account.execute
      const call = IPListingContract.populate("create_listing", formattedData);

      await unifiedExecute([call]);
      return true;
    } catch (error) {
      console.error("Error creating listing:", error);
      return false;
    }
  };

  return {
    createListing,
    createListingError: null,
  };
};

export const useUpdateIPMarketplaceAddress = (newAddress: string) => {
  const { address, account } = useAccount();

  console.log("address", address);

  // Initialize contract
  const { contract: IPListingContract } = useContract({
    address: process.env.NEXT_PUBLIC_LISTING_CONTRACT_ADDRESS as `0x${string}`,
    abi: IPListingABI as any,
  });

  const { execute: unifiedExecute } = useUnifiedWallet();

  // Updating marketplace address
  const updateAddress = async () => {
    console.log("creating listing...");

    try {
      if (IPListingContract && account) {
        const call = IPListingContract.populate("update_ip_marketplace_address", [newAddress]);
        await unifiedExecute([call]);
      }
    } catch (error) {
      console.log("mint error", error);
    }
  };

  return {
    updateAddress,
    createListingError: null,
  };
};
// 0x03ea0f81ff87b75f465e186ec1f8440409e2d835b3f42b6d3e2baa4b4cc89e4a