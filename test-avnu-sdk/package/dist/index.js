"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  BASE_URL: () => BASE_URL,
  ContractError: () => ContractError,
  DCA_API_VERSION: () => DCA_API_VERSION,
  DcaOrderStatus: () => DcaOrderStatus,
  DcaTradeStatus: () => DcaTradeStatus,
  FeedDateRange: () => FeedDateRange,
  FeedResolution: () => FeedResolution,
  IMPULSE_API_VERSION: () => IMPULSE_API_VERSION,
  IMPULSE_BASE_URL: () => IMPULSE_BASE_URL,
  PRICES_API_VERSION: () => PRICES_API_VERSION,
  PriceFeedType: () => PriceFeedType,
  SEPOLIA_BASE_URL: () => SEPOLIA_BASE_URL,
  SEPOLIA_IMPULSE_BASE_URL: () => SEPOLIA_IMPULSE_BASE_URL,
  STAKING_API_VERSION: () => STAKING_API_VERSION,
  SWAP_API_VERSION: () => SWAP_API_VERSION,
  SourceType: () => SourceType,
  TOKEN_API_VERSION: () => TOKEN_API_VERSION,
  VolumeFeedType: () => VolumeFeedType,
  aAvnuCalls: () => aAvnuCalls,
  aCall: () => aCall,
  aCandleDataPoint: () => aCandleDataPoint,
  aDCACreateOrder: () => aDCACreateOrder,
  aDCAOrder: () => aDCAOrder,
  aDataPoint: () => aDataPoint,
  aDataPointWithUsd: () => aDataPointWithUsd,
  aDelegationPool: () => aDelegationPool,
  aGlobalMarket: () => aGlobalMarket,
  aPage: () => aPage,
  aPreparedTypedData: () => aPreparedTypedData,
  aPrice: () => aPrice,
  aPriceRequest: () => aPriceRequest,
  aQuote: () => aQuote,
  aQuoteRequest: () => aQuoteRequest,
  aQuoteWithManyComplexRoutes: () => aQuoteWithManyComplexRoutes,
  aQuoteWithManySubRoutes: () => aQuoteWithManySubRoutes,
  aSignedPaymasterTransaction: () => aSignedPaymasterTransaction,
  aSource: () => aSource,
  aStakingInfo: () => aStakingInfo,
  aStarknetMarket: () => aStarknetMarket,
  aTokenMarketData: () => aTokenMarketData,
  aUserStakingInfo: () => aUserStakingInfo,
  anAction: () => anAction,
  anApr: () => anApr,
  anExchangeDataPoint: () => anExchangeDataPoint,
  anExchangeRangeDataPoint: () => anExchangeRangeDataPoint,
  anInvokeTransactionResponse: () => anInvokeTransactionResponse,
  btcToken: () => btcToken,
  buildPaymasterTransaction: () => buildPaymasterTransaction,
  calculateMaxSpendAmount: () => calculateMaxSpendAmount,
  calculateMinReceivedAmount: () => calculateMinReceivedAmount,
  cancelDcaToCalls: () => cancelDcaToCalls,
  claimRewardsToCalls: () => claimRewardsToCalls,
  createDcaToCalls: () => createDcaToCalls,
  ethToken: () => ethToken,
  executeAllPaymasterFlow: () => executeAllPaymasterFlow,
  executeCancelDca: () => executeCancelDca,
  executeClaimRewards: () => executeClaimRewards,
  executeCreateDca: () => executeCreateDca,
  executeInitiateUnstake: () => executeInitiateUnstake,
  executePaymasterTransaction: () => executePaymasterTransaction,
  executeStake: () => executeStake,
  executeSwap: () => executeSwap,
  executeUnstake: () => executeUnstake,
  fetchTokenByAddress: () => fetchTokenByAddress,
  fetchTokens: () => fetchTokens,
  fetchVerifiedTokenBySymbol: () => fetchVerifiedTokenBySymbol,
  getAvnuStakingInfo: () => getAvnuStakingInfo,
  getBaseUrl: () => getBaseUrl,
  getDcaOrders: () => getDcaOrders,
  getExchangeTVLFeed: () => getExchangeTVLFeed,
  getExchangeVolumeFeed: () => getExchangeVolumeFeed,
  getImpulseBaseUrl: () => getImpulseBaseUrl,
  getLastPageNumber: () => getLastPageNumber,
  getMarketData: () => getMarketData,
  getPriceFeed: () => getPriceFeed,
  getPrices: () => getPrices,
  getQuotes: () => getQuotes,
  getRequest: () => getRequest,
  getSources: () => getSources,
  getTVLByExchange: () => getTVLByExchange,
  getTokenMarketData: () => getTokenMarketData,
  getTransferVolumeFeed: () => getTransferVolumeFeed,
  getUserStakingInfo: () => getUserStakingInfo,
  getVolumeByExchange: () => getVolumeByExchange,
  initiateUnstakeToCalls: () => initiateUnstakeToCalls,
  parseResponse: () => parseResponse,
  parseResponseWithSchema: () => parseResponseWithSchema,
  postRequest: () => postRequest,
  quoteToCalls: () => quoteToCalls,
  signPaymasterTransaction: () => signPaymasterTransaction,
  stakeToCalls: () => stakeToCalls,
  unstakeToCalls: () => unstakeToCalls
});
module.exports = __toCommonJS(src_exports);

// src/constants.ts
var SEPOLIA_BASE_URL = "https://sepolia.api.avnu.fi";
var BASE_URL = "https://starknet.api.avnu.fi";
var IMPULSE_BASE_URL = "https://starknet.impulse.avnu.fi";
var SEPOLIA_IMPULSE_BASE_URL = "https://sepolia.impulse.avnu.fi";
var TOKEN_API_VERSION = "v1";
var IMPULSE_API_VERSION = "v3";
var SWAP_API_VERSION = "v3";
var PRICES_API_VERSION = "v3";
var STAKING_API_VERSION = "v3";
var DCA_API_VERSION = "v3";

// src/dca.services.ts
var import_qs = __toESM(require("qs"));

// src/paymaster.services.ts
var import_ethers = require("ethers");
var buildPaymasterTransaction = async (params) => {
  const { takerAddress, paymaster, calls } = params;
  return paymaster.provider.buildTransaction(
    { type: "invoke", invoke: { userAddress: takerAddress, calls } },
    paymaster.params
  );
};
var signPaymasterTransaction = async (params) => {
  const { provider, typedData } = params;
  const rawSignature = await provider.signMessage(typedData);
  let signature = [];
  if (Array.isArray(rawSignature)) {
    signature = rawSignature.map((sig) => (0, import_ethers.toBeHex)(BigInt(sig)));
  } else if (rawSignature.r && rawSignature.s) {
    signature = [(0, import_ethers.toBeHex)(BigInt(rawSignature.r)), (0, import_ethers.toBeHex)(BigInt(rawSignature.s))];
  }
  return {
    typedData,
    signature
  };
};
var executePaymasterTransaction = async (params) => {
  const { takerAddress, paymaster, signedTransaction } = params;
  const { provider, params: executionParams } = paymaster;
  const { typedData, signature } = signedTransaction;
  return provider.executeTransaction(
    {
      type: "invoke",
      invoke: { userAddress: takerAddress, typedData, signature }
    },
    executionParams
  ).then((result) => ({ transactionHash: result.transaction_hash }));
};
var executeAllPaymasterFlow = async ({
  paymaster,
  provider,
  calls
}) => {
  const prepared = await buildPaymasterTransaction({
    takerAddress: provider.address,
    paymaster,
    calls
  });
  const signed = await signPaymasterTransaction({
    provider,
    typedData: prepared.typed_data
  });
  return executePaymasterTransaction({
    takerAddress: provider.address,
    paymaster,
    signedTransaction: signed
  });
};

// src/schemas.ts
var import_zod = require("zod");

