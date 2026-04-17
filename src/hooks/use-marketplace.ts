import { useState, useCallback } from "react";
import { useAccount, useContract, useNetwork, useProvider } from "@starknet-react/core";
import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import { Abi, shortString, constants } from "starknet";
import { IPMarketplaceABI } from "@/abis/ip_market";
import { useToast } from "@/hooks/use-toast";
import { getOrderParametersTypedData, getOrderCancellationTypedData, getOrderFulfillmentTypedData, stringifyBigInts } from "@/utils/marketplace-utils";
import { executeSponsoredTransaction, canSponsor } from "@/utils/paymaster";

interface UseMarketplaceReturn {
    createListing: (
        assetContractAddress: string,
        tokenId: string,
        price: string,
        currencySymbol: string,
        durationSeconds: number,
        tokenStandard?: string
    ) => Promise<string | undefined>;
    makeOffer: (
        assetContractAddress: string,
        tokenId: string,
        price: string,
        currencySymbol: string,
        durationSeconds: number,
        tokenStandard?: string
    ) => Promise<string | undefined>;
    checkoutCart: (items: any[]) => Promise<string | undefined>;
    cancelOrder: (orderHash: string, tokenStandard?: string) => Promise<string | undefined>;
    cancelListing: (orderHash: string, tokenStandard?: string) => Promise<string | undefined>;
    acceptOffer: (
        orderHash: string,
        nftContractAddress: string,
        tokenId: string,
        tokenStandard?: string
    ) => Promise<string | undefined>;

    isProcessing: boolean;
    isLoading: boolean; // For compatibility
    txHash: string | null;
    error: string | null;
    resetState: () => void;
}

// Module-level helpers
import { SUPPORTED_TOKENS, MARKETPLACE_CONTRACT, MARKETPLACE_1155_CONTRACT } from "@/lib/constants";
const getDecimals = (currencySymbol: string) =>
    SUPPORTED_TOKENS.find((t) => t.symbol === currencySymbol)?.decimals ?? 18;

const toWei = (price: string, currencySymbol: string): string =>
    BigInt(Math.floor(parseFloat(price) * Math.pow(10, getDecimals(currencySymbol)))).toString();

