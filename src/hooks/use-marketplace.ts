import { useState, useCallback } from "react";
import { useAccount, useContract, useNetwork, useProvider } from "@starknet-react/core";
import { Abi, shortString, constants } from "starknet";
import { IPMarketplaceABI } from "@/abis/ip_market";
import { useToast } from "@/hooks/use-toast";
import { getOrderParametersTypedData, getOrderCancellationTypedData, getOrderFulfillmentTypedData, stringifyBigInts } from "@/utils/marketplace-utils";

interface UseMarketplaceReturn {
    createListing: (
        assetContractAddress: string,
        tokenId: string,
        price: string,
        currencySymbol: string,
        durationSeconds: number
    ) => Promise<string | undefined>;
    makeOffer: (
        assetContractAddress: string,
        tokenId: string,
        price: string,
        currencySymbol: string,
        durationSeconds: number
    ) => Promise<string | undefined>;
    checkoutCart: (items: any[]) => Promise<string | undefined>;
    cancelOrder: (orderHash: string) => Promise<string | undefined>;
    cancelListing: (orderHash: string) => Promise<string | undefined>;
    acceptOffer: (
        orderHash: string,
        nftContractAddress: string,
        tokenId: string
    ) => Promise<string | undefined>;

    isProcessing: boolean;
    isLoading: boolean; // For compatibility
    txHash: string | null;
    error: string | null;
    resetState: () => void;
}

// Module-level helpers
const getDecimals = (currencySymbol: string) =>
    currencySymbol === "USDC" || currencySymbol === "USDT" ? 6 : 18;

const toWei = (price: string, currencySymbol: string): string =>
    BigInt(Math.floor(parseFloat(price) * Math.pow(10, getDecimals(currencySymbol)))).toString();