// src/enums.ts
var FeedDateRange = /* @__PURE__ */ ((FeedDateRange2) => {
  FeedDateRange2["ONE_HOUR"] = "1H";
  FeedDateRange2["ONE_DAY"] = "1D";
  FeedDateRange2["ONE_WEEK"] = "1W";
  FeedDateRange2["ONE_MONTH"] = "1M";
  FeedDateRange2["ONE_YEAR"] = "1Y";
  return FeedDateRange2;
})(FeedDateRange || {});
var PriceFeedType = /* @__PURE__ */ ((PriceFeedType2) => {
  PriceFeedType2["LINE"] = "LINE";
  PriceFeedType2["CANDLE"] = "CANDLE";
  return PriceFeedType2;
})(PriceFeedType || {});
var VolumeFeedType = /* @__PURE__ */ ((VolumeFeedType2) => {
  VolumeFeedType2["LINE"] = "LINE";
  VolumeFeedType2["BAR"] = "BAR";
  return VolumeFeedType2;
})(VolumeFeedType || {});
var FeedResolution = /* @__PURE__ */ ((FeedResolution2) => {
  FeedResolution2["ONE_MIN"] = "1";
  FeedResolution2["FIVE_MIN"] = "5";
  FeedResolution2["FIFTEEN_MIN"] = "15";
  FeedResolution2["HOURLY"] = "1H";
  FeedResolution2["FOUR_HOUR"] = "4H";
  FeedResolution2["DAILY"] = "1D";
  FeedResolution2["WEEKLY"] = "1W";
  FeedResolution2["MONTHLY"] = "1M";
  FeedResolution2["YEARLY"] = "1Y";
  return FeedResolution2;
})(FeedResolution || {});
var SourceType = /* @__PURE__ */ ((SourceType2) => {
  SourceType2["DEX"] = "DEX";
  SourceType2["MARKET_MAKER"] = "MARKET_MAKER";
  SourceType2["TOKEN_WRAPPER"] = "TOKEN_WRAPPER";
  SourceType2["ORDERBOOK"] = "ORDERBOOK";
  return SourceType2;
})(SourceType || {});
var DcaTradeStatus = /* @__PURE__ */ ((DcaTradeStatus2) => {
  DcaTradeStatus2["CANCELLED"] = "CANCELLED";
  DcaTradeStatus2["PENDING"] = "PENDING";
  DcaTradeStatus2["SUCCEEDED"] = "SUCCEEDED";
  return DcaTradeStatus2;
})(DcaTradeStatus || {});
var DcaOrderStatus = /* @__PURE__ */ ((DcaOrderStatus2) => {
  DcaOrderStatus2["INDEXING"] = "INDEXING";
  DcaOrderStatus2["ACTIVE"] = "ACTIVE";
  DcaOrderStatus2["CLOSED"] = "CLOSED";
  return DcaOrderStatus2;
})(DcaOrderStatus || {});

