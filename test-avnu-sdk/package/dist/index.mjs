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
import qs from "qs";

// src/paymaster.services.ts
import { toBeHex } from "ethers";
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
    signature = rawSignature.map((sig) => toBeHex(BigInt(sig)));
  } else if (rawSignature.r && rawSignature.s) {
    signature = [toBeHex(BigInt(rawSignature.r)), toBeHex(BigInt(rawSignature.s))];
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
import { z } from "zod";

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
var hexToBigInt = z.union([z.string(), z.number(), z.bigint()]).transform((val) => {
  if (typeof val === "bigint") return val;
  return BigInt(val);
});
var hexToNumber = z.union([z.string(), z.number(), z.bigint()]).transform((val) => {
  if (typeof val === "number") return val;
  return Number(val);
});
var isoStringToDate = z.string().transform((val) => new Date(val));
var hexTimestampToDate = z.union([z.string(), z.number(), z.null(), z.undefined()]).transform((val) => {
  if (val === null || val === void 0) return void 0;
  if (typeof val === "string") {
    return new Date(parseInt(val, 16) * 1e3);
  }
  return new Date(val * 1e3);
});
var TokenSchema = z.object({
  address: z.string(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  logoUri: z.string().nullable(),
  lastDailyVolumeUsd: z.number(),
  extensions: z.record(z.string(), z.string()),
  tags: z.array(z.enum(["Unknown", "Verified", "Community", "Unruggable", "AVNU"]))
});
var SourceTypeSchema = z.enum(SourceType);
var SourceSchema = z.object({
  name: z.string(),
  type: SourceTypeSchema
});
var DcaTradeStatusSchema = z.enum(DcaTradeStatus);
var DcaTradeSchema = z.object({
  sellAmount: hexToBigInt,
  sellAmountInUsd: z.number().optional(),
  buyAmount: hexToBigInt.optional(),
  buyAmountInUsd: z.number().optional(),
  expectedTradeDate: isoStringToDate,
  actualTradeDate: isoStringToDate.optional(),
  status: DcaTradeStatusSchema,
  txHash: z.string().optional(),
  errorReason: z.string().optional()
});
var DcaOrderStatusSchema = z.enum(DcaOrderStatus);
var PricingStrategySchema = z.union([
  z.object({
    tokenToMinAmount: z.string().or(z.undefined()),
    tokenToMaxAmount: z.string().or(z.undefined())
  }),
  z.object({}).strict()
]);
var DcaOrderSchema = z.object({
  id: z.string(),
  blockNumber: z.number(),
  timestamp: isoStringToDate,
  traderAddress: z.string(),
  orderAddress: z.string(),
  creationTransactionHash: z.string(),
  orderClassHash: z.string(),
  sellTokenAddress: z.string(),
  sellAmount: hexToBigInt,
  sellAmountPerCycle: hexToBigInt,
  buyTokenAddress: z.string(),
  startDate: isoStringToDate,
  endDate: isoStringToDate,
  closeDate: isoStringToDate.optional(),
  frequency: z.string(),
  iterations: z.number(),
  status: DcaOrderStatusSchema,
  pricingStrategy: PricingStrategySchema,
  amountSold: hexToBigInt,
  amountBought: hexToBigInt,
  averageAmountBought: hexToBigInt,
  executedTradesCount: z.number(),
  cancelledTradesCount: z.number(),
  pendingTradesCount: z.number(),
  trades: z.array(DcaTradeSchema)
});
var RouteSchema = z.lazy(
  () => z.object({
    name: z.string(),
    address: z.string(),
    percent: z.number(),
    sellTokenAddress: z.string(),
    buyTokenAddress: z.string(),
    routeInfo: z.record(z.string(), z.string()).optional(),
    routes: z.array(RouteSchema),
    alternativeSwapCount: z.number()
  })
);
var FeeSchema = z.object({
  feeToken: z.string(),
  avnuFees: hexToBigInt,
  avnuFeesInUsd: z.number(),
  avnuFeesBps: hexToBigInt,
  integratorFees: hexToBigInt,
  integratorFeesInUsd: z.number(),
  integratorFeesBps: hexToBigInt
});
var QuoteSchema = z.object({
  quoteId: z.string(),
  sellTokenAddress: z.string(),
  sellAmount: hexToBigInt,
  sellAmountInUsd: z.number(),
  buyTokenAddress: z.string(),
  buyAmount: hexToBigInt,
  buyAmountInUsd: z.number(),
  fee: FeeSchema,
  blockNumber: hexToNumber.optional(),
  chainId: z.string(),
  expiry: z.number().optional().nullable(),
  routes: z.array(RouteSchema),
  gasFees: hexToBigInt,
  gasFeesInUsd: z.number().optional(),
  priceImpact: z.number(),
  sellTokenPriceInUsd: z.number().optional(),
  buyTokenPriceInUsd: z.number().optional(),
  exactTokenTo: z.boolean().optional(),
  estimatedSlippage: z.number().optional()
});
var GasFeeInfoSchema = z.object({
  gasFeeAmount: hexToBigInt.optional(),
  gasFeeAmountUsd: z.number().optional(),
  gasFeeTokenAddress: z.string().optional()
});
var SwapMetadataSchema = z.object({
  sellTokenAddress: z.string(),
  sellAmount: hexToBigInt,
  sellAmountUsd: z.number().optional(),
  buyTokenAddress: z.string(),
  buyAmount: hexToBigInt,
  buyAmountUsd: z.number().optional(),
  integratorName: z.string().optional()
});
var DcaOrderMetadataSchema = z.object({
  orderClassHash: z.string(),
  orderAddress: z.string(),
  sellTokenAddress: z.string(),
  sellAmount: hexToBigInt,
  sellAmountUsd: z.number().optional(),
  sellAmountPerCycle: hexToBigInt,
  buyTokenAddress: z.string(),
  cycleFrequency: hexToBigInt,
  startDate: isoStringToDate,
  endDate: isoStringToDate
});
var CancelDcaOrderMetadataSchema = z.object({
  orderAddress: z.string()
});
var DcaTradeMetadataSchema = z.object({
  sellTokenAddress: z.string(),
  sellAmount: hexToBigInt,
  sellAmountUsd: z.number().optional(),
  buyTokenAddress: z.string(),
  buyAmount: hexToBigInt,
  buyAmountUsd: z.number().optional()
});
var StakingInitiateUnstakeMetadataSchema = z.object({
  delegationPoolAddress: z.string(),
  exitTimestamp: isoStringToDate,
  amount: hexToBigInt,
  amountUsd: z.number().optional(),
  oldDelegatedStake: hexToBigInt,
  oldDelegatedStakeUsd: z.number().optional(),
  newDelegatedStake: hexToBigInt,
  newDelegatedStakeUsd: z.number().optional()
});
var StakingCancelUnstakeMetadataSchema = z.object({
  delegationPoolAddress: z.string(),
  oldDelegatedStake: hexToBigInt,
  oldDelegatedStakeUsd: z.number().optional(),
  newDelegatedStake: hexToBigInt,
  newDelegatedStakeUsd: z.number().optional()
});
var StakingStakeMetadataSchema = z.object({
  delegationPoolAddress: z.string(),
  oldDelegatedStake: hexToBigInt,
  oldDelegatedStakeUsd: z.number().optional(),
  newDelegatedStake: hexToBigInt,
  newDelegatedStakeUsd: z.number().optional()
});
var StakingClaimRewardsMetadataSchema = z.object({
  delegationPoolAddress: z.string(),
  rewardAddress: z.string(),
  amount: hexToBigInt,
  amountUsd: z.number().optional()
});
var StakingUnstakeMetadataSchema = z.object({
  delegationPoolAddress: z.string(),
  amount: hexToBigInt,
  amountUsd: z.number().optional()
});
var ActionMetadataSchema = z.union([
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
var ActionTypeSchema = z.enum([
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
var ActionSchema = z.object({
  blockNumber: hexToBigInt,
  date: isoStringToDate,
  transactionHash: z.string(),
  gasFee: GasFeeInfoSchema.nullable(),
  type: ActionTypeSchema,
  metadata: ActionMetadataSchema
});
var AprSchema = z.object({
  date: isoStringToDate,
  apr: z.number()
});
var UserStakingInfoSchema = z.object({
  tokenAddress: z.string(),
  tokenPriceInUsd: z.number(),
  poolAddress: z.string(),
  userAddress: z.string(),
  amount: hexToBigInt,
  amountInUsd: z.number().or(z.undefined()),
  unclaimedRewards: hexToBigInt,
  unclaimedRewardsInUsd: z.number().or(z.undefined()),
  unpoolAmount: hexToBigInt,
  unpoolAmountInUsd: z.number().or(z.undefined()),
  unpoolTime: hexTimestampToDate,
  totalClaimedRewards: hexToBigInt,
  totalClaimedRewardsHistoricalUsd: z.number().optional(),
  totalClaimedRewardsUsd: z.number(),
  userActions: z.array(ActionSchema),
  totalUserActionsCount: z.number(),
  expectedYearlyStrkRewards: hexToBigInt,
  aprs: z.array(AprSchema)
});
var DelegationPoolSchema = z.object({
  poolAddress: z.string(),
  tokenAddress: z.string(),
  stakedAmount: hexToBigInt,
  stakedAmountInUsd: z.number().or(z.undefined()),
  apr: z.number()
});
var StakingInfoSchema = z.object({
  selfStakedAmount: hexToBigInt,
  selfStakedAmountInUsd: z.number().or(z.undefined()),
  operationalAddress: z.string(),
  rewardAddress: z.string(),
  stakerAddress: z.string(),
  commission: z.number(),
  delegationPools: z.array(DelegationPoolSchema)
});
var StarknetMarketSchema = z.object({
  usd: z.number(),
  usdTvl: z.number(),
  usdPriceChange1h: z.number(),
  usdPriceChangePercentage1h: z.number().nullable(),
  usdPriceChange24h: z.number(),
  usdPriceChangePercentage24h: z.number().nullable(),
  usdPriceChange7d: z.number(),
  usdPriceChangePercentage7d: z.number().nullable(),
  usdVolume24h: z.number(),
  usdTradingVolume24h: z.number()
});
var GlobalMarketSchema = z.object({
  usd: z.number(),
  usdMarketCap: z.number(),
  usdFdv: z.number(),
  usdMarketCapChange24h: z.number(),
  usdMarketCapChangePercentage24h: z.number()
});
var DataPointSchema = z.object({
  date: z.string(),
  value: z.number()
});
var DataPointWithUsdSchema = z.object({
  date: z.string(),
  value: z.number(),
  valueUsd: z.number()
});
var ExchangeDataPointSchema = z.object({
  date: z.string(),
  value: z.number(),
  valueUsd: z.number(),
  exchange: z.string()
});
var ExchangeRangeDataPointSchema = z.object({
  value: z.number(),
  valueUsd: z.number(),
  exchange: z.string(),
  startDate: z.string(),
  endDate: z.string()
});
var CandleDataPointSchema = z.object({
  date: z.string(),
  close: z.number(),
  high: z.number(),
  low: z.number(),
  open: z.number(),
  volume: z.number()
});
var TokenMarketDataSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  address: z.string(),
  decimals: z.number(),
  logoUri: z.string().nullable().optional(),
  coingeckoId: z.string().nullable().optional(),
  verified: z.boolean(),
  starknet: StarknetMarketSchema,
  global: GlobalMarketSchema.nullable(),
  tags: z.array(z.enum(["Unknown", "Verified", "Community", "Unruggable", "AVNU"])).default([]),
  linePriceFeedInUsd: z.array(DataPointSchema).default([])
});
var MarketPriceSchema = z.object({
  usd: z.number()
});
var TokenPriceSchema = z.object({
  address: z.string(),
  decimals: z.number(),
  globalMarket: MarketPriceSchema.nullable(),
  starknetMarket: MarketPriceSchema.nullable()
});
var PageSchema = (contentSchema) => z.object({
  content: z.array(contentSchema),
  totalPages: z.number(),
  totalElements: z.number(),
  size: z.number(),
  number: z.number()
});

// src/utils.ts
import { ec, hash } from "starknet";
import { z as z2 } from "zod";

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
      const hashResponse = hash.computeHashOnElements([hash.starknetKeccak(textResponse)]);
      const formattedSig = signature.split(",").map((s) => BigInt(s));
      const signatureType = new ec.starkCurve.Signature(formattedSig[0], formattedSig[1]);
      if (!ec.starkCurve.verify(signatureType, hashResponse, avnuPublicKey))
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
      if (error instanceof z2.ZodError) {
        throw new Error(`Invalid API response: ${error.message}`);
      }
      throw error;
    }
  });
};