export function useMarketplace(): UseMarketplaceReturn {
    const { account, address } = useAccount();
    const { chain } = useNetwork();
    const { toast } = useToast();
    const { provider } = useProvider();

    const [isProcessing, setIsProcessing] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { contract: medialaneContract } = useContract({
        address: process.env.NEXT_PUBLIC_MEDIALANE_CONTRACT_ADDRESS as `0x${string}`,
        abi: IPMarketplaceABI as any[],
    });

    const resetState = useCallback(() => {
        setTxHash(null);
        setError(null);
        setIsProcessing(false);
    }, []);

    // Wraps an async operation with isProcessing state and unified error handling.
    const withProcessing = useCallback(async <T>(
        fn: () => Promise<T>
    ): Promise<T | undefined> => {
        setIsProcessing(true);
        setError(null);
        try {
            return await fn();
        } catch (err: any) {
            console.error(err);
            const msg = err.message || "An unexpected error occurred";
            setError(msg);
            toast({ title: "Error", description: msg, variant: "destructive" });
            return undefined;
        } finally {
            setIsProcessing(false);
        }
    }, [toast]);

    // Builds shared timing/nonce/currency fields for an order.
    const buildBaseOrderParams = useCallback(async (
        currencySymbol: string,
        durationSeconds: number
    ) => {
        const now = Math.floor(Date.now() / 1000);
        const startTime = (now + 300).toString(); // 5-min future buffer
        const endTime = (now + durationSeconds).toString();
        const salt = Math.floor(Math.random() * 1000000).toString();

        const { SUPPORTED_TOKENS } = await import("@/lib/constants");
        const currencyAddress = SUPPORTED_TOKENS.find((t: any) => t.symbol === currencySymbol)?.address;
        if (!currencyAddress) throw new Error("Unsupported currency selected");

        const currentNonce = await medialaneContract!.nonces(account!.address);
        const nonce = currentNonce.toString();

        return { startTime, endTime, salt, currencyAddress, nonce };
    }, [account, medialaneContract]);

    // Signs the orderParams, verifies the hash against the contract, and returns a
    // populated register_order call ready to include in a multicall.
    const signAndBuildRegisterCall = useCallback(async (orderParams: any) => {
        const chainId = chain!.id as any as constants.StarknetChainId;
        const typedData = stringifyBigInts(getOrderParametersTypedData(orderParams, chainId));

        console.log("Signing typed data:", typedData);
        const signature = await account!.signMessage(typedData);
        const signatureArray = Array.isArray(signature)
            ? signature
            : [signature.r.toString(), signature.s.toString()];
        console.log("Signature generated:", signatureArray);

        const registerPayload = stringifyBigInts({
            parameters: {
                ...orderParams,
                offer: {
                    ...orderParams.offer,
                    item_type: shortString.encodeShortString(orderParams.offer.item_type),
                },
                consideration: {
                    ...orderParams.consideration,
                    item_type: shortString.encodeShortString(orderParams.consideration.item_type),
                },
            },
            signature: signatureArray,
        });

        // Hash verification
        try {
            const localHash = await account!.hashMessage(typedData);
            const contractHash = await medialaneContract!.get_order_hash(registerPayload.parameters, account!.address);
            const contractHashHex = "0x" + BigInt(contractHash).toString(16);
            if (localHash !== contractHashHex) {
                console.warn("HASH MISMATCH: Local hash does not match contract hash. Signature will likely be rejected.");
            } else {
                console.log("HASH MATCH: Local and contract hashes are consistent.");
            }
        } catch (hashErr) {
            console.warn("Could not verify hash:", hashErr);
        }

        return medialaneContract!.populate("register_order", [registerPayload]);
    }, [account, chain, medialaneContract]);

    const createListing = useCallback(async (
        assetContractAddress: string,
        tokenId: string,
        price: string,
        currencySymbol: string,
        durationSeconds: number
    ) => {
        if (!account || !medialaneContract || !chain) {
            const msg = "Account, contract, or network not available";
            setError(msg);
            toast({ title: "Error", description: msg, variant: "destructive" });
            return undefined;
        }

        return withProcessing(async () => {
            const priceWei = toWei(price, currencySymbol);
            const { startTime, endTime, salt, currencyAddress, nonce } =
                await buildBaseOrderParams(currencySymbol, durationSeconds);

            const orderParams = {
                offerer: account.address,
                offer: {
                    item_type: "ERC721",
                    token: assetContractAddress,
                    identifier_or_criteria: tokenId,
                    start_amount: "1",
                    end_amount: "1",
                },
                consideration: {
                    item_type: "ERC20",
                    token: currencyAddress,
                    identifier_or_criteria: "0",
                    start_amount: priceWei,
                    end_amount: priceWei,
                    recipient: account.address,
                },
                start_time: startTime,
                end_time: endTime,
                salt,
                nonce,
            };

            const registerCall = await signAndBuildRegisterCall(orderParams);

            const { cairo } = await import("starknet");
            const tokenIdUint256 = cairo.uint256(tokenId);

            // Avoid a redundant wallet prompt if the NFT is already approved
            let isAlreadyApproved = false;
            try {
                const isApprovedRes = await provider.callContract({
                    contractAddress: assetContractAddress,
                    entrypoint: "get_approved",
                    calldata: [tokenIdUint256.low.toString(), tokenIdUint256.high.toString()],
                });
                isAlreadyApproved =
                    BigInt(isApprovedRes[0]).toString() === BigInt(medialaneContract.address).toString();
                console.log("Is already approved for token:", isAlreadyApproved);
            } catch (err) {
                console.warn("Failed to check approval status", err);
            }

            const approveCall = {
                contractAddress: assetContractAddress,
                entrypoint: "approve",
                calldata: [medialaneContract.address, tokenIdUint256.low.toString(), tokenIdUint256.high.toString()],
            };

            const calls = isAlreadyApproved ? [registerCall] : [approveCall, registerCall];
            const tx = await account.execute(calls);
            console.log("Transaction sent:", tx.transaction_hash);

            await provider.waitForTransaction(tx.transaction_hash);
            setTxHash(tx.transaction_hash);
            toast({ title: "Listing Created", description: "Your asset has been listed successfully." });
            return tx.transaction_hash;
        });
    }, [account, medialaneContract, chain, toast, provider, withProcessing, buildBaseOrderParams, signAndBuildRegisterCall]);

    const makeOffer = useCallback(async (
        assetContractAddress: string,
        tokenId: string,
        price: string,
        currencySymbol: string,
        durationSeconds: number
    ) => {
        if (!account || !medialaneContract || !chain) {
            const msg = "Account, contract, or network not available";
            setError(msg);
            toast({ title: "Error", description: msg, variant: "destructive" });
            return undefined;
        }

        return withProcessing(async () => {
            const priceWei = toWei(price, currencySymbol);
            const { startTime, endTime, salt, currencyAddress, nonce } =
                await buildBaseOrderParams(currencySymbol, durationSeconds);

            // Inverted vs. listing: offerer sends ERC20, receives ERC721
            const orderParams = {
                offerer: account.address,
                offer: {
                    item_type: "ERC20",
                    token: currencyAddress,
                    identifier_or_criteria: "0",
                    start_amount: priceWei,
                    end_amount: priceWei,
                },
                consideration: {
                    item_type: "ERC721",
                    token: assetContractAddress,
                    identifier_or_criteria: tokenId,
                    start_amount: "1",
                    end_amount: "1",
                    recipient: account.address,
                },
                start_time: startTime,
                end_time: endTime,
                salt,
                nonce,
            };

            const registerCall = await signAndBuildRegisterCall(orderParams);

            const { cairo } = await import("starknet");
            const amountUint256 = cairo.uint256(priceWei);
            const approveCall = {
                contractAddress: currencyAddress,
                entrypoint: "approve",
                calldata: [medialaneContract.address, amountUint256.low.toString(), amountUint256.high.toString()],
            };

            // ERC20 approve + register_order as atomic multicall
            const tx = await account.execute([approveCall, registerCall]);
            console.log("Offer MultiCall sent:", tx.transaction_hash);

            await provider.waitForTransaction(tx.transaction_hash);
            setTxHash(tx.transaction_hash);
            toast({ title: "Offer Placed", description: "Your offer has been submitted and is now live." });
            return tx.transaction_hash;
        });
    }, [account, medialaneContract, chain, toast, provider, withProcessing, buildBaseOrderParams, signAndBuildRegisterCall]);

    const checkoutCart = useCallback(async (items: any[]) => {
        console.log("checkoutCart called with items:", items.length);
        console.log("checkoutCart context:", {
            hasAccount: !!account,
            hasContract: !!medialaneContract,
            hasChain: !!chain
        });

        if (!account || !medialaneContract || !chain || items.length === 0) {
            const msg = "Account, contract, network not available, or cart empty";
            console.error("checkoutCart early return:", msg);
            setError(msg);
            toast({ title: "Error", description: msg, variant: "destructive" });
            return undefined;
        }

        return withProcessing(async () => {
            console.log("checkoutCart inside withProcessing");
            // Group required ERC20 approvals by token address
            const tokenTotals = new Map<string, bigint>();
            items.forEach((item) => {
                const token = item.considerationToken;
                const amount = BigInt(item.considerationAmount);
                tokenTotals.set(token, (tokenTotals.get(token) || 0n) + amount);
            });

            const { cairo } = await import("starknet");
            const approveCalls = Array.from(tokenTotals.entries()).map(([token, totalWei]) => {
                const amountUint256 = cairo.uint256(totalWei.toString());
                return {
                    contractAddress: token,
                    entrypoint: "approve",
                    calldata: [medialaneContract.address, amountUint256.low.toString(), amountUint256.high.toString()],
                };
            });

            // Fetch base nonce; each fulfillment increments it sequentially
            const currentNonce = await medialaneContract.nonces(account.address);
            const baseNonce = BigInt(currentNonce);

            const chainId = chain.id as any as constants.StarknetChainId;
            const fulfillCalls = [];

            // Prompt one signature per item — must be sequential per SNIP-12
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const executionNonce = baseNonce + BigInt(i);

                const fulfillmentParams = {
                    order_hash: item.orderHash,
                    fulfiller: account.address,
                    nonce: executionNonce.toString(),
                };

                const typedData = stringifyBigInts(getOrderFulfillmentTypedData(fulfillmentParams, chainId));

                toast({
                    title: `Signature Required (${i + 1}/${items.length})`,
                    description: `Please sign the request for ${item.offerIdentifier}`,
                });

                const signature = await account.signMessage(typedData);
                const signatureArray = Array.isArray(signature)
                    ? signature
                    : [signature.r.toString(), signature.s.toString()];

                fulfillCalls.push(
                    medialaneContract.populate("fulfill_order", [{
                        fulfillment: fulfillmentParams,
                        signature: signatureArray,
                    }])
                );
            }

            toast({ title: "Executing Purchase", description: "Approve the final transaction to sweep the cart." });

            // Single atomic multicall: all approvals + all fulfillments
            const tx = await account.execute([...approveCalls, ...fulfillCalls]);
            console.log("Cart checkout multicall sent:", tx.transaction_hash);

            await provider.waitForTransaction(tx.transaction_hash);
            setTxHash(tx.transaction_hash);
            toast({ title: "Purchase Successful", description: `Successfully purchased ${items.length} item(s).` });
            return tx.transaction_hash;
        });
    }, [account, medialaneContract, chain, toast, provider, withProcessing]);

    const cancelOrder = useCallback(async (orderHash: string) => {
        if (!account || !medialaneContract || !chain) {
            const msg = "Account, contract, or network not available";
            setError(msg);
            toast({ title: "Error", description: msg, variant: "destructive" });
            return undefined;
        }

        return withProcessing(async () => {
            const currentNonce = await medialaneContract.nonces(account.address);

            const cancelParams = {
                order_hash: orderHash,
                offerer: account.address,
                nonce: currentNonce.toString(),
            };

            const chainId = chain.id as any as constants.StarknetChainId;
            const typedData = stringifyBigInts(getOrderCancellationTypedData(cancelParams, chainId));

            console.log("Signing cancellation typed data:", typedData);
            const signature = await account.signMessage(typedData);
            const signatureArray = Array.isArray(signature)
                ? signature
                : [signature.r.toString(), signature.s.toString()];

            const cancelRequest = stringifyBigInts({
                cancelation: cancelParams,
                signature: signatureArray,
            });

            const call = medialaneContract.populate("cancel_order", [cancelRequest]);
            const tx = await account.execute(call);

            await provider.waitForTransaction(tx.transaction_hash);
            setTxHash(tx.transaction_hash);
            toast({ title: "Listing Cancelled", description: "The listing has been successfully cancelled on-chain." });
            return tx.transaction_hash;
        });
    }, [account, medialaneContract, chain, toast, provider, withProcessing]);

    /**
     * Asset owner accepts an incoming bid. Signs OrderFulfillment typed data,
     * approves the NFT transfer to the marketplace, then executes both calls
     * atomically so either both succeed or neither does.
     */
    const acceptOffer = useCallback(async (
        orderHash: string,
        nftContractAddress: string,
        tokenId: string
    ) => {
        if (!account || !medialaneContract || !chain) {
            const msg = "Account, contract, or network not available";
            setError(msg);
            toast({ title: "Error", description: msg, variant: "destructive" });
            return undefined;
        }

        return withProcessing(async () => {
            const currentNonce = await medialaneContract.nonces(account.address);

            const fulfillmentParams = {
                order_hash: orderHash,
                fulfiller: account.address,
                nonce: currentNonce.toString(),
            };

            const chainId = chain.id as any as constants.StarknetChainId;
            const typedData = stringifyBigInts(getOrderFulfillmentTypedData(fulfillmentParams, chainId));

            console.log("Signing offer acceptance typed data:", typedData);
            const signature = await account.signMessage(typedData);
            const signatureArray = Array.isArray(signature)
                ? signature
                : [signature.r.toString(), signature.s.toString()];

            const fulfillCall = medialaneContract.populate("fulfill_order", [{
                fulfillment: fulfillmentParams,
                signature: signatureArray,
            }]);

            // Owner must approve the NFT transfer before fulfilling
            const { cairo } = await import("starknet");
            const tokenIdUint256 = cairo.uint256(tokenId);
            const approveCall = {
                contractAddress: nftContractAddress,
                entrypoint: "approve",
                calldata: [medialaneContract.address, tokenIdUint256.low.toString(), tokenIdUint256.high.toString()],
            };

            const tx = await account.execute([approveCall, fulfillCall]);
            console.log("Accept offer transaction sent:", tx.transaction_hash);

            await provider.waitForTransaction(tx.transaction_hash);
            setTxHash(tx.transaction_hash);
            toast({ title: "Offer Accepted", description: "The offer has been accepted and the asset transferred." });
            return tx.transaction_hash;
        });
    }, [account, medialaneContract, chain, toast, provider, withProcessing]);

    return {
        createListing,
        makeOffer,
        checkoutCart,
        cancelOrder,
        cancelListing: cancelOrder,
        acceptOffer,
        isProcessing,
        isLoading: isProcessing,
        txHash,
        error,
        resetState,
    };
}