// src/schemas.ts
var hexToBigInt = import_zod.z.union([import_zod.z.string(), import_zod.z.number(), import_zod.z.bigint()]).transform((val) => {
  if (typeof val === "bigint") return val;
  return BigInt(val);
});
var hexToNumber = import_zod.z.union([import_zod.z.string(), import_zod.z.number(), import_zod.z.bigint()]).transform((val) => {
  if (typeof val === "number") return val;
  return Number(val);
});
var isoStringToDate = import_zod.z.string().transform((val) => new Date(val));
var hexTimestampToDate = import_zod.z.union([import_zod.z.string(), import_zod.z.number(), import_zod.z.null(), import_zod.z.undefined()]).transform((val) => {
  if (val === null || val === void 0) return void 0;
  if (typeof val === "string") {
    return new Date(parseInt(val, 16) * 1e3);
  }
  return new Date(val * 1e3);
});
var TokenSchema = import_zod.z.object({
  address: import_zod.z.string(),
  name: import_zod.z.string(),
  symbol: import_zod.z.string(),
  decimals: import_zod.z.number(),
  logoUri: import_zod.z.string().nullable(),
  lastDailyVolumeUsd: import_zod.z.number(),
  extensions: import_zod.z.record(import_zod.z.string(), import_zod.z.string()),
  tags: import_zod.z.array(import_zod.z.enum(["Unknown", "Verified", "Community", "Unruggable", "AVNU"]))
});
var SourceTypeSchema = import_zod.z.enum(SourceType);
var SourceSchema = import_zod.z.object({
  name: import_zod.z.string(),
  type: SourceTypeSchema
});
var DcaTradeStatusSchema = import_zod.z.enum(DcaTradeStatus);
var DcaTradeSchema = import_zod.z.object({
  sellAmount: hexToBigInt,
  sellAmountInUsd: import_zod.z.number().optional(),
  buyAmount: hexToBigInt.optional(),
  buyAmountInUsd: import_zod.z.number().optional(),
  expectedTradeDate: isoStringToDate,
  actualTradeDate: isoStringToDate.optional(),
  status: DcaTradeStatusSchema,
  txHash: import_zod.z.string().optional(),
  errorReason: import_zod.z.string().optional()
});
var DcaOrderStatusSchema = import_zod.z.enum(DcaOrderStatus);
var PricingStrategySchema = import_zod.z.union([
  import_zod.z.object({
    tokenToMinAmount: import_zod.z.string().or(import_zod.z.undefined()),
    tokenToMaxAmount: import_zod.z.string().or(import_zod.z.undefined())
  }),
  import_zod.z.object({}).strict()
]);
var DcaOrderSchema = import_zod.z.object({
  id: import_zod.z.string(),
  blockNumber: import_zod.z.number(),
  timestamp: isoStringToDate,
  traderAddress: import_zod.z.string(),
  orderAddress: import_zod.z.string(),
  creationTransactionHash: import_zod.z.string(),
  orderClassHash: import_zod.z.string(),
  sellTokenAddress: import_zod.z.string(),
  sellAmount: hexToBigInt,
  sellAmountPerCycle: hexToBigInt,
  buyTokenAddress: import_zod.z.string(),
  startDate: isoStringToDate,
  endDate: isoStringToDate,
  closeDate: isoStringToDate.optional(),
  frequency: import_zod.z.string(),
  iterations: import_zod.z.number(),
  status: DcaOrderStatusSchema,
  pricingStrategy: PricingStrategySchema,
  amountSold: hexToBigInt,
  amountBought: hexToBigInt,
  averageAmountBought: hexToBigInt,
  executedTradesCount: import_zod.z.number(),
  cancelledTradesCount: import_zod.z.number(),
  pendingTradesCount: import_zod.z.number(),
  trades: import_zod.z.array(DcaTradeSchema)
});
var RouteSchema = import_zod.z.lazy(
  () => import_zod.z.object({
    name: import_zod.z.string(),
    address: import_zod.z.string(),
    percent: import_zod.z.number(),
    sellTokenAddress: import_zod.z.string(),
    buyTokenAddress: import_zod.z.string(),
    routeInfo: import_zod.z.record(import_zod.z.string(), import_zod.z.string()).optional(),
    routes: import_zod.z.array(RouteSchema),
    alternativeSwapCount: import_zod.z.number()
  })
);
var FeeSchema = import_zod.z.object({
  feeToken: import_zod.z.string(),
  avnuFees: hexToBigInt,
  avnuFeesInUsd: import_zod.z.number(),
  avnuFeesBps: hexToBigInt,
  integratorFees: hexToBigInt,
  integratorFeesInUsd: import_zod.z.number(),
  integratorFeesBps: hexToBigInt
});
var QuoteSchema = import_zod.z.object({
  quoteId: import_zod.z.string(),
  sellTokenAddress: import_zod.z.string(),
  sellAmount: hexToBigInt,
  sellAmountInUsd: import_zod.z.number(),
  buyTokenAddress: import_zod.z.string(),
  buyAmount: hexToBigInt,
  buyAmountInUsd: import_zod.z.number(),
  fee: FeeSchema,
  blockNumber: hexToNumber.optional(),
  chainId: import_zod.z.string(),
  expiry: import_zod.z.number().optional().nullable(),
  routes: import_zod.z.array(RouteSchema),
  gasFees: hexToBigInt,
  gasFeesInUsd: import_zod.z.number().optional(),
  priceImpact: import_zod.z.number(),
  sellTokenPriceInUsd: import_zod.z.number().optional(),
  buyTokenPriceInUsd: import_zod.z.number().optional(),
  exactTokenTo: import_zod.z.boolean().optional(),
  estimatedSlippage: import_zod.z.number().optional()
});
var GasFeeInfoSchema = import_zod.z.object({
  gasFeeAmount: hexToBigInt.optional(),
  gasFeeAmountUsd: import_zod.z.number().optional(),
  gasFeeTokenAddress: import_zod.z.string().optional()
});
var SwapMetadataSchema = import_zod.z.object({
  sellTokenAddress: import_zod.z.string(),
  sellAmount: hexToBigInt,
  sellAmountUsd: import_zod.z.number().optional(),
  buyTokenAddress: import_zod.z.string(),
  buyAmount: hexToBigInt,
  buyAmountUsd: import_zod.z.number().optional(),
  integratorName: import_zod.z.string().optional()
});
var DcaOrderMetadataSchema = import_zod.z.object({
  orderClassHash: import_zod.z.string(),
  orderAddress: import_zod.z.string(),
  sellTokenAddress: import_zod.z.string(),
  sellAmount: hexToBigInt,
  sellAmountUsd: import_zod.z.number().optional(),
  sellAmountPerCycle: hexToBigInt,
  buyTokenAddress: import_zod.z.string(),
  cycleFrequency: hexToBigInt,
  startDate: isoStringToDate,
  endDate: isoStringToDate
});
var CancelDcaOrderMetadataSchema = import_zod.z.object({
  orderAddress: import_zod.z.string()
});
var DcaTradeMetadataSchema = import_zod.z.object({
  sellTokenAddress: import_zod.z.string(),
  sellAmount: hexToBigInt,
  sellAmountUsd: import_zod.z.number().optional(),
  buyTokenAddress: import_zod.z.string(),
  buyAmount: hexToBigInt,
  buyAmountUsd: import_zod.z.number().optional()
});
var StakingInitiateUnstakeMetadataSchema = import_zod.z.object({
  delegationPoolAddress: import_zod.z.string(),
  exitTimestamp: isoStringToDate,
  amount: hexToBigInt,
  amountUsd: import_zod.z.number().optional(),
  oldDelegatedStake: hexToBigInt,
  oldDelegatedStakeUsd: import_zod.z.number().optional(),
  newDelegatedStake: hexToBigInt,
  newDelegatedStakeUsd: import_zod.z.number().optional()
});
var StakingCancelUnstakeMetadataSchema = import_zod.z.object({
  delegationPoolAddress: import_zod.z.string(),
  oldDelegatedStake: hexToBigInt,
  oldDelegatedStakeUsd: import_zod.z.number().optional(),
  newDelegatedStake: hexToBigInt,
  newDelegatedStakeUsd: import_zod.z.number().optional()
});
var StakingStakeMetadataSchema = import_zod.z.object({
  delegationPoolAddress: import_zod.z.string(),
  oldDelegatedStake: hexToBigInt,
  oldDelegatedStakeUsd: import_zod.z.number().optional(),
  newDelegatedStake: hexToBigInt,
  newDelegatedStakeUsd: import_zod.z.number().optional()
});
var StakingClaimRewardsMetadataSchema = import_zod.z.object({
  delegationPoolAddress: import_zod.z.string(),
  rewardAddress: import_zod.z.string(),
  amount: hexToBigInt,
  amountUsd: import_zod.z.number().optional()
});
var StakingUnstakeMetadataSchema = import_zod.z.object({
  delegationPoolAddress: import_zod.z.string(),
  amount: hexToBigInt,
  amountUsd: import_zod.z.number().optional()
});
var ActionMetadataSchema = import_zod.z.union([
  SwapMetadataSchema,
  DcaOrderMetadataSchema,
  CancelDcaOrderMetadataSchema,
  DcaTradeMetadataSchema,
  StakingInitiateUnstakeMetadataSchema,
  StakingCancelUnstakeMetadataSchema,
  StakingStakeMetadataSchema,
  StakingClaimRewardsMetadataSchema,
  StakingUnstakeMetadataSchema
]);
var ActionTypeSchema = import_zod.z.enum([
  "Swap",
  "OpenDcaOrder",
  "CancelDcaOrder",
  "DcaTrade",
  "StakingStake",
  "StakingInitiateWithdrawal",
  "StakingCancelWithdrawal",
  "StakingWithdraw",
  "StakingClaimRewards"
]);
var ActionSchema = import_zod.z.object({
  blockNumber: hexToBigInt,
  date: isoStringToDate,
  transactionHash: import_zod.z.string(),
  gasFee: GasFeeInfoSchema.nullable(),
  type: ActionTypeSchema,
  metadata: ActionMetadataSchema
});
var AprSchema = import_zod.z.object({
  date: isoStringToDate,
  apr: import_zod.z.number()
});
var UserStakingInfoSchema = import_zod.z.object({
  tokenAddress: import_zod.z.string(),
  tokenPriceInUsd: import_zod.z.number(),
  poolAddress: import_zod.z.string(),
  userAddress: import_zod.z.string(),
  amount: hexToBigInt,
  amountInUsd: import_zod.z.number().or(import_zod.z.undefined()),
  unclaimedRewards: hexToBigInt,
  unclaimedRewardsInUsd: import_zod.z.number().or(import_zod.z.undefined()),
  unpoolAmount: hexToBigInt,
  unpoolAmountInUsd: import_zod.z.number().or(import_zod.z.undefined()),
  unpoolTime: hexTimestampToDate,
  totalClaimedRewards: hexToBigInt,
  totalClaimedRewardsHistoricalUsd: import_zod.z.number().optional(),
  totalClaimedRewardsUsd: import_zod.z.number(),
  userActions: import_zod.z.array(ActionSchema),
  totalUserActionsCount: import_zod.z.number(),
  expectedYearlyStrkRewards: hexToBigInt,
  aprs: import_zod.z.array(AprSchema)
});
var DelegationPoolSchema = import_zod.z.object({
  poolAddress: import_zod.z.string(),
  tokenAddress: import_zod.z.string(),
  stakedAmount: hexToBigInt,
  stakedAmountInUsd: import_zod.z.number().or(import_zod.z.undefined()),
  apr: import_zod.z.number()
});
var StakingInfoSchema = import_zod.z.object({
  selfStakedAmount: hexToBigInt,
  selfStakedAmountInUsd: import_zod.z.number().or(import_zod.z.undefined()),
  operationalAddress: import_zod.z.string(),
  rewardAddress: import_zod.z.string(),
  stakerAddress: import_zod.z.string(),
  commission: import_zod.z.number(),
  delegationPools: import_zod.z.array(DelegationPoolSchema)
});
var StarknetMarketSchema = import_zod.z.object({
  usd: import_zod.z.number(),
  usdTvl: import_zod.z.number(),
  usdPriceChange1h: import_zod.z.number(),
  usdPriceChangePercentage1h: import_zod.z.number().nullable(),
  usdPriceChange24h: import_zod.z.number(),
  usdPriceChangePercentage24h: import_zod.z.number().nullable(),
  usdPriceChange7d: import_zod.z.number(),
  usdPriceChangePercentage7d: import_zod.z.number().nullable(),
  usdVolume24h: import_zod.z.number(),
  usdTradingVolume24h: import_zod.z.number()
});
var GlobalMarketSchema = import_zod.z.object({
  usd: import_zod.z.number(),
  usdMarketCap: import_zod.z.number(),
  usdFdv: import_zod.z.number(),
  usdMarketCapChange24h: import_zod.z.number(),
  usdMarketCapChangePercentage24h: import_zod.z.number()
});
var DataPointSchema = import_zod.z.object({
  date: import_zod.z.string(),
  value: import_zod.z.number()
});
var DataPointWithUsdSchema = import_zod.z.object({
  date: import_zod.z.string(),
  value: import_zod.z.number(),
  valueUsd: import_zod.z.number()
});
var ExchangeDataPointSchema = import_zod.z.object({
  date: import_zod.z.string(),
  value: import_zod.z.number(),
  valueUsd: import_zod.z.number(),
  exchange: import_zod.z.string()
});
var ExchangeRangeDataPointSchema = import_zod.z.object({
  value: import_zod.z.number(),
  valueUsd: import_zod.z.number(),
  exchange: import_zod.z.string(),
  startDate: import_zod.z.string(),
  endDate: import_zod.z.string()
});
var CandleDataPointSchema = import_zod.z.object({
  date: import_zod.z.string(),
  close: import_zod.z.number(),
  high: import_zod.z.number(),
  low: import_zod.z.number(),
  open: import_zod.z.number(),
  volume: import_zod.z.number()
});
var TokenMarketDataSchema = import_zod.z.object({
  name: import_zod.z.string(),
  symbol: import_zod.z.string(),
  address: import_zod.z.string(),
  decimals: import_zod.z.number(),
  logoUri: import_zod.z.string().nullable().optional(),
  coingeckoId: import_zod.z.string().nullable().optional(),
  verified: import_zod.z.boolean(),
  starknet: StarknetMarketSchema,
  global: GlobalMarketSchema.nullable(),
  tags: import_zod.z.array(import_zod.z.enum(["Unknown", "Verified", "Community", "Unruggable", "AVNU"])).default([]),
  linePriceFeedInUsd: import_zod.z.array(DataPointSchema).default([])
});
var MarketPriceSchema = import_zod.z.object({
  usd: import_zod.z.number()
});
var TokenPriceSchema = import_zod.z.object({
  address: import_zod.z.string(),
  decimals: import_zod.z.number(),
  globalMarket: MarketPriceSchema.nullable(),
  starknetMarket: MarketPriceSchema.nullable()
});
var PageSchema = (contentSchema) => import_zod.z.object({
  content: import_zod.z.array(contentSchema),
  totalPages: import_zod.z.number(),
  totalElements: import_zod.z.number(),
  size: import_zod.z.number(),
  number: import_zod.z.number()
});

