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
  SEPOLIA_BASE_URL: () => SEPOLIA_BASE_URL,
  aListOfGasTokenPrices: () => aListOfGasTokenPrices,
  executeCalls: () => executeCalls,
  fetchAccountCompatibility: () => fetchAccountCompatibility,
  fetchAccountsRewards: () => fetchAccountsRewards,
  fetchBuildTypedData: () => fetchBuildTypedData,
  fetchExecuteTransaction: () => fetchExecuteTransaction,
  fetchGasTokenPrices: () => fetchGasTokenPrices,
  fetchGaslessStatus: () => fetchGaslessStatus,
  formatCall: () => formatCall,
  getGasFeesInGasToken: () => getGasFeesInGasToken
});
module.exports = __toCommonJS(src_exports);

// src/constants.ts
var SEPOLIA_BASE_URL = "https://sepolia.api.avnu.fi";
var BASE_URL = "https://starknet.api.avnu.fi";

// src/fixtures.ts
var import_ethers = require("ethers");
var aListOfGasTokenPrices = () => [
  {
    // USDC
    tokenAddress: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
    priceInETH: (0, import_ethers.parseUnits)("0.0005", 18),
    priceInUSD: 1,
    decimals: 6
  },
  {
    // USDT
    tokenAddress: "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
    priceInETH: (0, import_ethers.parseUnits)("0.0005", 18),
    priceInUSD: 1,
    decimals: 6
  }
];

// src/services.ts
var import_ethers2 = require("ethers");
var import_qs = __toESM(require("qs"));
var import_starknet = require("starknet");

// src/types.ts
var ContractError = class {
  constructor(message, revertError) {
    this.message = message;
    this.revertError = revertError;
  }
};

