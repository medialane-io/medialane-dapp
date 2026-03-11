import { Call, TypedData, Signature, AccountInterface } from 'starknet';

declare const SEPOLIA_BASE_URL = "https://sepolia.api.avnu.fi";
declare const BASE_URL = "https://starknet.api.avnu.fi";

interface GaslessStatus {
    status: boolean;
}
interface GaslessCompatibility {
    isCompatible: boolean;
    gasConsumedOverhead: bigint;
    dataGasConsumedOverhead: bigint;
}
interface GasTokenPrice {
    tokenAddress: string;
    priceInETH: bigint;
    priceInUSD: number;
    decimals: number;
}
interface PaymasterReward {
    date: Date;
    address: string;
    sponsor: string;
    campaign: string;
    protocol: string | undefined;
    freeTx: number;
    remainingTx: number;
    expirationDate: Date | undefined;
    whitelistedCalls: WhitelistedCall[];
}
interface WhitelistedCall {
    contractAddress: string;
    entrypoint: string;
}
interface AccountsRewardsOptions {
    sponsor?: string;
    campaign?: string;
    protocol?: string;
}
interface DeploymentData {
    class_hash: string;
    salt: string;
    unique: string;
    calldata: string[];
    sigdata?: string[];
}
interface ExecuteCallsOptions {
    gasTokenAddress?: string;
    maxGasTokenAmount?: bigint;
    deploymentData?: DeploymentData;
}
interface GaslessOptions {
    baseUrl?: string;
    apiKey?: string;
    abortSignal?: AbortSignal;
    apiPublicKey?: string;
    customHeaders?: {
        [key: string]: string;
    };
}
interface RequestError {
    messages: string[];
    revertError: string | undefined;
}
interface InvokeResponse {
    transactionHash: string;
}
declare class ContractError {
    message: string;
    revertError: string;
    constructor(message: string, revertError: string);
}

declare const aListOfGasTokenPrices: () => GasTokenPrice[];

/**
 * Calls API to know if gasless service is up
 * @param options Optional options
 */
declare const fetchGaslessStatus: (options?: GaslessOptions) => Promise<GaslessStatus>;
/**
 * Calls API to know if the account can use the gasless feature
 * If not, the user may need to upgrade his contract or use a compatible wallet
 * @param accountAddress The account address
 * @param options Optional options
 */
declare const fetchAccountCompatibility: (accountAddress: string, options?: GaslessOptions) => Promise<GaslessCompatibility>;
/**
 * Fetches the list of user's paymaster rewards.
 * Rewards are registered by a sponsor. This sponsor will pay account's gas fees.
 * @param accountAddress The account address
 * @param options Optional options
 */
declare const fetchAccountsRewards: (accountAddress: string, options?: AccountsRewardsOptions & GaslessOptions) => Promise<PaymasterReward[]>;
/**
 * Calls API to retrieve gas token prices
 * @param options Optional options
 */
declare const fetchGasTokenPrices: (options?: GaslessOptions) => Promise<GasTokenPrice[]>;
/**
 * Calls API to retrieve the typed data that the user will have to sign.
 * @param userAddress The user's address
 * @param calls The list of calls that will be executed
 * @param gasTokenAddress The gas token address that will be used to pay the gas fees. If null, there is two options:
 * 1. the user must have a reward compatible with the calls. In this case, the reward's sponsor will pay the gas fees in ETH.
 * 2. the api-key header must be field. The api-key's owner will be charged for the consumed gas fees in ETH
 * @param maxGasTokenAmount The maximum amount of gas token that the user is willing to spend. If null, there is two options:
 * 1. the user must have a reward compatible with the calls. In this case, the reward's sponsor will pay the gas fees in ETH.
 * 2. the api-key header must be field. The api-key's owner will be charged for the consumed gas fees in ETH
 * @param accountClassHash Only set this field when the account is not deployed.
 * When the accountClassHash is defined, the API will not check the gasless compatibility by calling
 * the supportsInterface entrypoint but will instead look into an internal map.
 * If the classHash is not supported by the API, please contact us so we can quickly add support.
 * @param options Optional options
 * @returns The best quotes
 */
