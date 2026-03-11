# GASLESS-SDK

gasless-sdk is a typeScript SDK allowing you to easily provide gasless transactions to your users

## Installation

```shell
npm install @avnu/gasless-sdk

# or

yarn add @avnu/gasless-sdk
```

## Usage

```ts
// First retrieve the gas token prices
const gastokenPrices = await fetchGasTokenPrices();

// Build your TX
const calls: Call[] = [
  // ...
];

// Estimate the gas cost as you want
// Example: 
const fees = await account.estimateInvokeFee(calls, { blockIdentifier: 'latest', skipValidate: true })
const estimatedGasFees = fees.overall_fee

// Make your user choose the gas token
const gasTokenAddress = gastokenPrices[0].tokenAddress

// Execute the calls
await executeCalls(account, calls, { gasTokenAddress, gasTokenPrices, estimatedGasFees })
```

## Example

This repository includes a basic example in the `[/examples](/examples)` folder.