// src/utils.ts
var import_starknet = require("starknet");
var import_zod2 = require("zod");

// src/types.ts
var getLastPageNumber = (page) => page ? Math.ceil(page.totalElements / page.size) - 1 : 0;
var ContractError = class extends Error {
  constructor(message, revertError) {
    super(message);
    this.revertError = revertError;
  }
};

// src/utils.ts
var getBaseUrl = (options) => options?.baseUrl ?? BASE_URL;
var getImpulseBaseUrl = (options) => options?.impulseBaseUrl ?? IMPULSE_BASE_URL;
var getRequest = (options) => ({
  signal: options?.abortSignal,
  headers: {
    ...options?.avnuPublicKey !== void 0 && { "ask-signature": "true" }
  }
});
var postRequest = (body, options) => ({
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...options?.avnuPublicKey && { "ask-signature": "true" }
  },
  ...body !== void 0 && { body: JSON.stringify(body) }
});
var parseResponse = (response, avnuPublicKey) => {
  if (response.status === 400) {
    return response.json().then((error) => {
      throw new Error(error.messages[0]);
    });
  }
  if (response.status === 500) {
    return response.json().then((error) => {
      if (error.messages.length >= 0 && error.messages[0].includes("Contract error")) {
        throw new ContractError(error.messages[0], error.revertError || "");
      } else {
        throw new Error(error.messages[0]);
      }
    });
  }
  if (response.status > 400) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  if (avnuPublicKey) {
    const signature = response.headers.get("signature");
    if (!signature) throw new Error("No server signature");
    return response.clone().text().then((textResponse) => {
      const hashResponse = import_starknet.hash.computeHashOnElements([import_starknet.hash.starknetKeccak(textResponse)]);
      const formattedSig = signature.split(",").map((s) => BigInt(s));
      const signatureType = new import_starknet.ec.starkCurve.Signature(formattedSig[0], formattedSig[1]);
      if (!import_starknet.ec.starkCurve.verify(signatureType, hashResponse, avnuPublicKey))
        throw new Error("Invalid server signature");
    }).then(() => response.json());
  }
  return response.json();
};
var parseResponseWithSchema = (response, schema, avnuPublicKey) => {
  return parseResponse(response, avnuPublicKey).then((data) => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof import_zod2.z.ZodError) {
        throw new Error(`Invalid API response: ${error.message}`);
      }
      throw error;
    }
  });
};

// src/dca.services.ts
var getDcaOrders = async ({ traderAddress, status, page, size, sort }, options) => {
  const params = import_qs.default.stringify({ traderAddress, status, page, size, sort }, { arrayFormat: "repeat" });
  return fetch(`${getBaseUrl(options)}/dca/${DCA_API_VERSION}/orders?${params}`, getRequest(options)).then(
    (response) => parseResponseWithSchema(response, PageSchema(DcaOrderSchema), options?.avnuPublicKey)
  );
};
var actionToCalls = async (endpoint, body, options) => {
  return fetch(
    `${getBaseUrl(options)}/dca/${DCA_API_VERSION}/orders${endpoint ? `/${endpoint}` : ""}`,
    postRequest(body, options)
  ).then((response) => parseResponse(response, options?.avnuPublicKey));
};
var createDcaToCalls = async (order, options) => actionToCalls("", order, options);
var cancelDcaToCalls = async (orderAddress, options) => actionToCalls(`${orderAddress}/cancel`, void 0, options);
var executeCreateDca = async (params, options) => {
  const { provider, paymaster, order } = params;
  const { calls } = await createDcaToCalls(order, options);
  if (paymaster && paymaster.active) {
    return executeAllPaymasterFlow({ paymaster, provider, calls });
  }
  const result = await provider.execute(calls);
  return { transactionHash: result.transaction_hash };
};
var executeCancelDca = async (params, options) => {
  const { provider, paymaster, orderAddress } = params;
  const { calls } = await cancelDcaToCalls(orderAddress, options);
  if (paymaster && paymaster.active) {
    return executeAllPaymasterFlow({ paymaster, provider, calls });
  }
  const result = await provider.execute(calls);
  return { transactionHash: result.transaction_hash };
};