// src/services.ts
var baseUrl = (options) => options?.baseUrl ?? BASE_URL;
var getRequest = (options) => ({
  signal: options?.abortSignal,
  headers: {
    ...options?.apiPublicKey !== void 0 && { "ask-signature": "true" },
    ...options?.apiKey && { "api-key": options.apiKey },
    ...options?.customHeaders
  }
});
var postRequest = (body, options) => ({
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...options?.apiKey && { "api-key": options.apiKey },
    ...options?.apiPublicKey && { "ask-signature": "true" },
    ...options?.customHeaders
  },
  body: JSON.stringify(body)
});
var parseResponse = (response, apiPublicKey) => {
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
  if (apiPublicKey) {
    const signature = response.headers.get("signature");
    if (!signature) throw new Error("No server signature");
    return response.clone().text().then((textResponse) => {
      const hashResponse = import_starknet.hash.computeHashOnElements([import_starknet.hash.starknetKeccak(textResponse)]);
      const formattedSig = signature.split(",").map((s) => BigInt(s));
      const signatureType = new import_starknet.ec.starkCurve.Signature(formattedSig[0], formattedSig[1]);
      if (!import_starknet.ec.starkCurve.verify(signatureType, hashResponse, apiPublicKey))
        throw new Error("Invalid server signature");
    }).then(() => response.json());
  }
  return response.json();
};
var fetchGaslessStatus = (options) => fetch(`${baseUrl(options)}/paymaster/v1/status`, getRequest(options)).then(
  (response) => parseResponse(response, options?.apiPublicKey)
);
var fetchAccountCompatibility = (accountAddress, options) => fetch(`${baseUrl(options)}/paymaster/v1/accounts/${accountAddress}/compatible`, getRequest(options)).then((response) => parseResponse(response, options?.apiPublicKey)).then((response) => ({
  ...response,
  gasConsumedOverhead: BigInt(response.gasConsumedOverhead),
  dataGasConsumedOverhead: BigInt(response.dataGasConsumedOverhead)
}));
var fetchAccountsRewards = (accountAddress, options) => {
  const queryParams = import_qs.default.stringify(
    {
      ...options?.sponsor && { sponsor: options.sponsor },
      ...options?.campaign && { campaign: options.campaign },
      ...options?.protocol && { protocol: options.protocol }
    },
    { arrayFormat: "repeat" }
  );
  return fetch(
    `${baseUrl(options)}/paymaster/v1/accounts/${accountAddress}/rewards?${queryParams}`,
    getRequest(options)
  ).then((response) => parseResponse(response, options?.apiPublicKey));
};
var fetchGasTokenPrices = (options) => fetch(`${baseUrl(options)}/paymaster/v1/gas-token-prices`, getRequest(options)).then((response) => parseResponse(response, options?.apiPublicKey)).then(
  (prices) => prices.map((price) => ({
    ...price,
    priceInETH: BigInt(price.priceInETH)
  }))
);
var fetchBuildTypedData = (userAddress, calls, gasTokenAddress, maxGasTokenAmount, options, accountClassHash) => fetch(
  `${baseUrl(options)}/paymaster/v1/build-typed-data`,
  postRequest(
    {
      userAddress,
      calls: formatCall(calls),
      gasTokenAddress,
      accountClassHash,
      ...maxGasTokenAmount !== void 0 && { maxGasTokenAmount: (0, import_ethers2.toBeHex)(maxGasTokenAmount) }
    },
    options
  )
).then((response) => parseResponse(response, options?.apiPublicKey));
var formatCall = (calls) => calls.map((call) => ({
  contractAddress: call.contractAddress,
  entrypoint: call.entrypoint,
  calldata: (Array.isArray(call.calldata) && "__compiled__" in call.calldata ? call.calldata : import_starknet.CallData.compile(call.calldata)).map((calldata) => (0, import_ethers2.toBeHex)(calldata))
}));
var fetchExecuteTransaction = (userAddress, typedData, signature, options, deploymentData) => {
  if (Array.isArray(signature)) {
    signature = signature.map((sig) => (0, import_ethers2.toBeHex)(BigInt(sig)));
  } else if (signature.r && signature.s) {
    signature = [(0, import_ethers2.toBeHex)(BigInt(signature.r)), (0, import_ethers2.toBeHex)(BigInt(signature.s))];
  }
  return fetch(
    `${baseUrl(options)}/paymaster/v1/execute`,
    postRequest(
      {
        userAddress,
        typedData,
        signature,
        ...deploymentData && {
          deploymentData: {
            ...deploymentData,
            sigdata: deploymentData.sigdata?.map((sig) => (0, import_ethers2.toBeHex)(BigInt(sig)))
          }
        }
      },
      options
    )
  ).then((response) => parseResponse(response, options?.apiPublicKey));
};
var executeCalls = async (account, calls, { gasTokenAddress, maxGasTokenAmount, deploymentData }, options) => {
  const accountClassHash = deploymentData ? deploymentData.class_hash : void 0;
  const typedData = await fetchBuildTypedData(
    account.address,
    calls,
    gasTokenAddress,
    maxGasTokenAmount,
    options,
    accountClassHash
  );
  const signature = await account.signMessage(typedData);
  return fetchExecuteTransaction(account.address, JSON.stringify(typedData), signature, options, deploymentData).then(
    (value) => ({
      transactionHash: value.transactionHash
    })
  );
};
var shouldAddValidationOverhead = (gasCost, dataGasCost, gasConsumedOverhead, dataGasConsumedOverhead) => {
  if (gasCost === void 0 || dataGasCost === void 0) return false;
  return !(gasConsumedOverhead === BigInt(0) && dataGasConsumedOverhead === BigInt(0));
};
var addValidationGasOverhead = (estimatedGasFees, gasCost, dataGasCost, gasConsumedOverhead, dataGasConsumedOverhead) => {
  if (shouldAddValidationOverhead(gasCost, dataGasCost, gasConsumedOverhead, dataGasConsumedOverhead)) {
    return estimatedGasFees + gasCost * gasConsumedOverhead + dataGasCost * dataGasConsumedOverhead;
  }
  return estimatedGasFees;
};
var getGasFeesInGasToken = (estimatedGasFeesInETH, gasTokenPrice, gasCost, dataGasCost, gasConsumedOverhead, dataGasConsumedOverhead) => {
  const gasFeesInETH = addValidationGasOverhead(
    estimatedGasFeesInETH,
    gasCost,
    dataGasCost,
    gasConsumedOverhead,
    dataGasConsumedOverhead
  );
  const gasFeesInGasToken = Number(gasFeesInETH) / Number(gasTokenPrice.priceInETH);
  return BigInt(Math.round(gasFeesInGasToken * 10 ** gasTokenPrice.decimals));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BASE_URL,
  ContractError,
  SEPOLIA_BASE_URL,
  aListOfGasTokenPrices,
  executeCalls,
  fetchAccountCompatibility,
  fetchAccountsRewards,
  fetchBuildTypedData,
  fetchExecuteTransaction,
  fetchGasTokenPrices,
  fetchGaslessStatus,
  formatCall,
  getGasFeesInGasToken
});
//# sourceMappingURL=index.js.map