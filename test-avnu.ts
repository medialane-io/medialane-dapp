import { CallData, byteArray, num } from "starknet";

async function main() {
  const collectionContractAddress = "0x05e73b7be06d82beeb390a0e0d655f2c9e7cf519658e04f05d9c690ccc41da03";
  const apiKey = "75345246-2873-4328-b559-902e30dddf27";
  const testUserAddress = "0x05aF1CDA8B28a9bC06D3b4b840eA7D40DbdcC7C36dF0EEB85aCaAcB413E78b1A";
  
  const collection_id = "20";
  const recipient = testUserAddress;
  const token_uri = "ipfs://QmY5K3J4...";
  
  const tokenUriByteArray = byteArray.byteArrayFromString(token_uri);
  
  const rawCalldata = CallData.compile([
    collection_id,
    0, // u256 high
    recipient,
    tokenUriByteArray
  ]);
  
  const contractCall = {
    contractAddress: collectionContractAddress,
    entrypoint: "mint",
    calldata: rawCalldata
  };
  
  const formattedCalls = [contractCall].map((call) => ({
    ...call,
    calldata: call.calldata 
      ? (call.calldata as Array<string | number | bigint>).map((c) => num.toHex(c)) 
      : undefined,
  }));
  
  console.log("Formatted call object:", JSON.stringify(formattedCalls, null, 2));
  
  const res = await fetch("https://starknet.api.avnu.fi/paymaster/v1/build-typed-data", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userAddress: testUserAddress,
      gasTokenAddress: null,
      maxGasTokenAmount: null,
      calls: formattedCalls,
    }),
  });
  
  console.log("Status:", res.status);
  if (!res.ok) {
    const errorBody = await res.text();
    console.error("Error from AVNU:", errorBody);
  } else {
    const data = await res.json();
    console.log("Success:", data);
  }
}

main().catch(console.error);
