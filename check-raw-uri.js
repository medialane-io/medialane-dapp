const { RpcProvider, hash } = require('starknet');

async function run() {
  const provider = new RpcProvider({ nodeUrl: "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_10/XMf1wnT2l23Q7xWeQBPVI" });
  const address = "0xa2663e84fa67c1c5c0356891ffa280a47bc1319642b92e10689bf2baa0077d";

  try {
    const entrypoint = hash.getSelectorFromName("token_uri");
    console.log("Selector:", entrypoint);

    const res = await provider.callContract({
      contractAddress: address,
      entrypoint: "token_uri",
      calldata: ["1", "0"]
    });
    console.log("Token 1 URI Raw Output:", res);

  } catch (e) {
    console.error("token_uri(1) failed:", e.message);
    try {
        const res = await provider.callContract({
          contractAddress: address,
          entrypoint: "token_uri",
          calldata: ["0", "0"]
        });
        console.log("Token 0 URI Raw Output:", res);
    } catch (e2) {
        console.error("token_uri(0) failed:", e2.message);
    }
  }
}

run();
