const { RpcProvider } = require('starknet');

async function run() {
  const provider = new RpcProvider({ nodeUrl: "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_10/XMf1wnT2l23Q7xWeQBPVI" });
  const address = "0xa2663e84fa67c1c5c0356891ffa280a47bc1319642b92e10689bf2baa0077d";

  try {
    const classHash = await provider.getClassHashAt(address);
    console.log("Class Hash:", classHash);

    const contractClass = await provider.getClassAt(address);
    console.log("ABI entrypoints:");
    contractClass.abi.forEach(item => {
      if (item.type === 'function') {
        console.log(`- ${item.name} (${item.state_mutability})`);
      }
    });

  } catch (e) {
    console.error(e);
  }
}

run();
