const { RpcProvider, Contract } = require('starknet');

const MINIMAL_COLLECTION_ABI = [
  {
    type: "function",
    name: "get_collection_id",
    inputs: [],
    outputs: [{ type: "core::integer::u256" }],
    state_mutability: "view",
  }
];

const MINIMAL_MIP_ABI = [
  {
    type: "struct",
    name: "core::byte_array::ByteArray",
    members: [
      { name: "data", type: "core::array::Array::<core::bytes_31::bytes31>" },
      { name: "pending_word", type: "core::felt252" },
      { name: "pending_word_len", type: "core::integer::u32" },
    ],
  },
  {
    type: "struct",
    name: "ip_collection_erc_721::types::Collection",
    members: [
      { name: "name", type: "core::byte_array::ByteArray" },
      { name: "symbol", type: "core::byte_array::ByteArray" },
      { name: "base_uri", type: "core::byte_array::ByteArray" },
      { name: "owner", type: "core::starknet::contract_address::ContractAddress" },
      { name: "ip_nft", type: "core::starknet::contract_address::ContractAddress" },
      { name: "is_active", type: "core::bool" },
    ],
  },
  {
    type: "function",
    name: "get_collection",
    inputs: [{ name: "collection_id", type: "core::integer::u256" }],
    outputs: [{ type: "ip_collection_erc_721::types::Collection" }],
    state_mutability: "view",
  },
];

async function run() {
  const provider = new RpcProvider({ nodeUrl: "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_10/XMf1wnT2l23Q7xWeQBPVI" });
  const collectionAddress = "0xa2663e84fa67c1c5c0356891ffa280a47bc1319642b92e10689bf2baa0077d";
  const MIPAddress = "0x05e73b7be06d82beeb390a0e0d655f2c9e7cf519658e04f05d9c690ccc41da03";

  const collectionContract = new Contract({ abi: MINIMAL_COLLECTION_ABI, address: collectionAddress, providerOrAccount: provider });
  const mipContract = new Contract({ abi: MINIMAL_MIP_ABI, address: MIPAddress, providerOrAccount: provider });

  try {
    console.log("Calling get_collection_id...");
    const collectionIdResult = await collectionContract.call("get_collection_id", []);
    console.log("Collection ID Result:", JSON.stringify(collectionIdResult, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    , 2));

    const collectionId = typeof collectionIdResult === 'object'
      ? (BigInt(collectionIdResult.high) << 128n) + BigInt(collectionIdResult.low)
      : BigInt(collectionIdResult);
    
    console.log("Parsed Collection ID:", collectionId.toString());

    console.log("Calling get_collection...");
    const collectionDetails = await mipContract.call("get_collection", [collectionId.toString()]);
    console.log("Collection Details Raw:", JSON.stringify(collectionDetails, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    , 2));

    const nftAddress = "0x" + BigInt(collectionDetails.ip_nft).toString(16);
    console.log("NFT Address Hex:", nftAddress);

    const nftContract = new Contract({
      abi: [
        { name: "name", type: "function", inputs: [], outputs: [{ type: "core::byte_array::ByteArray" }], state_mutability: "view" },
        { name: "token_uri", type: "function", inputs: [{ name: "token_id", type: "core::integer::u256" }], outputs: [{ type: "core::byte_array::ByteArray" }], state_mutability: "view" },
        { name: "total_supply", type: "function", inputs: [], outputs: [{ type: "core::integer::u256" }], state_mutability: "view" },
        {
          type: "struct",
          name: "core::byte_array::ByteArray",
          members: [
            { name: "data", type: "core::array::Array::<core::bytes_31::bytes31>" },
            { name: "pending_word", type: "core::felt252" },
            { name: "pending_word_len", type: "core::integer::u32" },
          ],
        }
      ],
      address: nftAddress,
      providerOrAccount: provider
    });

    try {
      console.log("Calling NFT name()...");
      const nftName = await nftContract.call("name", []);
      console.log("NFT Name:", JSON.stringify(nftName, null, 2));
    } catch (e) { console.log("NFT name() failed"); }

    try {
      console.log("Calling NFT total_supply()...");
      const ts = await nftContract.call("total_supply", []);
      console.log("NFT Total Supply:", JSON.stringify(ts, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
      
      console.log("Calling NFT token_uri(1)...");
      const uri = await nftContract.call("token_uri", ["1", "0"]);
      console.log("NFT Token URI #1:", JSON.stringify(uri, null, 2));
    } catch (e) { 
      console.log("NFT token_uri(1) failed, trying token_uri(0)...");
      try {
        const uri = await nftContract.call("token_uri", ["0", "0"]);
        console.log("NFT Token URI #0:", JSON.stringify(uri, null, 2));
      } catch (e2) {
        console.log("NFT token_uri(0) failed");
      }
    }

  } catch (e) {
    console.error("Error during execution:", e);
  }
}

run();