export function useMarketplace(): UseMarketplaceReturn {
    const { account } = useAccount();
    const { chain } = useNetwork();
    const { toast } = useToast();
    const { provider } = useProvider();

    const [isProcessing, setIsProcessing] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { contract: medialaneContract } = useContract({
        address: MARKETPLACE_CONTRACT,
        abi: IPMarketplaceABI as any[],
    });
    const { contract: medialane1155Contract } = useContract({
        address: MARKETPLACE_1155_CONTRACT,
        abi: IPMarketplaceABI as any[],
    });
    const { address: walletAddress, walletType } = useUnifiedWallet();

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
            console.error("[marketplace] error:", JSON.stringify(err, null, 2), err);
            const msg = err?.message || (err?.code ? `Wallet error ${err.code}` : "An unexpected error occurred");
            setError(msg);
            toast({ title: "Error", description: msg, variant: "destructive" });
            return undefined;
        } finally {
            setIsProcessing(false);
        }
    }, [toast]);

    // Executes calls with AVNU-sponsored gas; falls back to direct account.execute() on failure.
    const executeWithSponsor = useCallback(async (calls: any[]): Promise<string> => {
        if (canSponsor()) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sponsored = await executeSponsoredTransaction(account as any, calls);
            if (sponsored.success) return sponsored.transactionHash;
            console.warn("[marketplace] Sponsored tx rejected, using direct wallet:", sponsored.error);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tx = await account!.execute(calls as any);
        return tx.transaction_hash;
    }, [account]);

    // Builds shared timing/nonce/currency fields for an order.
    const buildBaseOrderParams = useCallback(async (
        currencySymbol: string,
        durationSeconds: number,
        contract: NonNullable<typeof medialaneContract>
    ) => {
        const now = Math.floor(Date.now() / 1000);
        const startTime = (now + 300).toString(); // 5-min future buffer
        const endTime = (now + durationSeconds).toString();
        const salt = Math.floor(Math.random() * 1000000).toString();

        const { SUPPORTED_TOKENS } = await import("@/lib/constants");
        const currencyAddress = SUPPORTED_TOKENS.find((t: any) => t.symbol === currencySymbol)?.address;
        if (!currencyAddress) throw new Error("Unsupported currency selected");

        const currentNonce = await contract.nonces(walletAddress!);
        const nonce = currentNonce.toString();

        return { startTime, endTime, salt, currencyAddress, nonce };
    }, [walletAddress]);

    // Signs the orderParams, verifies the hash against the contract, and returns a
    // populated register_order call ready to include in a multicall.
    const signAndBuildRegisterCall = useCallback(async (
        orderParams: any,
        contract: NonNullable<typeof medialaneContract>
    ) => {
        const chainId = chain!.id as any as constants.StarknetChainId;
        const typedData = stringifyBigInts(getOrderParametersTypedData(orderParams, chainId));

        const signature = await account!.signMessage(typedData);
        const signatureArray = Array.isArray(signature)
            ? signature
            : [signature.r.toString(), signature.s.toString()];

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
            const contractHash = await contract.get_order_hash(registerPayload.parameters, walletAddress!);
            const contractHashHex = "0x" + BigInt(contractHash).toString(16);
            if (localHash !== contractHashHex) {
                console.warn("[marketplace] Hash mismatch — signature may be rejected by contract");
            }
        } catch (hashErr) {
            console.warn("Could not verify hash:", hashErr);
        }

        return contract.populate("register_order", [registerPayload]);
    }, [account, chain, walletAddress]);

    const createListing = useCallback(async (
        assetContractAddress: string,
        tokenId: string,
        price: string,
        currencySymbol: string,
        durationSeconds: number,
        tokenStandard?: string
    ) => {
        const is1155 = tokenStandard === "ERC1155";
        const contract = is1155 ? medialane1155Contract : medialaneContract;

        if (!walletAddress || !contract || !chain) {
            const msg = "Account, contract, or network not available";
            setError(msg);
            toast({ title: "Error", description: msg, variant: "destructive" });
            return undefined;
        }
        if (!account) {
            const msg = "Marketplace listing requires Argent X or Braavos wallet";
            setError(msg);
            toast({ title: "Error", description: msg, variant: "destructive" });
            return undefined;
        }

        return withProcessing(async () => {
            const priceWei = toWei(price, currencySymbol);
            const { startTime, endTime, salt, currencyAddress, nonce } =
                await buildBaseOrderParams(currencySymbol, durationSeconds, contract);

            const orderParams = {
                offerer: walletAddress,
                offer: {
                    item_type: is1155 ? "ERC1155" : "ERC721",
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
                    recipient: walletAddress,
                },
                start_time: startTime,
                end_time: endTime,
                salt,
                nonce,
            };

            const registerCall = await signAndBuildRegisterCall(orderParams, contract);

            const { cairo } = await import("starknet");
            let approveCall: any;
            let isAlreadyApproved = false;

            if (is1155) {
                try {
                    const res = await provider.callContract({
                        contractAddress: assetContractAddress,
                        entrypoint: "is_approved_for_all",
                        calldata: [walletAddress!, contract.address],
                    });
                    isAlreadyApproved = BigInt(res[0]) !== 0n;
                } catch (err) {
                    console.warn("Failed to check ERC1155 approval status", err);
                }
                approveCall = {
                    contractAddress: assetContractAddress,
                    entrypoint: "set_approval_for_all",
                    calldata: [contract.address, "1"],
                };
            } else {
                const tokenIdUint256 = cairo.uint256(tokenId);
                try {
                    const res = await provider.callContract({
                        contractAddress: assetContractAddress,
                        entrypoint: "get_approved",
                        calldata: [tokenIdUint256.low.toString(), tokenIdUint256.high.toString()],
                    });
                    isAlreadyApproved =
                        BigInt(res[0]).toString() === BigInt(contract.address).toString();
                } catch (err) {
                    console.warn("Failed to check ERC721 approval status", err);
                }
                approveCall = {
                    contractAddress: assetContractAddress,
                    entrypoint: "approve",
                    calldata: [contract.address, tokenIdUint256.low.toString(), tokenIdUint256.high.toString()],
                };
            }

            const calls = isAlreadyApproved ? [registerCall] : [approveCall, registerCall];
            const hash = await executeWithSponsor(calls);
            setTxHash(hash);
            const receipt = await provider.waitForTransaction(hash);
            if ((receipt as any).execution_status === "REVERTED") {
                throw new Error((receipt as any).revert_reason || "Transaction reverted on-chain. Check the explorer for details.");
            }
            toast({ title: "Listing Created", description: "Your asset has been listed successfully." });
            return hash;
        });
    }, [account, walletAddress, medialaneContract, medialane1155Contract, chain, toast, provider, withProcessing, buildBaseOrderParams, signAndBuildRegisterCall, executeWithSponsor]);

    const makeOffer = useCallback(async (
        assetContractAddress: string,
        tokenId: string,
        price: string,
        currencySymbol: string,
        durationSeconds: number,
        tokenStandard?: string
    ) => {
        const is1155 = tokenStandard === "ERC1155";
        const contract = is1155 ? medialane1155Contract : medialaneContract;

        if (!walletAddress || !contract || !chain) {
            const msg = "Account, contract, or network not available";
            setError(msg);
            toast({ title: "Error", description: msg, variant: "destructive" });
            return undefined;
        }
        if (!account) {
            const msg = "Making offers requires Argent X or Braavos wallet";
            setError(msg);
            toast({ title: "Error", description: msg, variant: "destructive" });
            return undefined;
        }

        return withProcessing(async () => {
            const priceWei = toWei(price, currencySymbol);
            const { startTime, endTime, salt, currencyAddress, nonce } =
                await buildBaseOrderParams(currencySymbol, durationSeconds, contract);

            // Inverted vs. listing: offerer sends ERC20, receives the NFT
            const orderParams = {
                offerer: walletAddress,
                offer: {
                    item_type: "ERC20",
                    token: currencyAddress,
                    identifier_or_criteria: "0",
                    start_amount: priceWei,
                    end_amount: priceWei,
                },
                consideration: {
                    item_type: is1155 ? "ERC1155" : "ERC721",
                    token: assetContractAddress,
                    identifier_or_criteria: tokenId,
                    start_amount: "1",
                    end_amount: "1",
                    recipient: walletAddress,
                },
                start_time: startTime,
                end_time: endTime,
                salt,
                nonce,
            };

            const registerCall = await signAndBuildRegisterCall(orderParams, contract);

            const { cairo } = await import("starknet");
            const amountUint256 = cairo.uint256(priceWei);
            const approveCall = {
                contractAddress: currencyAddress,
                entrypoint: "approve",
                calldata: [contract.address, amountUint256.low.toString(), amountUint256.high.toString()],
            };

            // ERC20 approve + register_order as atomic multicall
            const hash = await executeWithSponsor([approveCall, registerCall]);
            setTxHash(hash);
            const receipt = await provider.waitForTransaction(hash);
            if ((receipt as any).execution_status === "REVERTED") {
                throw new Error((receipt as any).revert_reason || "Transaction reverted on-chain. Check the explorer for details.");
            }
            toast({ title: "Offer Placed", description: "Your offer has been submitted and is now live." });
            return hash;
        });
    }, [account, walletAddress, medialaneContract, medialane1155Contract, chain, toast, provider, withProcessing, buildBaseOrderParams, signAndBuildRegisterCall, executeWithSponsor]);

    const checkoutCart = useCallback(async (items: any[]) => {
        if (!walletAddress || !medialaneContract || !chain || items.length === 0) {
            const msg = "Account, contract, network not available, or cart empty";
            setError(msg);
            toast({ title: "Error", description: msg, variant: "destructive" });
            return undefined;
        }
        if (!account) {
            const msg = "Checkout requires Argent X or Braavos wallet";
            setError(msg);
            toast({ title: "Error", description: msg, variant: "destructive" });
            return undefined;
        }

        return withProcessing(async () => {
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
            const currentNonce = await medialaneContract.nonces(walletAddress);
            const baseNonce = BigInt(currentNonce);

            const chainId = chain.id as any as constants.StarknetChainId;
            const fulfillCalls = [];

            // Prompt one signature per item — must be sequential per SNIP-12
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const executionNonce = baseNonce + BigInt(i);

                const fulfillmentParams = {
                    order_hash: item.orderHash,
                    fulfiller: walletAddress,
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
            const hash = await executeWithSponsor([...approveCalls, ...fulfillCalls]);
            setTxHash(hash);
            const receipt = await provider.waitForTransaction(hash);
            if ((receipt as any).execution_status === "REVERTED") {
                throw new Error((receipt as any).revert_reason || "Transaction reverted on-chain. Check the explorer for details.");
            }
            toast({ title: "Purchase Successful", description: `Successfully purchased ${items.length} item(s).` });
            return hash;
        });
    }, [account, walletAddress, medialaneContract, chain, toast, provider, withProcessing, executeWithSponsor]);

    const cancelOrder = useCallback(async (orderHash: string, tokenStandard?: string) => {
        const is1155 = tokenStandard === "ERC1155";
        const contract = is1155 ? medialane1155Contract : medialaneContract;

        if (!walletAddress || !contract || !chain) {
            const msg = "Account, contract, or network not available";
            setError(msg);
            toast({ title: "Error", description: msg, variant: "destructive" });
            return undefined;
        }
        if (!account) {
            const msg = "Cancelling orders requires Argent X or Braavos wallet";
            setError(msg);
            toast({ title: "Error", description: msg, variant: "destructive" });
            return undefined;
        }

        return withProcessing(async () => {
            const currentNonce = await contract.nonces(walletAddress);

            const cancelParams = {
                order_hash: orderHash,
                offerer: walletAddress,
                nonce: currentNonce.toString(),
            };

            const chainId = chain.id as any as constants.StarknetChainId;
            const typedData = stringifyBigInts(getOrderCancellationTypedData(cancelParams, chainId));

            const signature = await account.signMessage(typedData);
            const signatureArray = Array.isArray(signature)
                ? signature
                : [signature.r.toString(), signature.s.toString()];

            const cancelRequest = stringifyBigInts({
                cancelation: cancelParams,
                signature: signatureArray,
            });

            const call = contract.populate("cancel_order", [cancelRequest]);
            const hash = await executeWithSponsor([call]);
            setTxHash(hash);
            const receipt = await provider.waitForTransaction(hash);
            if ((receipt as any).execution_status === "REVERTED") {
                throw new Error((receipt as any).revert_reason || "Transaction reverted on-chain. Check the explorer for details.");
            }
            toast({ title: "Listing Cancelled", description: "The listing has been successfully cancelled on-chain." });
            return hash;
        });
    }, [account, walletAddress, medialaneContract, medialane1155Contract, chain, toast, provider, withProcessing, executeWithSponsor]);

    /**
     * Asset owner accepts an incoming bid. Signs OrderFulfillment typed data,
     * approves the NFT transfer to the marketplace, then executes both calls
     * atomically so either both succeed or neither does.
     */
    const acceptOffer = useCallback(async (
        orderHash: string,
        nftContractAddress: string,
        tokenId: string,
        tokenStandard?: string
    ) => {
        const is1155 = tokenStandard === "ERC1155";
        const contract = is1155 ? medialane1155Contract : medialaneContract;

        if (!walletAddress || !contract || !chain) {
            const msg = "Account, contract, or network not available";
            setError(msg);
            toast({ title: "Error", description: msg, variant: "destructive" });
            return undefined;
        }
        if (!account) {
            const msg = "Accepting offers requires Argent X or Braavos wallet";
            setError(msg);
            toast({ title: "Error", description: msg, variant: "destructive" });
            return undefined;
        }

        return withProcessing(async () => {
            const currentNonce = await contract.nonces(walletAddress);

            const fulfillmentParams = {
                order_hash: orderHash,
                fulfiller: walletAddress,
                nonce: currentNonce.toString(),
            };

            const chainId = chain.id as any as constants.StarknetChainId;
            const typedData = stringifyBigInts(getOrderFulfillmentTypedData(fulfillmentParams, chainId));

            const signature = await account.signMessage(typedData);
            const signatureArray = Array.isArray(signature)
                ? signature
                : [signature.r.toString(), signature.s.toString()];

            const fulfillCall = contract.populate("fulfill_order", [{
                fulfillment: fulfillmentParams,
                signature: signatureArray,
            }]);

            // Owner must approve the NFT transfer before fulfilling
            const { cairo } = await import("starknet");
            let approveCall: any;
            if (is1155) {
                approveCall = {
                    contractAddress: nftContractAddress,
                    entrypoint: "set_approval_for_all",
                    calldata: [contract.address, "1"],
                };
            } else {
                const tokenIdUint256 = cairo.uint256(tokenId);
                approveCall = {
                    contractAddress: nftContractAddress,
                    entrypoint: "approve",
                    calldata: [contract.address, tokenIdUint256.low.toString(), tokenIdUint256.high.toString()],
                };
            }

            const hash = await executeWithSponsor([approveCall, fulfillCall]);
            setTxHash(hash);
            const receipt = await provider.waitForTransaction(hash);
            if ((receipt as any).execution_status === "REVERTED") {
                throw new Error((receipt as any).revert_reason || "Transaction reverted on-chain. Check the explorer for details.");
            }
            toast({ title: "Offer Accepted", description: "The offer has been accepted and the asset transferred." });
            return hash;
        });
    }, [account, walletAddress, medialaneContract, medialane1155Contract, chain, toast, provider, withProcessing, executeWithSponsor]);

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
