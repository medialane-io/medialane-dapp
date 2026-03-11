import { Account, constants, CallData, byteArray, PaymasterRpc } from "starknet";

async function main() {
  const collectionContractAddress = "0x05e73b7be06d82beeb390a0e0d655f2c9e7cf519658e04f05d9c690ccc41da03";
  const apiKey = "75345246-2873-4328-b559-902e30dddf27";
  const testUserAddress = "0x05aF1CDA8B28a9bC06D3b4b840eA7D40DbdcC7C36dF0EEB85aCaAcB413E78b1A";
  
  const endpoint = "https://starknet.paymaster.avnu.fi";
  
  // They recommend using PaymasterRpc
  const paymaster = new PaymasterRpc({
    nodeUrl: endpoint,
    headers: {
      'x-paymaster-api-key': apiKey,
    },
  });

  console.log("Paymaster initialized with URL:", endpoint);
  
  const tokenUriByteArray = byteArray.byteArrayFromString("ipfs://QmY5K3J4...");
  const rawCalldata = CallData.compile([
    "20",
    0, // u256 high
    testUserAddress,
    tokenUriByteArray
  ]);
  
  const contractCall = {
    contractAddress: collectionContractAddress,
    entrypoint: "mint",
    calldata: rawCalldata
  };
  
  // According to pure RPC specs, we just send a JSON RPC payload
  const jsonRpcPayload = {
    jsonrpc: "2.0",
    method: "starknet_estimateFee", // test if estimating fee works
    id: 1,
    params: [
      {
        type: "INVOKE",
        sender_address: testUserAddress,
        calldata: rawCalldata, // Usually RPC accepts normal serialized calldata arrays
        signature: [], // estimateFee doesn't strictly need a correct signature unless validating
        version: "0x3"
      },
      "latest",
    ]
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-paymaster-api-key": apiKey
    },
    body: JSON.stringify(jsonRpcPayload)
  });
  
  console.log("Status:", res.status);
  const text = await res.text();
  try {
    console.log("Response:", JSON.parse(text));
  } catch(e) {
    console.log("Response text:", text);
  }
}

main().catch(console.error);
