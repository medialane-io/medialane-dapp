import { OutsideExecutionTypedData } from '@starknet-io/starknet-types-09';
import { Duration } from 'moment';
import { AccountInterface, PaymasterInterface, ExecutionParameters, Call, PreparedInvokeTransaction } from 'starknet';
import { z } from 'zod';

declare const SEPOLIA_BASE_URL = "https://sepolia.api.avnu.fi";
declare const BASE_URL = "https://starknet.api.avnu.fi";
declare const IMPULSE_BASE_URL = "https://starknet.impulse.avnu.fi";
declare const SEPOLIA_IMPULSE_BASE_URL = "https://sepolia.impulse.avnu.fi";
declare const TOKEN_API_VERSION = "v1";
declare const IMPULSE_API_VERSION = "v3";
declare const SWAP_API_VERSION = "v3";
declare const PRICES_API_VERSION = "v3";
declare const STAKING_API_VERSION = "v3";
declare const DCA_API_VERSION = "v3";

declare enum FeedDateRange {
    ONE_HOUR = "1H",
    ONE_DAY = "1D",
    ONE_WEEK = "1W",
    ONE_MONTH = "1M",
    ONE_YEAR = "1Y"
}
declare enum PriceFeedType {
    LINE = "LINE",
    CANDLE = "CANDLE"
}
declare enum VolumeFeedType {
    LINE = "LINE",
    BAR = "BAR"
}
declare enum FeedResolution {
    ONE_MIN = "1",
    FIVE_MIN = "5",
    FIFTEEN_MIN = "15",
    HOURLY = "1H",
    FOUR_HOUR = "4H",
    DAILY = "1D",
    WEEKLY = "1W",
    MONTHLY = "1M",
    YEARLY = "1Y"
}
declare enum SourceType {
    DEX = "DEX",
    MARKET_MAKER = "MARKET_MAKER",
    TOKEN_WRAPPER = "TOKEN_WRAPPER",
    ORDERBOOK = "ORDERBOOK"
}
declare enum DcaTradeStatus {
    CANCELLED = "CANCELLED",
    PENDING = "PENDING",
    SUCCEEDED = "SUCCEEDED"
}
declare enum DcaOrderStatus {
    INDEXING = "INDEXING",
    ACTIVE = "ACTIVE",
    CLOSED = "CLOSED"
}