// src/fixtures.ts
var import_ethers2 = require("ethers");
var import_moment = __toESM(require("moment"));
var import_starknet2 = require("starknet");
var aPriceRequest = () => ({
  tokens: ["0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"]
});
var aQuoteRequest = () => ({
  sellTokenAddress: "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  sellAmount: (0, import_ethers2.parseUnits)("1", 18),
  buyTokenAddress: "0x72df4dc5b6c4df72e4288857317caf2ce9da166ab8719ab8306516a2fddfff7",
  size: 1,
  takerAddress: "0x0"
});
var aPrice = () => ({
  address: "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  decimals: 18,
  globalMarket: { usd: 1700 },
  starknetMarket: { usd: 1700 }
});
var aQuote = () => ({
  quoteId: "quoteId",
  sellTokenAddress: "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  sellAmount: (0, import_ethers2.parseUnits)("1", 18),
  sellAmountInUsd: 1700,
  buyTokenAddress: "0x72df4dc5b6c4df72e4288857317caf2ce9da166ab8719ab8306516a2fddfff7",
  buyAmount: (0, import_ethers2.parseUnits)("2", 18),
  buyAmountInUsd: 1700,
  blockNumber: 1,
  chainId: import_starknet2.constants.StarknetChainId.SN_SEPOLIA,
  expiry: 1e11,
  routes: [
    {
      name: "AMM1",
      address: "0x975910cd99bc56bd289eaaa5cee6cd557f0ddafdb2ce6ebea15b158eb2c661",
      percent: 1,
      sellTokenAddress: "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      buyTokenAddress: "0x72df4dc5b6c4df72e4288857317caf2ce9da166ab8719ab8306516a2fddfff7",
      routes: [],
      alternativeSwapCount: 0
    }
  ],
  gasFees: BigInt("0x0"),
  gasFeesInUsd: 0,
  fee: {
    feeToken: "0x0",
    avnuFees: BigInt("0x0"),
    avnuFeesInUsd: 0,
    avnuFeesBps: BigInt("0x0"),
    integratorFees: BigInt("0x0"),
    integratorFeesInUsd: 0,
    integratorFeesBps: BigInt("0x0")
  },
  priceImpact: 0
});
var aQuoteWithManySubRoutes = () => ({
  quoteId: "quoteId",
  sellTokenAddress: "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  sellAmount: (0, import_ethers2.parseUnits)("1", 18),
  sellAmountInUsd: 1700,
  buyTokenAddress: "0x72df4dc5b6c4df72e4288857317caf2ce9da166ab8719ab8306516a2fddfff7",
  buyAmount: (0, import_ethers2.parseUnits)("2", 18),
  buyAmountInUsd: 1700,
  fee: {
    feeToken: "0x0",
    avnuFees: BigInt("0x0"),
    avnuFeesInUsd: 0,
    avnuFeesBps: BigInt("0x0"),
    integratorFees: BigInt("0x0"),
    integratorFeesInUsd: 0,
    integratorFeesBps: BigInt("0x0")
  },
  blockNumber: 1,
  chainId: import_starknet2.constants.StarknetChainId.SN_SEPOLIA,
  expiry: 1e11,
  priceImpact: 0,
  routes: [
    {
      name: "AMM1",
      address: "0x975910cd99bc56bd289eaaa5cee6cd557f0ddafdb2ce6ebea15b158eb2c661",
      percent: 1,
      sellTokenAddress: "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      buyTokenAddress: "0x3e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9",
      alternativeSwapCount: 0,
      routes: [
        {
          name: "AMM2",
          address: "0x975910cd99bc56bd289eaaa5cee6cd557f0ddafdb2ce6ebea15b158eb2c662",
          percent: 1,
          sellTokenAddress: "0x3e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9",
          buyTokenAddress: "0x2e2faab2cad8ecdde5e991798673ddcc08983b872304a66e5f99fbb24e14abc",
          alternativeSwapCount: 0,
          routes: [
            {
              name: "AMM1",
              address: "0x975910cd99bc56bd289eaaa5cee6cd557f0ddafdb2ce6ebea15b158eb2c661",
              percent: 1,
              sellTokenAddress: "0x2e2faab2cad8ecdde5e991798673ddcc08983b872304a66e5f99fbb24e14abc",
              buyTokenAddress: "0x72df4dc5b6c4df72e4288857317caf2ce9da166ab8719ab8306516a2fddfff7",
              routes: [],
              alternativeSwapCount: 0
            }
          ]
        }
      ]
    }
  ],
  gasFees: BigInt("0x0"),
  gasFeesInUsd: 0
});
var aQuoteWithManyComplexRoutes = () => ({
  quoteId: "quoteId",
  sellTokenAddress: "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  sellAmount: (0, import_ethers2.parseUnits)("1", 18),
  sellAmountInUsd: 1700,
  buyTokenAddress: "0x72df4dc5b6c4df72e4288857317caf2ce9da166ab8719ab8306516a2fddfff7",
  buyAmount: (0, import_ethers2.parseUnits)("2", 18),
  buyAmountInUsd: 1700,
  fee: {
    feeToken: "0x0",
    avnuFees: BigInt("0x0"),
    avnuFeesInUsd: 0,
    avnuFeesBps: BigInt("0x0"),
    integratorFees: BigInt("0x0"),
    integratorFeesInUsd: 0,
    integratorFeesBps: BigInt("0x0")
  },
  blockNumber: 1,
  chainId: import_starknet2.constants.StarknetChainId.SN_SEPOLIA,
  expiry: 1e11,
  gasFees: BigInt("0x0"),
  gasFeesInUsd: 0,
  priceImpact: 0,
  routes: [
    {
      name: "AMM1",
      address: "0x975910cd99bc56bd289eaaa5cee6cd557f0ddafdb2ce6ebea15b158eb2c661",
      percent: 0.5,
      sellTokenAddress: "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      buyTokenAddress: "0x3e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9",
      alternativeSwapCount: 0,
      routes: [
        {
          name: "AMM2",
          address: "0x975910cd99bc56bd289eaaa5cee6cd557f0ddafdb2ce6ebea15b158eb2c662",
          percent: 0.5,
          sellTokenAddress: "0x3e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9",
          buyTokenAddress: "0x2e2faab2cad8ecdde5e991798673ddcc08983b872304a66e5f99fbb24e14abc",
          alternativeSwapCount: 0,
          routes: [
            {
              name: "AMM1",
              address: "0x975910cd99bc56bd289eaaa5cee6cd557f0ddafdb2ce6ebea15b158eb2c661",
              percent: 1,
              sellTokenAddress: "0x2e2faab2cad8ecdde5e991798673ddcc08983b872304a66e5f99fbb24e14abc",
              buyTokenAddress: "0x72df4dc5b6c4df72e4288857317caf2ce9da166ab8719ab8306516a2fddfff7",
              routes: [],
              alternativeSwapCount: 0
            }
          ]
        },
        {
          name: "AMM1",
          address: "0x975910cd99bc56bd289eaaa5cee6cd557f0ddafdb2ce6ebea15b158eb2c661",
          percent: 0.5,
          sellTokenAddress: "0x3e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9",
          buyTokenAddress: "0x72df4dc5b6c4df72e4288857317caf2ce9da166ab8719ab8306516a2fddfff7",
          routes: [],
          alternativeSwapCount: 0
        }
      ]
    },
    {
      name: "AMM1",
      address: "0x975910cd99bc56bd289eaaa5cee6cd557f0ddafdb2ce6ebea15b158eb2c661",
      percent: 0.2,
      sellTokenAddress: "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      buyTokenAddress: "0x72df4dc5b6c4df72e4288857317caf2ce9da166ab8719ab8306516a2fddfff7",
      routes: [],
      alternativeSwapCount: 0
    },
    {
      name: "AMM1",
      address: "0x975910cd99bc56bd289eaaa5cee6cd557f0ddafdb2ce6ebea15b158eb2c661",
      percent: 0.3,
      sellTokenAddress: "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      buyTokenAddress: "0x3e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9",
      alternativeSwapCount: 0,
      routes: [
        {
          name: "AMM2",
          address: "0x975910cd99bc56bd289eaaa5cee6cd557f0ddafdb2ce6ebea15b158eb2c662",
          percent: 0.2,
          sellTokenAddress: "0x3e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9",
          buyTokenAddress: "0x72df4dc5b6c4df72e4288857317caf2ce9da166ab8719ab8306516a2fddfff7",
          routes: [],
          alternativeSwapCount: 0
        },
        {
          name: "AMM1",
          address: "0x975910cd99bc56bd289eaaa5cee6cd557f0ddafdb2ce6ebea15b158eb2c661",
          percent: 0.8,
          sellTokenAddress: "0x3e85bfbb8e2a42b7bead9e88e9a1b19dbccf661471061807292120462396ec9",
          buyTokenAddress: "0x72df4dc5b6c4df72e4288857317caf2ce9da166ab8719ab8306516a2fddfff7",
          routes: [],
          alternativeSwapCount: 0
        }
      ]
    }
  ]
});
var anInvokeTransactionResponse = () => ({
  transactionHash: "0x0"
});
var aAvnuCalls = () => ({
  chainId: import_starknet2.constants.StarknetChainId.SN_SEPOLIA,
  calls: [
    {
      contractAddress: "0x0",
      entrypoint: "execute",
      calldata: []
    }
  ]
});
var aCall = (overrides = {}) => ({
  contractAddress: "0xcontract",
  entrypoint: "transfer",
  calldata: ["0x1", "0x2"],
  ...overrides
});
var ethToken = () => ({
  name: "Ethereum",
  address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  symbol: "ETH",
  decimals: 18,
  logoUri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
  tags: ["AVNU"],
  lastDailyVolumeUsd: 0,
  extensions: {}
});
var btcToken = () => ({
  name: "Wrapped Bitcoin",
  address: "0x72df4dc5b6c4df72e4288857317caf2ce9da166ab8719ab8306516a2fddfff7",
  symbol: "WBTC",
  decimals: 18,
  logoUri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png",
  tags: ["AVNU"],
  lastDailyVolumeUsd: 0,
  extensions: {}
});
var aPage = (content, size = 10, number = 0, totalPages = 1, totalElements = 1) => ({
  content,
  size,
  totalPages,
  number,
  totalElements
});
var aSource = () => ({
  name: "AMM1",
  type: "DEX" /* DEX */
});
var aDCACreateOrder = () => ({
  sellTokenAddress: "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  sellAmount: (0, import_ethers2.toBeHex)((0, import_ethers2.parseUnits)("1", 18)),
  buyTokenAddress: "0x72df4dc5b6c4df72e4288857317caf2ce9da166ab8719ab8306516a2fddfff7",
  sellAmountPerCycle: (0, import_ethers2.toBeHex)((0, import_ethers2.parseUnits)("1", 18)),
  frequency: import_moment.default.duration("1"),
  pricingStrategy: {
    tokenToMinAmount: (0, import_ethers2.toBeHex)((0, import_ethers2.parseUnits)("1", 18)),
    tokenToMaxAmount: (0, import_ethers2.toBeHex)((0, import_ethers2.parseUnits)("1", 18))
  },
  traderAddress: "0x0"
});
var aDCAOrder = () => ({
  id: "1",
  blockNumber: 1,
  timestamp: /* @__PURE__ */ new Date(),
  traderAddress: "0x0",
  orderAddress: "0x123",
  creationTransactionHash: "0x123",
  orderClassHash: "0x123",
  sellTokenAddress: "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  sellAmount: (0, import_ethers2.parseUnits)("1", 18),
  sellAmountPerCycle: (0, import_ethers2.parseUnits)("1", 18),
  buyTokenAddress: "0x72df4dc5b6c4df72e4288857317caf2ce9da166ab8719ab8306516a2fddfff7",
  startDate: /* @__PURE__ */ new Date(),
  endDate: /* @__PURE__ */ new Date(),
  closeDate: /* @__PURE__ */ new Date(),
  frequency: "1",
  iterations: 1,
  status: "ACTIVE" /* ACTIVE */,
  pricingStrategy: {
    tokenToMinAmount: "1",
    tokenToMaxAmount: "1"
  },
  amountSold: (0, import_ethers2.parseUnits)("1", 18),
  amountBought: (0, import_ethers2.parseUnits)("1", 18),
  averageAmountBought: (0, import_ethers2.parseUnits)("1", 18),
  executedTradesCount: 1,
  cancelledTradesCount: 1,
  pendingTradesCount: 1,
  trades: []
});
var aDelegationPool = () => ({
  poolAddress: "0x0pool1",
  tokenAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  stakedAmount: (0, import_ethers2.parseUnits)("500", 18),
  stakedAmountInUsd: 85e4,
  apr: 5.5
});
var aStakingInfo = () => ({
  selfStakedAmount: (0, import_ethers2.parseUnits)("1000", 18),
  selfStakedAmountInUsd: 17e5,
  operationalAddress: "0x0operational",
  rewardAddress: "0x0reward",
  stakerAddress: "0x0staker",
  commission: 5,
  delegationPools: [aDelegationPool()]
});
var anApr = () => ({
  date: /* @__PURE__ */ new Date("2024-01-01"),
  apr: 5.5
});
var anAction = () => ({
  blockNumber: BigInt(1e3),
  date: /* @__PURE__ */ new Date("2024-01-01"),
  transactionHash: "0x0txhash",
  gasFee: {
    gasFeeAmount: BigInt("1000000000000000"),
    gasFeeAmountUsd: 0.01,
    gasFeeTokenAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
  },
  type: "Swap",
  metadata: {
    sellTokenAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    sellAmount: (0, import_ethers2.parseUnits)("1", 18),
    sellAmountUsd: 1700,
    buyTokenAddress: "0x72df4dc5b6c4df72e4288857317caf2ce9da166ab8719ab8306516a2fddfff7",
    buyAmount: (0, import_ethers2.parseUnits)("1700", 6),
    buyAmountUsd: 1700
  }
});
var aUserStakingInfo = () => ({
  tokenAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  tokenPriceInUsd: 1700,
  poolAddress: "0x0pool1",
  userAddress: "0x0user",
  amount: (0, import_ethers2.parseUnits)("100", 18),
  amountInUsd: 17e4,
  unclaimedRewards: (0, import_ethers2.parseUnits)("10", 18),
  unclaimedRewardsInUsd: 17e3,
  unpoolAmount: BigInt(0),
  unpoolAmountInUsd: 0,
  unpoolTime: void 0,
  totalClaimedRewards: (0, import_ethers2.parseUnits)("5", 18),
  totalClaimedRewardsHistoricalUsd: 8e3,
  totalClaimedRewardsUsd: 8500,
  userActions: [],
  totalUserActionsCount: 0,
  expectedYearlyStrkRewards: (0, import_ethers2.parseUnits)("50", 18),
  aprs: [anApr()]
});
var aPreparedTypedData = () => ({
  domain: { name: "test", version: "1", chainId: "0x1" },
  message: {},
  types: {},
  primaryType: "test"
});
var aSignedPaymasterTransaction = () => ({
  typedData: aPreparedTypedData(),
  signature: ["0x1", "0x2"]
});
var aStarknetMarket = () => ({
  usd: 1700,
  usdTvl: 5e7,
  usdPriceChange1h: 0.5,
  usdPriceChangePercentage1h: 0.03,
  usdPriceChange24h: 10,
  usdPriceChangePercentage24h: 0.6,
  usdPriceChange7d: 50,
  usdPriceChangePercentage7d: 3,
  usdVolume24h: 1e6,
  usdTradingVolume24h: 9e5
});
var aGlobalMarket = () => ({
  usd: 1700,
  usdMarketCap: 2e11,
  usdFdv: 2e11,
  usdMarketCapChange24h: 1e6,
  usdMarketCapChangePercentage24h: 0.5
});
var aDataPoint = () => ({
  date: "2024-01-01T00:00:00Z",
  value: 1700
});
var aCandleDataPoint = () => ({
  date: "2024-01-01T00:00:00Z",
  open: 1690,
  high: 1720,
  low: 1680,
  close: 1700,
  volume: 1e6
});
var aDataPointWithUsd = () => ({
  date: "2024-01-01T00:00:00Z",
  value: 1e6,
  valueUsd: 1e6
});
var anExchangeRangeDataPoint = () => ({
  value: 5e5,
  valueUsd: 5e5,
  exchange: "JediSwap",
  startDate: "2024-01-01",
  endDate: "2024-01-02"
});
var anExchangeDataPoint = () => ({
  date: "2024-01-01T00:00:00Z",
  value: 5e5,
  valueUsd: 5e5,
  exchange: "JediSwap"
});
var aTokenMarketData = () => ({
  name: "Ethereum",
  symbol: "ETH",
  address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  decimals: 18,
  logoUri: "https://example.com/eth.png",
  coingeckoId: "ethereum",
  verified: true,
  starknet: aStarknetMarket(),
  global: aGlobalMarket(),
  tags: ["Verified"],
  linePriceFeedInUsd: [aDataPoint()]
});

