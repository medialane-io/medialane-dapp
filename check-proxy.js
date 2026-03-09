const { RpcProvider } = require('starknet');

async function run() {
  const provider = new RpcProvider({ nodeUrl: "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_10/XMf1wnT2l23Q7xWeQBPVI" });
  const address = "0xa2663e84fa67c1c5c0356891ffa280a47bc1319642b92e10689bf2baa0077d";

  try {
    // Try common proxy entrypoints
    const entrypoints = ["get_implementation", "implementation", "getImplementation"];
    for (const e of entrypoints) {
      try {
        const res = await provider.callContract({
          contractAddress: address,
          entrypoint: e,
          calldata: []
        });
        console.log(`Entrypoint ${e} returned:`, res[0]);
      } catch (err) {
        // console.log(`${e} failed`);
      }
    }

    // Check storage slot for implementation (standard EIP-1967 like or Starknet specific)
    // Starknet implementation slot is often: 0x56a42095cc606399c43d9203c9e924b10504f21db285e2373030f1bfa9d012e
    const slot = "0x56a42095cc606399c43d9203c9e924b10504f21db285e2373030f1bfa9d012e";
    const impl = await provider.getStorageAt(address, slot);
    console.log("Implementation from slot:", impl);

  } catch (e) {
    console.error(e);
  }
}

run();