interface AvnuOptions {
    baseUrl?: string;
    impulseBaseUrl?: string;
    abortSignal?: AbortSignal;
    avnuPublicKey?: string;
}
interface Pageable {
    page?: number;
    size?: number;
    sort?: string;
}
interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}
declare const getLastPageNumber: <T>(page: Page<T> | undefined) => number;
type TokenTag = 'Unknown' | 'Verified' | 'Community' | 'Unruggable' | 'AVNU';
interface Token {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoUri: string | null;
    lastDailyVolumeUsd: number;
    extensions: {
        [key: string]: string;
    };
    tags: TokenTag[];
}
interface GetTokensRequest extends Pageable {
    search?: string;
    tags?: TokenTag[];
}
interface MarketPrice {
    usd: number;
}
interface TokenPrice {
    address: string;
    decimals: number;
    globalMarket: MarketPrice | null;
    starknetMarket: MarketPrice | null;
}
type TokenPriceResponse = TokenPrice[];
interface InvokeTransactionResponse {
    transactionHash: string;
}
interface InvokeParams {
    provider: AccountInterface;
    paymaster?: InvokePaymasterParams;
}
interface RequestError {
    messages: string[];
    revertError: string | undefined;
}
declare class ContractError extends Error {
    readonly revertError: string;
    constructor(message: string, revertError: string);
}
interface PaymasterParams {
    provider: PaymasterInterface;
    params: ExecutionParameters;
}
interface InvokePaymasterParams extends PaymasterParams {
    active: boolean;
}
interface BuildPaymasterTransactionParams {
    takerAddress: string;
    paymaster: PaymasterParams;
    calls: Call[];
}
interface SignTransactionParams {
    provider: AccountInterface;
    typedData: OutsideExecutionTypedData;
}
interface ExecutePaymasterTransactionParams {
    takerAddress: string;
    paymaster: PaymasterParams;
    signedTransaction: SignedPaymasterTransaction;
}
interface SignedPaymasterTransaction {
    typedData: OutsideExecutionTypedData;
    signature: string[];
}
interface InvokeSwapParams extends InvokeParams {
    quote: Quote;
    slippage: number;
    executeApprove?: boolean;
}
interface AvnuCalls {
    chainId: string;
    calls: Call[];
}
interface QuoteRequest {
    sellTokenAddress: string;
    buyTokenAddress: string;
    sellAmount?: bigint;
    buyAmount?: bigint;
    takerAddress?: string;
    size?: number;
    excludeSources?: string[];
    integratorFees?: bigint;
    integratorFeeRecipient?: string;
    integratorName?: string;
    onlyDirect?: boolean;
}
interface Route {
    name: string;
    address: string;
    percent: number;
    sellTokenAddress: string;
    buyTokenAddress: string;
    routeInfo?: Record<string, string>;
    routes: Route[];
    alternativeSwapCount: number;
}
interface Fee {
    feeToken: string;
    avnuFees: bigint;
    avnuFeesInUsd: number;
    avnuFeesBps: bigint;
    integratorFees: bigint;
    integratorFeesInUsd: number;
    integratorFeesBps: bigint;
}
interface Quote {
    quoteId: string;
    sellTokenAddress: string;
    sellAmount: bigint;
    sellAmountInUsd: number;
    buyTokenAddress: string;
    buyAmount: bigint;
    buyAmountInUsd: number;
    fee: Fee;
    blockNumber?: number;
    chainId: string;
    expiry?: number | null;
    routes: Route[];
    gasFees: bigint;
    gasFeesInUsd?: number;
    priceImpact: number;
    sellTokenPriceInUsd?: number;
    buyTokenPriceInUsd?: number;
    exactTokenTo?: boolean;
    estimatedSlippage?: number;
}
interface QuoteToCallsParams {
    quoteId: string;
    slippage: number;
    takerAddress?: string;
    executeApprove?: boolean;
}
interface Source {
    name: string;
    type: SourceType;
}
interface StakingActionToCallsParams {
    poolAddress: string;
    userAddress: string;
}
interface StakeToCallsParams extends StakingActionToCallsParams {
    amount: bigint;
}
interface UnstakeToCallsParams extends StakingActionToCallsParams {
}
interface ClaimRewardsToCallsParams extends StakingActionToCallsParams {
    restake: boolean;
}
interface InvokeStakeParams extends InvokeParams {
    poolAddress: string;
    amount: bigint;
}
interface InvokeInitiateUnstakeParams extends InvokeParams {
    poolAddress: string;
    amount: bigint;
}
interface InvokeUnstakeParams extends InvokeParams {
    poolAddress: string;
}
interface InvokeClaimRewardsParams extends InvokeParams {
    poolAddress: string;
    restake: boolean;
}
interface StakingInfo {
    selfStakedAmount: bigint;
    selfStakedAmountInUsd: number | undefined;
    operationalAddress: string;
    rewardAddress: string;
    stakerAddress: string;
    commission: number;
    delegationPools: DelegationPool[];
}
interface DelegationPool {
    poolAddress: string;
    tokenAddress: string;
    stakedAmount: bigint;
    stakedAmountInUsd: number | undefined;
    apr: number;
}
interface UserStakingInfo {
    tokenAddress: string;
    tokenPriceInUsd: number;
    poolAddress: string;
    userAddress: string;
    amount: bigint;
    amountInUsd: number | undefined;
    unclaimedRewards: bigint;
    unclaimedRewardsInUsd: number | undefined;
    unpoolAmount: bigint;
    unpoolAmountInUsd: number | undefined;
    unpoolTime: Date | undefined;
    totalClaimedRewards: bigint;
    totalClaimedRewardsHistoricalUsd?: number;
    totalClaimedRewardsUsd: number;
    userActions: Action[];
    totalUserActionsCount: number;
    expectedYearlyStrkRewards: bigint;
    aprs: Apr[];
}
interface Apr {
    date: Date;
    apr: number;
}
interface GetDcaOrdersParams extends Pageable {
    traderAddress: string;
    status?: DcaOrderStatus;
}
interface PricingStrategy {
    tokenToMinAmount: string | undefined;
    tokenToMaxAmount: string | undefined;
}
interface DcaTrade {
    sellAmount: bigint;
    sellAmountInUsd?: number;
    buyAmount?: bigint;
    buyAmountInUsd?: number;
    expectedTradeDate: Date;
    actualTradeDate?: Date;
    status: DcaTradeStatus;
    txHash?: string;
    errorReason?: string;
}
interface DcaOrder {
    id: string;
    blockNumber: number;
    timestamp: Date;
    traderAddress: string;
    orderAddress: string;
    creationTransactionHash: string;
    orderClassHash: string;
    sellTokenAddress: string;
    sellAmount: bigint;
    sellAmountPerCycle: bigint;
    buyTokenAddress: string;
    startDate: Date;
    endDate: Date;
    closeDate?: Date;
    frequency: string;
    iterations: number;
    status: DcaOrderStatus;
    pricingStrategy: PricingStrategy | Record<string, never>;
    amountSold: bigint;
    amountBought: bigint;
    averageAmountBought: bigint;
    executedTradesCount: number;
    cancelledTradesCount: number;
    pendingTradesCount: number;
    trades: DcaTrade[];
}
interface CreateDcaOrder {
    sellTokenAddress: string | undefined;
    buyTokenAddress: string | undefined;
    sellAmount: string;
    sellAmountPerCycle: string;
    frequency: Duration;
    pricingStrategy: PricingStrategy | Record<string, never>;
    traderAddress: string;
}
interface InvokeCreateDcaParams extends InvokeParams {
    order: CreateDcaOrder;
}
interface InvokeCancelDcaParams extends InvokeParams {
    orderAddress: string;
}
interface Action {
    blockNumber: bigint;
    date: Date;
    transactionHash: string;
    gasFee: GasFeeInfo | null;
    type: ActionType;
    metadata: ActionMetadata;
}
type ActionType = 'Swap' | 'OpenDcaOrder' | 'CancelDcaOrder' | 'DcaTrade' | 'StakingStake' | 'StakingInitiateWithdrawal' | 'StakingCancelWithdrawal' | 'StakingWithdraw' | 'StakingClaimRewards';
interface GasFeeInfo {
    gasFeeAmount?: bigint;
    gasFeeAmountUsd?: number;
    gasFeeTokenAddress?: string;
}
type ActionMetadata = SwapMetadata | DcaOrderMetadata | CancelDcaOrderMetadata | DcaTradeMetadata | StakingInitiateUnstakeMetadata | StakingCancelUnstakeMetadata | StakingStakeMetadata | StakingClaimRewardsMetadata | StakingUnstakeMetadata;
interface SwapMetadata {
    sellTokenAddress: string;
    sellAmount: bigint;
    sellAmountUsd?: number;
    buyTokenAddress: string;
    buyAmount: bigint;
    buyAmountUsd?: number;
    integratorName?: string;
}
interface DcaOrderMetadata {
    orderClassHash: string;
    orderAddress: string;
    sellTokenAddress: string;
    sellAmount: bigint;
    sellAmountUsd?: number;
    sellAmountPerCycle: bigint;
    buyTokenAddress: string;
    cycleFrequency: bigint;
    startDate: Date;
    endDate: Date;
}
interface CancelDcaOrderMetadata {
    orderAddress: string;
}
interface DcaTradeMetadata {
    sellTokenAddress: string;
    sellAmount: bigint;
    sellAmountUsd?: number;
    buyTokenAddress: string;
    buyAmount: bigint;
    buyAmountUsd?: number;
}
interface StakingInitiateUnstakeMetadata {
    delegationPoolAddress: string;
    exitTimestamp: Date;
    amount: bigint;
    amountUsd?: number;
    oldDelegatedStake: bigint;
    oldDelegatedStakeUsd?: number;
    newDelegatedStake: bigint;
    newDelegatedStakeUsd?: number;
}
interface StakingCancelUnstakeMetadata {
    delegationPoolAddress: string;
    oldDelegatedStake: bigint;
    oldDelegatedStakeUsd?: number;
    newDelegatedStake: bigint;
    newDelegatedStakeUsd?: number;
}
interface StakingStakeMetadata {
    delegationPoolAddress: string;
    oldDelegatedStake: bigint;
    oldDelegatedStakeUsd?: number;
    newDelegatedStake: bigint;
    newDelegatedStakeUsd?: number;
}
interface StakingClaimRewardsMetadata {
    delegationPoolAddress: string;
    rewardAddress: string;
    amount: bigint;
    amountUsd?: number;
}
interface StakingUnstakeMetadata {
    delegationPoolAddress: string;
    amount: bigint;
    amountUsd?: number;
}
interface SimpleDateProps {
    date?: string | Date;
}
interface SimpleFeedProps {
    dateRange: FeedDateRange;
}
interface FeedProps extends SimpleFeedProps {
    resolution: FeedResolution;
}
interface PriceFeedProps extends FeedProps {
    type: PriceFeedType;
}
interface StarknetMarket {
    usd: number;
    usdTvl: number;
    usdPriceChange1h: number;
    usdPriceChangePercentage1h: number | null;
    usdPriceChange24h: number;
    usdPriceChangePercentage24h: number | null;
    usdPriceChange7d: number;
    usdPriceChangePercentage7d: number | null;
    usdVolume24h: number;
    usdTradingVolume24h: number;
}
interface GlobalMarket {
    usd: number;
    usdMarketCap: number;
    usdFdv: number;
    usdMarketCapChange24h: number;
    usdMarketCapChangePercentage24h: number;
}
interface DataPoint {
    date: string;
    value: number;
}
interface DataPointWithUsd {
    date: string;
    value: number;
    valueUsd: number;
}
interface ExchangeDataPoint extends DataPointWithUsd {
    exchange: string;
}
interface ExchangeRangeDataPoint {
    value: number;
    valueUsd: number;
    exchange: string;
    startDate: string;
    endDate: string;
}
interface CandleDataPoint {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
interface TokenMarketData {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
    logoUri?: string | null;
    coingeckoId?: string | null;
    verified: boolean;
    starknet: StarknetMarket;
    global: GlobalMarket | null;
    tags: TokenTag[];
    linePriceFeedInUsd: DataPoint[];
}

/**
 * Get the DCA orders for a given trader
 * @param params.traderAddress The trader address
 * @param params.status The status of the orders (ACTIVE, CLOSED, INDEXING)
 * @param params.page The page number
 * @param params.size The page size
 * @param params.sort The sort order
 * @param options Optional SDK configuration
 * @returns The page of DCA orders corresponding to the request params
 */
declare const getDcaOrders: ({ traderAddress, status, page, size, sort }: GetDcaOrdersParams, options?: AvnuOptions) => Promise<Page<DcaOrder>>;
/**
 * Build the calls to execute a "create DCA order" action
 * @param order The DCA order to create
 * @param order.sellTokenAddress The address of the token to sell
 * @param order.buyTokenAddress The address of the token to buy
 * @param order.sellAmount The amount of the token to sell
 * @param order.sellAmountPerCycle The amount of the token to sell per cycle
 * @param order.frequency The frequency of the DCA order
 * @param order.pricingStrategy The pricing strategy to use (tokenToMinAmount and/or tokenToMaxAmount)
 * @param order.traderAddress The address of the trader
 * @param options Optional SDK configuration
 * @returns The calls to execute
 */
declare const createDcaToCalls: (order: CreateDcaOrder, options?: AvnuOptions) => Promise<AvnuCalls>;
/**
 * Build the calls to execute a "cancel DCA order" action
 * @param orderAddress The address of the DCA contract order to cancel
 * @param options Optional SDK configuration
 * @returns The calls to execute
 */
declare const cancelDcaToCalls: (orderAddress: string, options?: AvnuOptions) => Promise<AvnuCalls>;
/**
 * Execute a "create DCA order" action
 * @param params.provider The provider to execute the action
 * @param params.paymaster The paymaster to execute the action, if needed
 * @param params.paymaster.active True if the tx must be executed through a paymaster
 * @param params.paymaster.provider The paymaster provider, must implement the PaymasterInterface
 * @param params.paymaster.params The paymaster tx parameters
 * @param params.order The DCA order to create
 * @param params.order.sellTokenAddress The address of the token to sell
 * @param params.order.buyTokenAddress The address of the token to buy
 * @param params.order.sellAmount The amount of the token to sell
 * @param params.order.sellAmountPerCycle The amount of the token to sell per cycle
 * @param params.order.frequency The frequency of the DCA order
 * @param params.order.pricingStrategy The pricing strategy to use (tokenToMinAmount and/or tokenToMaxAmount)
 * @param params.order.traderAddress The address of the trader
 * @param options Optional SDK configuration
 * @returns The transaction hash
 */
declare const executeCreateDca: (params: InvokeCreateDcaParams, options?: AvnuOptions) => Promise<InvokeTransactionResponse>;
/**
 * Execute a "cancel DCA order" action
 * @param params.provider The provider to execute the action
 * @param params.paymaster The paymaster to execute the action, if needed
 * @param params.paymaster.active True if the tx must be executed through a paymaster
 * @param params.paymaster.provider The paymaster provider, must implement the PaymasterInterface
 * @param params.paymaster.params The paymaster tx parameters
 * @param params.orderAddress The address of the DCA contract order to cancel
 * @param options Optional SDK configuration
 * @returns The transaction hash
 */
declare const executeCancelDca: (params: InvokeCancelDcaParams, options?: AvnuOptions) => Promise<InvokeTransactionResponse>;

declare const aPriceRequest: () => {
    tokens: string[];
};
declare const aQuoteRequest: () => QuoteRequest;
declare const aPrice: () => TokenPrice;
declare const aQuote: () => Quote;
declare const aQuoteWithManySubRoutes: () => Quote;
declare const aQuoteWithManyComplexRoutes: () => Quote;
declare const anInvokeTransactionResponse: () => InvokeTransactionResponse;
declare const aAvnuCalls: () => AvnuCalls;
declare const aCall: (overrides?: Partial<Call>) => Call;
declare const ethToken: () => Token;
declare const btcToken: () => Token;
declare const aPage: <T>(content: T[], size?: number, number?: number, totalPages?: number, totalElements?: number) => Page<T>;
declare const aSource: () => Source;
declare const aDCACreateOrder: () => CreateDcaOrder;
declare const aDCAOrder: () => DcaOrder;
declare const aDelegationPool: () => DelegationPool;
declare const aStakingInfo: () => StakingInfo;
declare const anApr: () => Apr;
declare const anAction: () => Action;
declare const aUserStakingInfo: () => UserStakingInfo;
declare const aPreparedTypedData: () => OutsideExecutionTypedData;
declare const aSignedPaymasterTransaction: () => SignedPaymasterTransaction;
declare const aStarknetMarket: () => StarknetMarket;
declare const aGlobalMarket: () => GlobalMarket;
declare const aDataPoint: () => DataPoint;
declare const aCandleDataPoint: () => CandleDataPoint;
declare const aDataPointWithUsd: () => DataPointWithUsd;
declare const anExchangeRangeDataPoint: () => ExchangeRangeDataPoint;
declare const anExchangeDataPoint: () => ExchangeDataPoint;
declare const aTokenMarketData: () => TokenMarketData;

/**
 * Get the most popular tokens on Starknet, including their market data
 * @param options Optional SDK configuration
 * @returns The list of tokens with their market data
 */
declare const getMarketData: (options?: AvnuOptions) => Promise<TokenMarketData[]>;
/**
 * Get the market data for a specific token
 * @param tokenAddress The address of the token
 * @param options Optional SDK configuration
 * @returns The market data for the token
 */
declare const getTokenMarketData: (tokenAddress: string, options?: AvnuOptions) => Promise<TokenMarketData>;
/**
 * Get the price feed for a given token
 * @param tokenAddress The address of the token
 * @param feedProps.type The type of feed (LINE or CANDLE)
 * @param feedProps.dateRange The date range (ONE_HOUR, ONE_DAY, ONE_WEEK, ONE_MONTH, ONE_YEAR)
 * @param feedProps.resolution The resolution (1, 5, 15, 1H, 4H, 1D, 1W, 1M, 1Y)
 * @param quoteTokenAddress The address of the quoted token (optional)
 * @param options Optional SDK configuration
 * @returns The price feed data
 */
declare const getPriceFeed: (tokenAddress: string, feedProps: PriceFeedProps, quoteTokenAddress?: string, options?: AvnuOptions) => Promise<DataPoint[] | CandleDataPoint[]>;
/**
 * Get the volume by exchange for a given token and a given date range
 * @param tokenAddress The address of the token
 * @param simpleProps.dateRange The date range (ONE_HOUR, ONE_DAY, ONE_WEEK, ONE_MONTH, ONE_YEAR)
 * @param options Optional SDK configuration
 * @returns The volume by exchange data
 */
declare const getVolumeByExchange: (tokenAddress: string, simpleProps: SimpleFeedProps, options?: AvnuOptions) => Promise<ExchangeRangeDataPoint[]>;
/**
 * Get the exchange volume feed for a given token
 * @param tokenAddress The address of the token
 * @param feedProps.type The type of feed (LINE or CANDLE)
 * @param feedProps.dateRange The date range (ONE_HOUR, ONE_DAY, ONE_WEEK, ONE_MONTH, ONE_YEAR)
 * @param feedProps.resolution The resolution (1, 5, 15, 1H, 4H, 1D, 1W, 1M, 1Y)
 * @param options Optional SDK configuration
 * @returns The exchange volume feed data
 */
declare const getExchangeVolumeFeed: (tokenAddress: string, feedProps: FeedProps, options?: AvnuOptions) => Promise<ExchangeDataPoint[]>;
/**
 * Get the TVL by exchange for a given token and a given date range
 * @param tokenAddress The address of the token
 * @param simpleProps.dateRange The date range (ONE_HOUR, ONE_DAY, ONE_WEEK, ONE_MONTH, ONE_YEAR)
 * @param options Optional SDK configuration
 * @returns The TVL by exchange data
 */
declare const getTVLByExchange: (tokenAddress: string, simpleDateProps: SimpleDateProps, options?: AvnuOptions) => Promise<ExchangeDataPoint[]>;
/**
 * Get the exchange TVL feed for a given token
 * @param tokenAddress The address of the token
 * @param feedProps.type The type of feed (LINE or CANDLE)
 * @param feedProps.dateRange The date range (ONE_HOUR, ONE_DAY, ONE_WEEK, ONE_MONTH, ONE_YEAR)
 * @param feedProps.resolution The resolution (1, 5, 15, 1H, 4H, 1D, 1W, 1M, 1Y)
 * @param options Optional SDK configuration
 * @returns The exchange TVL feed data
 */
declare const getExchangeTVLFeed: (tokenAddress: string, feedProps: FeedProps, options?: AvnuOptions) => Promise<ExchangeDataPoint[]>;
/**
 * Get the transfer volume feed for a given token
 * @param tokenAddress The address of the token
 * @param feedProps.type The type of feed (LINE or CANDLE)
 * @param feedProps.dateRange The date range (ONE_HOUR, ONE_DAY, ONE_WEEK, ONE_MONTH, ONE_YEAR)
 * @param feedProps.resolution The resolution (1, 5, 15, 1H, 4H, 1D, 1W, 1M, 1Y)
 * @param options Optional SDK configuration
 * @returns The transfer volume feed data
 */
declare const getTransferVolumeFeed: (tokenAddress: string, feedProps: FeedProps, options?: AvnuOptions) => Promise<DataPointWithUsd[]>;
/**
 * Get the market prices for a given list of tokens
 * @param tokenAddresses The list of token addresses
 * @param options Optional SDK configuration
 * @returns The market prices for the tokens
 */
declare const getPrices: (tokenAddresses: string[], options?: AvnuOptions) => Promise<TokenPriceResponse>;

/**
 * Build a paymaster transaction
 * !! Be careful if you run this on a client it will leak your PAYMASTER_API_KEY if you have one!!
 * !! Use it in a server-side environment instead !!
 *
 * @param params The paymaster transaction parameters
 * @param params.takerAddress The address of the taker who will execute the transaction
 * @param params.paymaster The paymaster params
 * @param params.calls The calls to execute
 * @returns The prepared paymaster transaction containing the typed data to sign
 */
declare const buildPaymasterTransaction: (params: BuildPaymasterTransactionParams) => Promise<PreparedInvokeTransaction>;
/**
 * Sign the paymaster transaction
 *
 * @param params The signature parameters
 * @param params.provider The account which will sign the transaction, must implement the AccountInterface
 * @param params.typedData The typed data to sign
 * @returns The prepared paymaster transaction containing the typed data and the signature
 */
declare const signPaymasterTransaction: (params: SignTransactionParams) => Promise<SignedPaymasterTransaction>;
/**
 * Execute a paymaster transaction
 * !! Be careful if you run this on a client it will leak your PAYMASTER_API_KEY if you have one!!
 * !! Use it in a server-side environment instead !!
 *
 * @param params The execution parameters
 * @param params.takerAddress The address of the taker who will execute the transaction
 * @param params.paymaster The paymaster params
 * @param params.signedTransaction The signed transaction with typed data and signature
 * @returns The transaction hash
 */
declare const executePaymasterTransaction: (params: ExecutePaymasterTransactionParams) => Promise<InvokeTransactionResponse>;
/**
 * Execute the complete paymaster flow
 * !! Be careful if you run this on a client it will leak your PAYMASTER_API_KEY if you have one!!
 * !! Use it in a server-side environment instead !!
 *
 * @param paymaster.provider The paymaster provider, must implement the PaymasterInterface
 * @param paymaster.params The paymaster parameters
 * @param provider The account which will execute the transaction, must implement the AccountInterface
 * @param calls The calls to execute
 * @returns The transaction hash
 */
declare const executeAllPaymasterFlow: ({ paymaster, provider, calls, }: {
    paymaster: InvokePaymasterParams;
    provider: AccountInterface;
    calls: Call[];
}) => Promise<InvokeTransactionResponse>;

/**
 * Get the AVNU staking info, including the self staked amount and the operational address
 * @param options Optional SDK configuration
 * @returns The AVNU staking info
 */
declare const getAvnuStakingInfo: (options?: AvnuOptions) => Promise<StakingInfo>;
/**
 * Get the user staking info for a given staking pool
 * @param tokenAddress The staked token address
 * @param userAddress The user address
 * @param options Optional SDK configuration
 * @returns The user staking info
 */
declare const getUserStakingInfo: (tokenAddress: string, userAddress: string, options?: AvnuOptions) => Promise<UserStakingInfo>;
/**
 * Build the calls to execute a "stake" action
 * @param params.poolAddress The staking pool address
 * @param params.userAddress The user address
 * @param params.amount The amount to stake
 * @param options Optional SDK configuration
 * @returns The calls to execute
 */
declare const stakeToCalls: (params: StakeToCallsParams, options?: AvnuOptions) => Promise<AvnuCalls>;
/**
 * Build the calls to execute a "initiate withdrawal" action
 * @param params.poolAddress The staking pool address
 * @param params.userAddress The user address
 * @param params.amount The amount to initiate withdrawal
 * @param options Optional SDK configuration
 * @returns The calls to execute
 */
declare const initiateUnstakeToCalls: (params: StakeToCallsParams, options?: AvnuOptions) => Promise<AvnuCalls>;
/**
 * Build the calls to execute a "claim withdrawal" action after the withdrawal period has ended
 * @param params.poolAddress The staking pool address
 * @param params.userAddress The user address
 * @param options Optional SDK configuration
 * @returns The calls to execute
 */
declare const unstakeToCalls: (params: UnstakeToCallsParams, options?: AvnuOptions) => Promise<AvnuCalls>;
/**
 * Build the calls to execute a "claim rewards" action
 * @param params.poolAddress The staking pool address
 * @param params.userAddress The user address
 * @param params.restake Whether to restake the rewards or not(only for STRK rewards)
 * @param options Optional SDK configuration
 * @returns The calls to execute
 */
declare const claimRewardsToCalls: (params: ClaimRewardsToCallsParams, options?: AvnuOptions) => Promise<AvnuCalls>;
/**
 * Execute a "stake" action
 * @param params.provider The provider to execute the action
 * @param params.paymaster The paymaster to execute the action, if needed
 * @param params.paymaster.active True if the tx must be executed through a paymaster
 * @param params.paymaster.provider The paymaster provider, must implement the PaymasterInterface
 * @param params.paymaster.params The paymaster tx parameters
 * @param params.poolAddress The staking pool address
 * @param params.amount The amount to stake
 * @param options Optional SDK configuration
 * @returns The transaction hash
 */
declare const executeStake: (params: InvokeStakeParams, options?: AvnuOptions) => Promise<InvokeTransactionResponse>;
/**
 * Execute a "initiate withdrawal" action
 * @param params.provider The provider to execute the action
 * @param params.paymaster The paymaster to execute the action, if needed
 * @param params.paymaster.active True if the tx must be executed through a paymaster
 * @param params.paymaster.provider The paymaster provider, must implement the PaymasterInterface
 * @param params.paymaster.params The paymaster tx parameters
 * @param params.poolAddress The staking pool address
 * @param params.amount The amount to initiate withdrawal
 * @param options Optional SDK configuration
 * @returns The transaction hash
 */
declare const executeInitiateUnstake: (params: InvokeInitiateUnstakeParams, options?: AvnuOptions) => Promise<InvokeTransactionResponse>;
/**
 * Execute a "claim withdrawal" action after the withdrawal period has ended
 * @param params.provider The provider to execute the action
 * @param params.paymaster The paymaster to execute the action, if needed
 * @param params.paymaster.active True if the tx must be executed through a paymaster
 * @param params.paymaster.provider The paymaster provider, must implement the PaymasterInterface
 * @param params.paymaster.params The paymaster tx parameters
 * @param params.poolAddress The staking pool address
 * @param options Optional SDK configuration
 * @returns The transaction hash
 */
declare const executeUnstake: (params: InvokeUnstakeParams, options?: AvnuOptions) => Promise<InvokeTransactionResponse>;
/**
 * Execute a "claim rewards" action
 * @param params.provider The provider to execute the action
 * @param params.paymaster The paymaster to execute the action, if needed
 * @param params.paymaster.active True if the tx must be executed through a paymaster
 * @param params.paymaster.provider The paymaster provider, must implement the PaymasterInterface
 * @param params.paymaster.params The paymaster tx parameters
 * @param params.poolAddress The staking pool address
 * @param params.restake Whether to restake the rewards or not(only for STRK rewards)
 * @param options Optional SDK configuration
 * @returns The transaction hash
 */
declare const executeClaimRewards: (params: InvokeClaimRewardsParams, options?: AvnuOptions) => Promise<InvokeTransactionResponse>;

/**
 * Get the supported sources
 *
 * @param options Optional SDK configuration
 * @returns The available liquidity sources
 */
declare const getSources: (options?: AvnuOptions) => Promise<Source[]>;
/**
 * Get the best quotes.
 * It allows to find the best quotes from on-chain and off-chain liquidity. The best quotes will be returned and are sorted (best first).
 *
 * @param request The request params for the avnu API `/swap/v2/quotes` endpoint.
 * @param options Optional SDK configuration
 * @returns The best quotes sorted by best first
 */
declare const getQuotes: (request: QuoteRequest, options?: AvnuOptions) => Promise<Quote[]>;
/**
 * Build calls for executing the trade through AVNU router
 * It allows trader to build the calls needed for executing the trade on AVNU router
 *
 * @param params The parameters to build the swap calls
 * @param params.quoteId The id of the selected quote
 * @param params.takerAddress Required when taker address was not provided during the quote request
 * @param params.slippage The maximum acceptable slippage of the buyAmount amount (required)
 * @param params.executeApprove If true, the response will contain the approve call. True by default
 * @param options Optional SDK configuration
 * @returns The SwapCalls containing the calls to execute the trade and the chainId
 */
declare const quoteToCalls: (params: QuoteToCallsParams, options?: AvnuOptions) => Promise<AvnuCalls>;
/**
 * Execute the swap transaction
 *
 * @param params The swap execution parameters
 * @param params.provider The account which will execute/sign the transaction, must implement the AccountInterface
 * @param params.paymaster The paymaster information, if needed
 * @param params.paymaster.active True if the tx must be executed through a paymaster
 * @param params.paymaster.provider The paymaster provider, must implement the PaymasterInterface
 * @param params.paymaster.params The paymaster parameters
 * @param params.quote The selected quote. See `getQuotes`
 * @param params.executeApprove False if the taker already executed `approve`. Defaults to true
 * @param params.slippage The maximum acceptable slippage for the trade
 * @param options Optional SDK configuration
 * @returns The transaction hash
 */
declare const executeSwap: (params: InvokeSwapParams, options?: AvnuOptions) => Promise<InvokeTransactionResponse>;
/**
 * Calculate the min amount received from amount and slippage
 *
 * @param amount The amount to apply slippage
 * @param slippage The slippage to apply as a decimal (0..1). 0.01 is 1%
 * @returns bigint
 */
declare const calculateMinReceivedAmount: (amount: bigint, slippage: number) => bigint;
/**
 * Calculate the max amount spent from amount and slippage
 *
 * @param amount The amount to apply slippage
 * @param slippage The slippage to apply as a decimal (0..1). 0.01 is 1%
 * @returns bigint
 */
declare const calculateMaxSpendAmount: (amount: bigint, slippage: number) => bigint;

/**
 * Fetches ERC-20 tokens from the API.
 * You can filter tokens by tags and search for specific tokens by name, symbol or address.
 *
 * @param request.page The page number
 * @param request.size The page size
 * @param request.search The search token name, symbol or address query
 * @param request.tags The tags to filter the tokens (see TokenTag enum)
 * @param options Optional SDK configuration
 * @returns The page of tokens corresponding to the request params
 */
declare const fetchTokens: (request?: GetTokensRequest, options?: AvnuOptions) => Promise<Page<Token>>;
/**
 * Fetch a token by address
 * @param tokenAddress The token address
 * @param options Optional SDK configuration
 * @returns The token if found
 */
declare const fetchTokenByAddress: (tokenAddress: string, options?: AvnuOptions) => Promise<Token>;
/**
 * Fetch a **verified** or **unruggable** token by symbol
 * @param symbol The token symbol
 * @param options Optional SDK configuration
 * @returns The **verified** or **unruggable** token if found
 */
declare const fetchVerifiedTokenBySymbol: (symbol: string, options?: AvnuOptions) => Promise<Token | undefined>;

declare const getBaseUrl: (options?: AvnuOptions) => string;
declare const getImpulseBaseUrl: (options?: AvnuOptions) => string;
declare const getRequest: (options?: AvnuOptions) => RequestInit;
declare const postRequest: (body: unknown, options?: AvnuOptions) => RequestInit;
/**
 * Parse API response
 * @param response The fetch Response object
 * @param avnuPublicKey Optional public key for signature verification
 * @returns The parsed response if the response is successful
 * @throws An error if the response is not successful
 */
declare const parseResponse: <T>(response: Response, avnuPublicKey?: string) => Promise<T>;
/**
 * Parse API response with Zod schema validation and transformation
 * @param response The fetch Response object
 * @param schema Zod schema for validation and transformation
 * @param avnuPublicKey Optional public key for signature verification
 * @returns Parsed and validated data
 */
declare const parseResponseWithSchema: <T extends z.ZodTypeAny>(response: Response, schema: T, avnuPublicKey?: string) => Promise<z.infer<T>>;

export { type Action, type ActionMetadata, type ActionType, type Apr, type AvnuCalls, type AvnuOptions, BASE_URL, type BuildPaymasterTransactionParams, type CancelDcaOrderMetadata, type CandleDataPoint, type ClaimRewardsToCallsParams, ContractError, type CreateDcaOrder, DCA_API_VERSION, type DataPoint, type DataPointWithUsd, type DcaOrder, type DcaOrderMetadata, DcaOrderStatus, type DcaTrade, type DcaTradeMetadata, DcaTradeStatus, type DelegationPool, type ExchangeDataPoint, type ExchangeRangeDataPoint, type ExecutePaymasterTransactionParams, type Fee, FeedDateRange, type FeedProps, FeedResolution, type GasFeeInfo, type GetDcaOrdersParams, type GetTokensRequest, type GlobalMarket, IMPULSE_API_VERSION, IMPULSE_BASE_URL, type InvokeCancelDcaParams, type InvokeClaimRewardsParams, type InvokeCreateDcaParams, type InvokeInitiateUnstakeParams, type InvokeParams, type InvokePaymasterParams, type InvokeStakeParams, type InvokeSwapParams, type InvokeTransactionResponse, type InvokeUnstakeParams, type MarketPrice, PRICES_API_VERSION, type Page, type Pageable, type PaymasterParams, type PriceFeedProps, PriceFeedType, type PricingStrategy, type Quote, type QuoteRequest, type QuoteToCallsParams, type RequestError, type Route, SEPOLIA_BASE_URL, SEPOLIA_IMPULSE_BASE_URL, STAKING_API_VERSION, SWAP_API_VERSION, type SignTransactionParams, type SignedPaymasterTransaction, type SimpleDateProps, type SimpleFeedProps, type Source, SourceType, type StakeToCallsParams, type StakingActionToCallsParams, type StakingCancelUnstakeMetadata, type StakingClaimRewardsMetadata, type StakingInfo, type StakingInitiateUnstakeMetadata, type StakingStakeMetadata, type StakingUnstakeMetadata, type StarknetMarket, type SwapMetadata, TOKEN_API_VERSION, type Token, type TokenMarketData, type TokenPrice, type TokenPriceResponse, type TokenTag, type UnstakeToCallsParams, type UserStakingInfo, VolumeFeedType, aAvnuCalls, aCall, aCandleDataPoint, aDCACreateOrder, aDCAOrder, aDataPoint, aDataPointWithUsd, aDelegationPool, aGlobalMarket, aPage, aPreparedTypedData, aPrice, aPriceRequest, aQuote, aQuoteRequest, aQuoteWithManyComplexRoutes, aQuoteWithManySubRoutes, aSignedPaymasterTransaction, aSource, aStakingInfo, aStarknetMarket, aTokenMarketData, aUserStakingInfo, anAction, anApr, anExchangeDataPoint, anExchangeRangeDataPoint, anInvokeTransactionResponse, btcToken, buildPaymasterTransaction, calculateMaxSpendAmount, calculateMinReceivedAmount, cancelDcaToCalls, claimRewardsToCalls, createDcaToCalls, ethToken, executeAllPaymasterFlow, executeCancelDca, executeClaimRewards, executeCreateDca, executeInitiateUnstake, executePaymasterTransaction, executeStake, executeSwap, executeUnstake, fetchTokenByAddress, fetchTokens, fetchVerifiedTokenBySymbol, getAvnuStakingInfo, getBaseUrl, getDcaOrders, getExchangeTVLFeed, getExchangeVolumeFeed, getImpulseBaseUrl, getLastPageNumber, getMarketData, getPriceFeed, getPrices, getQuotes, getRequest, getSources, getTVLByExchange, getTokenMarketData, getTransferVolumeFeed, getUserStakingInfo, getVolumeByExchange, initiateUnstakeToCalls, parseResponse, parseResponseWithSchema, postRequest, quoteToCalls, signPaymasterTransaction, stakeToCalls, unstakeToCalls };
