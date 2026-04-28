import { type TypedData, TypedDataRevision, constants } from "starknet";
import {
    build1155OrderTypedData,
    build1155FulfillmentTypedData,
    build1155CancellationTypedData,
} from "@medialane/sdk";

export const getOrderParametersTypedData = (
    message: any,
    chainId: constants.StarknetChainId
): TypedData => {
    return {
        domain: {
            name: "Medialane",
            version: "1",
            chainId: chainId,
            revision: TypedDataRevision.ACTIVE,
        },
        primaryType: "OrderParameters",
        types: {
            StarknetDomain: [
                { name: "name", type: "shortstring" },
                { name: "version", type: "shortstring" },
                { name: "chainId", type: "shortstring" },
                { name: "revision", type: "shortstring" },
            ],
            OrderParameters: [
                { name: "offerer", type: "ContractAddress" },
                { name: "offer", type: "OfferItem" },
                { name: "consideration", type: "ConsiderationItem" },
                { name: "start_time", type: "felt" },
                { name: "end_time", type: "felt" },
                { name: "salt", type: "felt" },
                { name: "nonce", type: "felt" },
            ],
            OfferItem: [
                { name: "item_type", type: "shortstring" },
                { name: "token", type: "ContractAddress" },
                { name: "identifier_or_criteria", type: "felt" },
                { name: "start_amount", type: "felt" },
                { name: "end_amount", type: "felt" },
            ],
            ConsiderationItem: [
                { name: "item_type", type: "shortstring" },
                { name: "token", type: "ContractAddress" },
                { name: "identifier_or_criteria", type: "felt" },
                { name: "start_amount", type: "felt" },
                { name: "end_amount", type: "felt" },
                { name: "recipient", type: "ContractAddress" },
            ],
        },
        message,
    };
};

export const getOrderCancellationTypedData = (
    message: any,
    chainId: constants.StarknetChainId
): TypedData => {
    return {
        domain: {
            name: "Medialane",
            version: "1",
            chainId: chainId,
            revision: TypedDataRevision.ACTIVE,
        },
        primaryType: "OrderCancellation",
        types: {
            StarknetDomain: [
                { name: "name", type: "shortstring" },
                { name: "version", type: "shortstring" },
                { name: "chainId", type: "shortstring" },
                { name: "revision", type: "shortstring" },
            ],
            OrderCancellation: [
                { name: "order_hash", type: "felt" },
                { name: "offerer", type: "ContractAddress" },
                { name: "nonce", type: "felt" },
            ],
        },
        message,
    };
};

export const getOrderFulfillmentTypedData = (
    message: any,
    chainId: constants.StarknetChainId
): TypedData => {
    return {
        domain: {
            name: "Medialane",
            version: "1",
            chainId: chainId,
            revision: TypedDataRevision.ACTIVE,
        },
        primaryType: "OrderFulfillment",
        types: {
            StarknetDomain: [
                { name: "name", type: "shortstring" },
                { name: "version", type: "shortstring" },
                { name: "chainId", type: "shortstring" },
                { name: "revision", type: "shortstring" },
            ],
            OrderFulfillment: [
                { name: "order_hash", type: "felt" },
                { name: "fulfiller", type: "ContractAddress" },
                { name: "nonce", type: "felt" },
            ],
        },
        message,
    };
};

/** SNIP-12 typed data for ERC-1155 OrderParameters. Domain: "Medialane1155". Flat struct. */
export const get1155OrderParametersTypedData = (
    message: Record<string, unknown>,
    chainId: constants.StarknetChainId
): TypedData => build1155OrderTypedData(message, chainId);

/** SNIP-12 typed data for ERC-1155 OrderFulfillment. Includes `quantity` field. */
export const get1155OrderFulfillmentTypedData = (
    message: Record<string, unknown>,
    chainId: constants.StarknetChainId
): TypedData => build1155FulfillmentTypedData(message, chainId);

/** SNIP-12 typed data for ERC-1155 OrderCancellation. Domain: "Medialane1155". */
export const get1155OrderCancellationTypedData = (
    message: Record<string, unknown>,
    chainId: constants.StarknetChainId
): TypedData => build1155CancellationTypedData(message, chainId);

export const stringifyBigInts = (obj: any): any => {
    if (typeof obj === "bigint") {
        return obj.toString();
    }
    if (Array.isArray(obj)) {
        return obj.map(stringifyBigInts);
    }
    if (obj !== null && typeof obj === "object") {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, stringifyBigInts(value)])
        );
    }
    return obj;
};