// src/impulse.services.ts
var import_dayjs = __toESM(require("dayjs"));
var import_qs2 = __toESM(require("qs"));
var import_zod3 = require("zod");
var getDatesFromRange = (dateRange, fullDate = true) => {
  const now = (0, import_dayjs.default)();
  let start;
  switch (dateRange) {
    case "1H" /* ONE_HOUR */:
      start = now.subtract(1, "hour");
      break;
    case "1D" /* ONE_DAY */:
      start = now.subtract(1, "day");
      break;
    case "1W" /* ONE_WEEK */:
      start = now.subtract(1, "week");
      break;
    case "1M" /* ONE_MONTH */:
      start = now.subtract(1, "month");
      break;
    case "1Y" /* ONE_YEAR */:
      start = now.subtract(1, "year");
      break;
    default:
      return void 0;
  }
  const format = "YYYY-MM-DD";
  return {
    start: fullDate ? start.toISOString() : start.format(format),
    end: fullDate ? now.toISOString() : now.format(format)
  };
};
var getDate = (date) => {
  return (0, import_dayjs.default)(date).toISOString();
};
var getDateQueryParams = (dateProps) => {
  const date = dateProps.date ? getDate(dateProps.date) : void 0;
  return import_qs2.default.stringify({ date }, { arrayFormat: "repeat" });
};
var getFeedQueryParams = (feedProps, quoteTokenAddress) => {
  const dates = getDatesFromRange(feedProps.dateRange, true);
  return import_qs2.default.stringify(
    { resolution: feedProps.resolution, startDate: dates?.start, endDate: dates?.end, quoteTokenAddress },
    { arrayFormat: "repeat" }
  );
};
var getSimpleQueryParams = (simpleProps) => {
  const dates = getDatesFromRange(simpleProps.dateRange, false);
  return import_qs2.default.stringify({ startDate: dates?.start, endDate: dates?.end }, { arrayFormat: "repeat" });
};
var getMarketData = (options) => fetch(`${getImpulseBaseUrl(options)}/${IMPULSE_API_VERSION}/tokens`, getRequest(options)).then(
  (response) => parseResponseWithSchema(response, import_zod3.z.array(TokenMarketDataSchema), options?.avnuPublicKey)
);
var getTokenMarketData = (tokenAddress, options) => fetch(`${getImpulseBaseUrl(options)}/${IMPULSE_API_VERSION}/tokens/${tokenAddress}`, getRequest(options)).then(
  (response) => parseResponseWithSchema(response, TokenMarketDataSchema, options?.avnuPublicKey)
);
var getPriceFeed = (tokenAddress, feedProps, quoteTokenAddress, options) => {
  const type = feedProps.type === "CANDLE" /* CANDLE */ ? "candle" : "line";
  const queryParams = getFeedQueryParams(feedProps, quoteTokenAddress);
  const schema = feedProps.type === "CANDLE" /* CANDLE */ ? import_zod3.z.array(CandleDataPointSchema) : import_zod3.z.array(DataPointSchema);
  return fetch(
    `${getImpulseBaseUrl(options)}/${IMPULSE_API_VERSION}/tokens/${tokenAddress}/prices/${type}?${queryParams}`,
    getRequest(options)
  ).then((response) => parseResponseWithSchema(response, schema, options?.avnuPublicKey));
};
var getVolumeByExchange = (tokenAddress, simpleProps, options) => {
  const queryParams = getSimpleQueryParams(simpleProps);
  return fetch(
    `${getImpulseBaseUrl(options)}/${IMPULSE_API_VERSION}/tokens/${tokenAddress}/exchange-volumes?${queryParams}`,
    getRequest(options)
  ).then(
    (response) => parseResponseWithSchema(response, import_zod3.z.array(ExchangeRangeDataPointSchema), options?.avnuPublicKey)
  );
};
var getExchangeVolumeFeed = (tokenAddress, feedProps, options) => {
  const queryParams = getFeedQueryParams(feedProps);
  return fetch(
    `${getImpulseBaseUrl(options)}/${IMPULSE_API_VERSION}/tokens/${tokenAddress}/exchange-volumes/line?${queryParams}`,
    getRequest(options)
  ).then((response) => parseResponseWithSchema(response, import_zod3.z.array(ExchangeDataPointSchema), options?.avnuPublicKey));
};
var getTVLByExchange = (tokenAddress, simpleDateProps, options) => {
  const queryParams = getDateQueryParams(simpleDateProps);
  return fetch(
    `${getImpulseBaseUrl(options)}/${IMPULSE_API_VERSION}/tokens/${tokenAddress}/exchange-tvl?${queryParams}`,
    getRequest(options)
  ).then((response) => parseResponseWithSchema(response, import_zod3.z.array(ExchangeDataPointSchema), options?.avnuPublicKey));
};
var getExchangeTVLFeed = (tokenAddress, feedProps, options) => {
  const queryParams = getFeedQueryParams(feedProps);
  return fetch(
    `${getImpulseBaseUrl(options)}/${IMPULSE_API_VERSION}/tokens/${tokenAddress}/exchange-tvl/line?${queryParams}`,
    getRequest(options)
  ).then((response) => parseResponseWithSchema(response, import_zod3.z.array(ExchangeDataPointSchema), options?.avnuPublicKey));
};
var getTransferVolumeFeed = (tokenAddress, feedProps, options) => {
  const queryParams = getFeedQueryParams(feedProps);
  return fetch(
    `${getImpulseBaseUrl(options)}/${IMPULSE_API_VERSION}/tokens/${tokenAddress}/volumes/line?${queryParams}`,
    getRequest(options)
  ).then((response) => parseResponseWithSchema(response, import_zod3.z.array(DataPointWithUsdSchema), options?.avnuPublicKey));
};
var getPrices = (tokenAddresses, options) => {
  const requestBody = {
    tokens: tokenAddresses
  };
  return fetch(
    `${getImpulseBaseUrl(options)}/${PRICES_API_VERSION}/tokens/prices`,
    postRequest(requestBody, options)
  ).then((response) => parseResponseWithSchema(response, import_zod3.z.array(TokenPriceSchema), options?.avnuPublicKey));
};

