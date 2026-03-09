import { RpcProvider, Contract, Abi } from 'starknet';

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
  const provider = new RpcProvider({ nodeUrl: "https://starknet-mainnet.public.blastapi.io" });
  const collectionAddress = "0xa2663e84fa67c1c5c0356891ffa280a47bc1319642b92e10689bf2baa0077d";
  const MIPAddress = "0x05e73b7be06d82beeb390a0e0d655f2c9e7cf519658e04f05d9c690ccc41da03";

  const collectionContract = new Contract({ abi: MINIMAL_COLLECTION_ABI as Abi, address: collectionAddress, providerOrAccount: provider });
  const mipContract = new Contract({ abi: MINIMAL_MIP_ABI as Abi, address: MIPAddress, providerOrAccount: provider });

  try {
    const collectionIdResult: any = await collectionContract.call("get_collection_id", []);
    console.log("Collection ID Result:", JSON.stringify(collectionIdResult, null, 2));

    const collectionId = typeof collectionIdResult === 'object'
      ? (BigInt(collectionIdResult.high) << 128n) + BigInt(collectionIdResult.low)
      : BigInt(collectionIdResult);
    
    console.log("Parsed Collection ID:", collectionId.toString());

    const collectionDetails: any = await mipContract.call("get_collection", [collectionId.toString()]);
    console.log("Collection Details Raw:", JSON.stringify(collectionDetails, null, 2));

  } catch (e) {
    console.error(e);
  }
}

run();