declare const fetchBuildTypedData: (userAddress: string, calls: Call[], gasTokenAddress: string | undefined, maxGasTokenAmount: bigint | undefined, options?: GaslessOptions, accountClassHash?: string | undefined) => Promise<TypedData>;
declare const formatCall: (calls: Call[]) => Call[];
/**
 * Calls API to execute transaction using the gasless feature
 * @param userAddress The user address
 * @param typedData The typed data that the user signed
 * @param signature The typed data's signature
 * @param deploymentData When this field is set, the paymaster will deploy the user's account
 * before executing the typed data. To retrieve the deployment data, you can read
 * https://community.starknet.io/t/snip-deployment-interface-between-dapps-and-wallets/101923.
 * For now, the paymaster only allows the deployment of account for sponsored transactions.
 * @param options Optional options.
 * @returns The best quotes
 */
declare const fetchExecuteTransaction: (userAddress: string, typedData: string, signature: Signature, options?: GaslessOptions, deploymentData?: DeploymentData | undefined) => Promise<InvokeResponse>;
/**
 * Execute list of calls using the gasless feature
 * You can directly provide the maxGasTokenAmount or let us compute it for you by providing estimatedGasFees, gasTokenPrices and maxFeesOverhead
 * @param account The user's account
 * @param calls Calls that will be executed
 * @param gasTokenAddress The gas token address that will be used to pay the gas fees. If null, there is two options:
 * 1. the user must have a reward compatible with the calls. In this case, the reward's sponsor will pay the gas fees in ETH.
 * 2. the api-key header must be field. The api-key's owner will be charged for the consumed gas fees in ETH
 * @param maxGasTokenAmount The maximum amount of gas token that the user is willing to spend. If null, there is two options:
 * 1. the user must have a reward compatible with the calls. In this case, the reward's sponsor will pay the gas fees in ETH.
 * 2. the api-key header must be field. The api-key's owner will be charged for the consumed gas fees in ETH
 * @param estimatedGasFees The estimated gas fees amount in ETH
 * @param options Optional options.
 * @returns Promise<InvokeSwapResponse>
 */
declare const executeCalls: (account: AccountInterface, calls: Call[], { gasTokenAddress, maxGasTokenAmount, deploymentData }: ExecuteCallsOptions, options?: GaslessOptions) => Promise<InvokeResponse>;
/**
 * Calculate the gas fees in gas token
 * @param estimatedGasFeesInETH The estimated amount gas fees (overall_fee)
 * @param gasTokenPrice The selected gasTokenPrice
 * @param gasCost The current gas_price
 * @param dataGasCost The current data_gas_price
 * @param gasConsumedOverhead The gaslessCompatibility's gasConsumedOverhead (see fetchAccountCompatibility)
 * @param dataGasConsumedOverhead The gaslessCompatibility's dataGasConsumedOverhead (see fetchAccountCompatibility)
 * @returns bigint
 */
declare const getGasFeesInGasToken: (estimatedGasFeesInETH: bigint, gasTokenPrice: GasTokenPrice, gasCost: bigint | undefined, dataGasCost: bigint | undefined, gasConsumedOverhead: bigint, dataGasConsumedOverhead: bigint) => bigint;

export { type AccountsRewardsOptions, BASE_URL, ContractError, type DeploymentData, type ExecuteCallsOptions, type GasTokenPrice, type GaslessCompatibility, type GaslessOptions, type GaslessStatus, type InvokeResponse, type PaymasterReward, type RequestError, SEPOLIA_BASE_URL, type WhitelistedCall, aListOfGasTokenPrices, executeCalls, fetchAccountCompatibility, fetchAccountsRewards, fetchBuildTypedData, fetchExecuteTransaction, fetchGasTokenPrices, fetchGaslessStatus, formatCall, getGasFeesInGasToken };