// src/staking.services.ts
var import_ethers3 = require("ethers");
var getAvnuStakingInfo = async (options) => {
  return fetch(`${getBaseUrl(options)}/staking/${STAKING_API_VERSION}`, getRequest(options)).then(
    (response) => parseResponseWithSchema(response, StakingInfoSchema, options?.avnuPublicKey)
  );
};
var getUserStakingInfo = async (tokenAddress, userAddress, options) => {
  return fetch(
    `${getBaseUrl(options)}/staking/${STAKING_API_VERSION}/pools/${tokenAddress}/members/${userAddress}`,
    getRequest(options)
  ).then((response) => parseResponseWithSchema(response, UserStakingInfoSchema, options?.avnuPublicKey));
};
var actionToCalls2 = async (endpoint, poolAddress, userAddress, body, options) => {
  return fetch(
    `${getBaseUrl(options)}/staking/${STAKING_API_VERSION}/pools/${poolAddress}/members/${userAddress}/${endpoint}`,
    postRequest(body, options)
  ).then((response) => parseResponse(response, options?.avnuPublicKey));
};
var stakeToCalls = async (params, options) => {
  const { poolAddress, userAddress, amount } = params;
  const body = { userAddress, amount: (0, import_ethers3.toBeHex)(amount) };
  return actionToCalls2("stake", poolAddress, userAddress, body, options);
};
var initiateUnstakeToCalls = async (params, options) => {
  const { poolAddress, userAddress, amount } = params;
  const body = { userAddress, amount: (0, import_ethers3.toBeHex)(amount) };
  return actionToCalls2("initiate-withdraw", poolAddress, userAddress, body, options);
};
var unstakeToCalls = async (params, options) => {
  const { poolAddress, userAddress } = params;
  const body = { userAddress };
  return actionToCalls2("claim-withdraw", poolAddress, userAddress, body, options);
};
var claimRewardsToCalls = async (params, options) => {
  const { poolAddress, userAddress, restake } = params;
  const body = { userAddress, restake };
  return actionToCalls2("claim-rewards", poolAddress, userAddress, body, options);
};
var executeStake = async (params, options) => {
  const { provider, paymaster, poolAddress, amount } = params;
  const { calls } = await stakeToCalls({ poolAddress, userAddress: provider.address, amount }, options);
  if (paymaster && paymaster.active) {
    return executeAllPaymasterFlow({ paymaster, provider, calls });
  }
  return provider.execute(calls).then((result) => ({ transactionHash: result.transaction_hash }));
};
var executeInitiateUnstake = async (params, options) => {
  const { provider, paymaster, poolAddress, amount } = params;
  const { calls } = await initiateUnstakeToCalls({ poolAddress, userAddress: provider.address, amount }, options);
  if (paymaster && paymaster.active) {
    return executeAllPaymasterFlow({ paymaster, provider, calls });
  }
  return provider.execute(calls).then((result) => ({ transactionHash: result.transaction_hash }));
};
var executeUnstake = async (params, options) => {
  const { provider, paymaster, poolAddress } = params;
  const { calls } = await unstakeToCalls({ poolAddress, userAddress: provider.address }, options);
  if (paymaster && paymaster.active) {
    return executeAllPaymasterFlow({ paymaster, provider, calls });
  }
  return provider.execute(calls).then((result) => ({ transactionHash: result.transaction_hash }));
};
var executeClaimRewards = async (params, options) => {
  const { provider, paymaster, poolAddress, restake } = params;
  const { calls } = await claimRewardsToCalls({ poolAddress, userAddress: provider.address, restake }, options);
  if (paymaster && paymaster.active) {
    return executeAllPaymasterFlow({ paymaster, provider, calls });
  }
  return provider.execute(calls).then((result) => ({ transactionHash: result.transaction_hash }));
};

