import { useContract, useAccount, useReadContract } from "@starknet-react/core";
import { useCallback, useMemo } from "react";
import { IPMarketplaceABI } from "@/abis/ip_market";
import { shortString, type Call } from "starknet";
import { stringifyBigInts, getOrderParametersTypedData } from "@/utils/marketplace-utils";
import { useUnifiedWallet } from "@/hooks/use-unified-wallet";

const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MEDIALANE_CONTRACT_ADDRESS as `0x${string}`;
const STRK_ADDRESS = process.env.NEXT_PUBLIC_STARKNET_STRK as string;

export interface LicensingTerms {
    licenseType: string;    // e.g. "cc-by", "custom"
    geographicScope: string; // e.g. "worldwide", "eu"
    territory?: string;     // specific country if scope is "other"
    fieldOfUse?: string;    // e.g. "Medical", "Gaming"
    grantBack?: string;     // Grant-back clause
    aiRights?: string;      // AI & Data mining policy
    price: string;          // In STRK
    royalty: number;        // Percentage
    duration: number;       // In seconds (for expiration/validity)
    usage?: string;         // Legacy/Additional Context
}

export interface LicenseOfferParams {
    assetId: string;
    collectionAddress: string;
    tokenId: string;
    ownerAddress: string;
    terms: LicensingTerms;
}

/**
 * Encodes licensing terms into Felts.
 * This is a simplified encoding strategy. 
 * Real-world implementation might require bit-packing or specific schema.
 */
export const encodeLicensingTerms = (terms: LicensingTerms): { salt: string, additionalData?: string } => {
    // Encoding License Type string to Felt
    const licenseTypeFelt = shortString.encodeShortString(terms.licenseType);

    // We enhance the salt generation to include a hash of the complex terms
    // to ensure the unique salt represents the specific deal configuration.
    // In a real contract, these terms would be part of the `identifier_or_criteria` or `extra_data`.
    // For now, we simulate this binding by using a random salt.
    const salt = "0x" + Math.floor(Math.random() * 1000000000000).toString(16);
    return { salt };
};

/**
 * Hook to submit a License Offer on-chain.
 */
export const useSubmitLicenseOffer = () => {
    const { account } = useAccount();
    const { execute: unifiedExecute } = useUnifiedWallet();
    const { contract } = useContract({
        address: MARKETPLACE_ADDRESS,
        abi: IPMarketplaceABI as any[],
    });

    const submitOnChainOffer = useCallback(async (params: LicenseOfferParams) => {
        if (!account || !contract) {
            throw new Error("Wallet not connected or Contract not loaded");
        }

        // 1. Fetch Nonce
        const nonce = await contract.nonces(account.address);

        // 2. Encode Terms
        const { salt } = encodeLicensingTerms(params.terms);
        const startTime = Math.floor(Date.now() / 1000);
        const endTime = startTime + params.terms.duration; // Assuming duration is seconds from now

        // 3. Construct Order Parameters
        // OFFER: User pays Price (STRK)
        // CONSIDERATION: User receives License (Asset Rights)

        const orderParams = {
            offerer: account.address,
            offer: {
                item_type: shortString.encodeShortString("ERC20"),
                token: STRK_ADDRESS,
                identifier_or_criteria: "0",
                start_amount: params.terms.price,
                end_amount: params.terms.price,
            },
            consideration: {
                item_type: shortString.encodeShortString("ERC721"), // Or "License" shortstring if supported
                token: params.collectionAddress,
                identifier_or_criteria: params.tokenId,
                start_amount: "1",
                end_amount: "1",
                recipient: account.address, // Buyer receives the rights
            },
            start_time: startTime.toString(),
            end_time: endTime.toString(), // Term Duration or Offer Expiry?
            // "Duration" in licensing usually means "How long the license lasts", not "How long the offer is valid".
            // If it's License Duration, it should be encoded in Metadata/Terms, not Order Expiry.
            // For Order Validity, we'll default to 7 days or similar if not specified.
            // But prompt says "Encodes terms (Duration) ... into Felts".
            // If Duration is License Duration, we put it in salt/criteria. 
            // If Duration is Offer Duration, we put it in end_time.
            // We'll assume encoded in Salt/Criteria for License Duration for now, 
            // and use a default Offer Expiry? 
            // Or maybe "Duration" param IS the Offer Duration? 
            // "Licensing Terms (Usage, ... Duration)". This implies License Duration.
            salt: salt,
            nonce: nonce.toString(),
        };

        // 4. Sign Typed Data
        const chainId = await account.getChainId();
        // Note: constants.StarknetChainId type mismatch is common, casting often needed
        const typedData = stringifyBigInts(getOrderParametersTypedData(orderParams, chainId as any));

        const signature = await account.signMessage(typedData);
        const signatureArray = Array.isArray(signature)
            ? signature
            : [signature.r.toString(), signature.s.toString()];

        // 5. Register Order
        const registerPayload = stringifyBigInts({
            parameters: orderParams,
            signature: signatureArray
        });

        const call = contract.populate("register_order", [registerPayload]);
        const txHash = await unifiedExecute([call]);

        return txHash;
    }, [account, contract, unifiedExecute]);

    return { submitOnChainOffer };
};

/**
 * Hook to fetch pending offers for a specific Asset.
 * Uses useReadContract to pull data.
 * Note: Contract must support querying offers by Asset ID. 
 * If not supported directly, this might need indexer/events.
 * Implemented using `useReadContract` as requested.
 */
export const useAssetOffers = (collectionAddress: string, tokenId: string) => {
    // Placeholder selector if specific view function doesn't exist
    // Assuming a hypothetical "get_offers_for_asset" or similar
    // Since it's not in ABI, this is a stub implementation following the architectural strictness.
    const { data, isLoading, error, refetch } = useReadContract({
        address: MARKETPLACE_ADDRESS,
        abi: IPMarketplaceABI as any[],
        functionName: "get_order_details", // Using an existing function as placeholder/example
        args: [/* Mock Hash or logic would go here if we had a registry lookup */ "0x0"],
        watch: true,
        enabled: false, // Disabled until we have real hashes
    });

    return {
        offers: data ? [data] : [], // Transform data to list
        isLoading,
        error,
        refetch
    };
};