// src/dca.services.ts
var getDcaOrders = async ({ traderAddress, status, page, size, sort }, options) => {
  const params = qs.stringify({ traderAddress, status, page, size, sort }, { arrayFormat: "repeat" });
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
import { parseUnits, toBeHex as toBeHex2 } from "ethers";
import moment from "moment";
import { constants } from "starknet";
var aPriceRequest = () => ({
  tokens: ["0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"]
});
var aQuoteRequest = () => ({
  sellTokenAddress: "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  sellAmount: parseUnits("1", 18),
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
  sellAmount: parseUnits("1", 18),
  sellAmountInUsd: 1700,
  buyTokenAddress: "0x72df4dc5b6c4df72e4288857317caf2ce9da166ab8719ab8306516a2fddfff7",
  buyAmount: parseUnits("2", 18),
  buyAmountInUsd: 1700,
  blockNumber: 1,
  chainId: constants.StarknetChainId.SN_SEPOLIA,
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
  sellAmount: parseUnits("1", 18),
  sellAmountInUsd: 1700,
  buyTokenAddress: "0x72df4dc5b6c4df72e4288857317caf2ce9da166ab8719ab8306516a2fddfff7",
  buyAmount: parseUnits("2", 18),
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
  chainId: constants.StarknetChainId.SN_SEPOLIA,
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
  sellAmount: parseUnits("1", 18),
  sellAmountInUsd: 1700,
  buyTokenAddress: "0x72df4dc5b6c4df72e4288857317caf2ce9da166ab8719ab8306516a2fddfff7",
  buyAmount: parseUnits("2", 18),
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
  chainId: constants.StarknetChainId.SN_SEPOLIA,
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
  chainId: constants.StarknetChainId.SN_SEPOLIA,
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
  sellAmount: toBeHex2(parseUnits("1", 18)),
  buyTokenAddress: "0x72df4dc5b6c4df72e4288857317caf2ce9da166ab8719ab8306516a2fddfff7",
  sellAmountPerCycle: toBeHex2(parseUnits("1", 18)),
  frequency: moment.duration("1"),
  pricingStrategy: {
    tokenToMinAmount: toBeHex2(parseUnits("1", 18)),
    tokenToMaxAmount: toBeHex2(parseUnits("1", 18))
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
  sellAmount: parseUnits("1", 18),
  sellAmountPerCycle: parseUnits("1", 18),
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
  amountSold: parseUnits("1", 18),
  amountBought: parseUnits("1", 18),
  averageAmountBought: parseUnits("1", 18),
  executedTradesCount: 1,
  cancelledTradesCount: 1,
  pendingTradesCount: 1,
  trades: []
});
var aDelegationPool = () => ({
  poolAddress: "0x0pool1",
  tokenAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  stakedAmount: parseUnits("500", 18),
  stakedAmountInUsd: 85e4,
  apr: 5.5
});
var aStakingInfo = () => ({
  selfStakedAmount: parseUnits("1000", 18),
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
    sellAmount: parseUnits("1", 18),
    sellAmountUsd: 1700,
    buyTokenAddress: "0x72df4dc5b6c4df72e4288857317caf2ce9da166ab8719ab8306516a2fddfff7",
    buyAmount: parseUnits("1700", 6),
    buyAmountUsd: 1700
  }
});
var aUserStakingInfo = () => ({
  tokenAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  tokenPriceInUsd: 1700,
  poolAddress: "0x0pool1",
  userAddress: "0x0user",
  amount: parseUnits("100", 18),
  amountInUsd: 17e4,
  unclaimedRewards: parseUnits("10", 18),
  unclaimedRewardsInUsd: 17e3,
  unpoolAmount: BigInt(0),
  unpoolAmountInUsd: 0,
  unpoolTime: void 0,
  totalClaimedRewards: parseUnits("5", 18),
  totalClaimedRewardsHistoricalUsd: 8e3,
  totalClaimedRewardsUsd: 8500,
  userActions: [],
  totalUserActionsCount: 0,
  expectedYearlyStrkRewards: parseUnits("50", 18),
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
import dayjs from "dayjs";
import qs2 from "qs";
import { z as z3 } from "zod";
var getDatesFromRange = (dateRange, fullDate = true) => {
  const now = dayjs();
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
  return dayjs(date).toISOString();
};
var getDateQueryParams = (dateProps) => {
  const date = dateProps.date ? getDate(dateProps.date) : void 0;
  return qs2.stringify({ date }, { arrayFormat: "repeat" });
};
var getFeedQueryParams = (feedProps, quoteTokenAddress) => {
  const dates = getDatesFromRange(feedProps.dateRange, true);
  return qs2.stringify(
    { resolution: feedProps.resolution, startDate: dates?.start, endDate: dates?.end, quoteTokenAddress },
    { arrayFormat: "repeat" }
  );
};
var getSimpleQueryParams = (simpleProps) => {
  const dates = getDatesFromRange(simpleProps.dateRange, false);
  return qs2.stringify({ startDate: dates?.start, endDate: dates?.end }, { arrayFormat: "repeat" });
};
var getMarketData = (options) => fetch(`${getImpulseBaseUrl(options)}/${IMPULSE_API_VERSION}/tokens`, getRequest(options)).then(
  (response) => parseResponseWithSchema(response, z3.array(TokenMarketDataSchema), options?.avnuPublicKey)
);
var getTokenMarketData = (tokenAddress, options) => fetch(`${getImpulseBaseUrl(options)}/${IMPULSE_API_VERSION}/tokens/${tokenAddress}`, getRequest(options)).then(
  (response) => parseResponseWithSchema(response, TokenMarketDataSchema, options?.avnuPublicKey)
);
var getPriceFeed = (tokenAddress, feedProps, quoteTokenAddress, options) => {
  const type = feedProps.type === "CANDLE" /* CANDLE */ ? "candle" : "line";
  const queryParams = getFeedQueryParams(feedProps, quoteTokenAddress);
  const schema = feedProps.type === "CANDLE" /* CANDLE */ ? z3.array(CandleDataPointSchema) : z3.array(DataPointSchema);
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
    (response) => parseResponseWithSchema(response, z3.array(ExchangeRangeDataPointSchema), options?.avnuPublicKey)
  );
};
var getExchangeVolumeFeed = (tokenAddress, feedProps, options) => {
  const queryParams = getFeedQueryParams(feedProps);
  return fetch(
    `${getImpulseBaseUrl(options)}/${IMPULSE_API_VERSION}/tokens/${tokenAddress}/exchange-volumes/line?${queryParams}`,
    getRequest(options)
  ).then((response) => parseResponseWithSchema(response, z3.array(ExchangeDataPointSchema), options?.avnuPublicKey));
};
var getTVLByExchange = (tokenAddress, simpleDateProps, options) => {
  const queryParams = getDateQueryParams(simpleDateProps);
  return fetch(
    `${getImpulseBaseUrl(options)}/${IMPULSE_API_VERSION}/tokens/${tokenAddress}/exchange-tvl?${queryParams}`,
    getRequest(options)
  ).then((response) => parseResponseWithSchema(response, z3.array(ExchangeDataPointSchema), options?.avnuPublicKey));
};
var getExchangeTVLFeed = (tokenAddress, feedProps, options) => {
  const queryParams = getFeedQueryParams(feedProps);
  return fetch(
    `${getImpulseBaseUrl(options)}/${IMPULSE_API_VERSION}/tokens/${tokenAddress}/exchange-tvl/line?${queryParams}`,
    getRequest(options)
  ).then((response) => parseResponseWithSchema(response, z3.array(ExchangeDataPointSchema), options?.avnuPublicKey));
};
var getTransferVolumeFeed = (tokenAddress, feedProps, options) => {
  const queryParams = getFeedQueryParams(feedProps);
  return fetch(
    `${getImpulseBaseUrl(options)}/${IMPULSE_API_VERSION}/tokens/${tokenAddress}/volumes/line?${queryParams}`,
    getRequest(options)
  ).then((response) => parseResponseWithSchema(response, z3.array(DataPointWithUsdSchema), options?.avnuPublicKey));
};
var getPrices = (tokenAddresses, options) => {
  const requestBody = {
    tokens: tokenAddresses
  };
  return fetch(
    `${getImpulseBaseUrl(options)}/${PRICES_API_VERSION}/tokens/prices`,
    postRequest(requestBody, options)
  ).then((response) => parseResponseWithSchema(response, z3.array(TokenPriceSchema), options?.avnuPublicKey));
};

// src/staking.services.ts
import { toBeHex as toBeHex3 } from "ethers";
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
  const body = { userAddress, amount: toBeHex3(amount) };
  return actionToCalls2("stake", poolAddress, userAddress, body, options);
};
var initiateUnstakeToCalls = async (params, options) => {
  const { poolAddress, userAddress, amount } = params;
  const body = { userAddress, amount: toBeHex3(amount) };
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
import { toBeHex as toBeHex4 } from "ethers";
import qs3 from "qs";
import { z as z4 } from "zod";
var getSources = (options) => fetch(`${getBaseUrl(options)}/swap/${SWAP_API_VERSION}/sources`, getRequest(options)).then(
  (response) => parseResponseWithSchema(response, z4.array(SourceSchema), options?.avnuPublicKey)
);
var getQuotes = (request, options) => {
  if (!request.sellAmount && !request.buyAmount) throw new Error("Sell amount or buy amount is required");
  const queryParams = qs3.stringify(
    {
      ...request,
      buyAmount: request.buyAmount ? toBeHex4(request.buyAmount) : void 0,
      sellAmount: request.sellAmount ? toBeHex4(request.sellAmount) : void 0,
      integratorFees: request.integratorFees ? toBeHex4(request.integratorFees) : void 0
    },
    { arrayFormat: "repeat" }
  );
  return fetch(`${getBaseUrl(options)}/swap/${SWAP_API_VERSION}/quotes?${queryParams}`, getRequest(options)).then(
    (response) => parseResponseWithSchema(response, z4.array(QuoteSchema), options?.avnuPublicKey)
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
import qs4 from "qs";
var fetchTokens = async (request, options) => {
  const queryParams = qs4.stringify(
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
export {
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
};
//# sourceMappingURL=index.mjs.map