// src/swap.services.ts
var import_ethers4 = require("ethers");
var import_qs3 = __toESM(require("qs"));
var import_zod4 = require("zod");
var getSources = (options) => fetch(`${getBaseUrl(options)}/swap/${SWAP_API_VERSION}/sources`, getRequest(options)).then(
  (response) => parseResponseWithSchema(response, import_zod4.z.array(SourceSchema), options?.avnuPublicKey)
);
var getQuotes = (request, options) => {
  if (!request.sellAmount && !request.buyAmount) throw new Error("Sell amount or buy amount is required");
  const queryParams = import_qs3.default.stringify(
    {
      ...request,
      buyAmount: request.buyAmount ? (0, import_ethers4.toBeHex)(request.buyAmount) : void 0,
      sellAmount: request.sellAmount ? (0, import_ethers4.toBeHex)(request.sellAmount) : void 0,
      integratorFees: request.integratorFees ? (0, import_ethers4.toBeHex)(request.integratorFees) : void 0
    },
    { arrayFormat: "repeat" }
  );
  return fetch(`${getBaseUrl(options)}/swap/${SWAP_API_VERSION}/quotes?${queryParams}`, getRequest(options)).then(
    (response) => parseResponseWithSchema(response, import_zod4.z.array(QuoteSchema), options?.avnuPublicKey)
  );
};
var quoteToCalls = (params, options) => {
  const { quoteId, takerAddress, slippage, executeApprove } = params;
  return fetch(
    `${getBaseUrl(options)}/swap/${SWAP_API_VERSION}/build`,
    postRequest({ quoteId, takerAddress, slippage, includeApprove: executeApprove }, options)
  ).then((response) => parseResponse(response, options?.avnuPublicKey));
};
var executeSwap = async (params, options) => {
  const { provider, paymaster, quote, executeApprove = true, slippage } = params;
  const chainId = await provider.getChainId();
  if (chainId !== quote.chainId) {
    throw Error(`Invalid chainId`);
  }
  const { calls } = await quoteToCalls(
    { quoteId: quote.quoteId, takerAddress: provider.address, slippage, executeApprove },
    options
  );
  if (paymaster && paymaster.active) {
    return executeAllPaymasterFlow({ paymaster, provider, calls });
  }
  const result = await provider.execute(calls);
  return { transactionHash: result.transaction_hash };
};
var calculateMinReceivedAmount = (amount, slippage) => amount - amount * BigInt(Math.round(slippage * 1e4)) / BigInt(1e4);
var calculateMaxSpendAmount = (amount, slippage) => amount + amount * BigInt(Math.round(slippage * 1e4)) / BigInt(1e4);

// src/token.services.ts
var import_qs4 = __toESM(require("qs"));
var fetchTokens = async (request, options) => {
  const queryParams = import_qs4.default.stringify(
    {
      page: request?.page,
      size: request?.size,
      search: request?.search,
      tag: request?.tags
    },
    { arrayFormat: "repeat" }
  );
  return fetch(`${getBaseUrl(options)}/${TOKEN_API_VERSION}/starknet/tokens?${queryParams}`, getRequest(options)).then(
    (response) => parseResponseWithSchema(response, PageSchema(TokenSchema), options?.avnuPublicKey)
  );
};
var fetchTokenByAddress = async (tokenAddress, options) => {
  return fetch(`${getBaseUrl(options)}/${TOKEN_API_VERSION}/starknet/tokens/${tokenAddress}`, getRequest(options)).then(
    (response) => parseResponseWithSchema(response, TokenSchema, options?.avnuPublicKey)
  );
};
var fetchVerifiedTokenBySymbol = async (symbol, options) => {
  return fetchTokens({ page: 0, size: 1, tags: ["Verified", "Unruggable"], search: symbol }, options).then((page) => {
    const token = page.content[0];
    if (token && token.symbol.toLowerCase() === symbol.toLowerCase()) {
      return token;
    }
    throw void 0;
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BASE_URL,
  ContractError,
  DCA_API_VERSION,
  DcaOrderStatus,
  DcaTradeStatus,
  FeedDateRange,
  FeedResolution,
  IMPULSE_API_VERSION,
  IMPULSE_BASE_URL,
  PRICES_API_VERSION,
  PriceFeedType,
  SEPOLIA_BASE_URL,
  SEPOLIA_IMPULSE_BASE_URL,
  STAKING_API_VERSION,
  SWAP_API_VERSION,
  SourceType,
  TOKEN_API_VERSION,
  VolumeFeedType,
  aAvnuCalls,
  aCall,
  aCandleDataPoint,
  aDCACreateOrder,
  aDCAOrder,
  aDataPoint,
  aDataPointWithUsd,
  aDelegationPool,
  aGlobalMarket,
  aPage,
  aPreparedTypedData,
  aPrice,
  aPriceRequest,
  aQuote,
  aQuoteRequest,
  aQuoteWithManyComplexRoutes,
  aQuoteWithManySubRoutes,
  aSignedPaymasterTransaction,
  aSource,
  aStakingInfo,
  aStarknetMarket,
  aTokenMarketData,
  aUserStakingInfo,
  anAction,
  anApr,
  anExchangeDataPoint,
  anExchangeRangeDataPoint,
  anInvokeTransactionResponse,
  btcToken,
  buildPaymasterTransaction,
  calculateMaxSpendAmount,
  calculateMinReceivedAmount,
  cancelDcaToCalls,
  claimRewardsToCalls,
  createDcaToCalls,
  ethToken,
  executeAllPaymasterFlow,
  executeCancelDca,
  executeClaimRewards,
  executeCreateDca,
  executeInitiateUnstake,
  executePaymasterTransaction,
  executeStake,
  executeSwap,
  executeUnstake,
  fetchTokenByAddress,
  fetchTokens,
  fetchVerifiedTokenBySymbol,
  getAvnuStakingInfo,
  getBaseUrl,
  getDcaOrders,
  getExchangeTVLFeed,
  getExchangeVolumeFeed,
  getImpulseBaseUrl,
  getLastPageNumber,
  getMarketData,
  getPriceFeed,
  getPrices,
  getQuotes,
  getRequest,
  getSources,
  getTVLByExchange,
  getTokenMarketData,
  getTransferVolumeFeed,
  getUserStakingInfo,
  getVolumeByExchange,
  initiateUnstakeToCalls,
  parseResponse,
  parseResponseWithSchema,
  postRequest,
  quoteToCalls,
  signPaymasterTransaction,
  stakeToCalls,
  unstakeToCalls
});
//# sourceMappingURL=index.js.map