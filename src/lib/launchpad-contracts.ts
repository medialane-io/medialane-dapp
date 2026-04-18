export const POP_FACTORY_CONTRACT =
  (process.env.NEXT_PUBLIC_POP_FACTORY_CONTRACT as `0x${string}`) ||
  ("0x00b32c34b427d8f346b5843ada6a37bd3368d879fc752cd52b68a87287f60111" as `0x${string}`);

export type PopEventType =
  | "Conference"
  | "Bootcamp"
  | "Workshop"
  | "Hackathon"
  | "Meetup"
  | "Course"
  | "Other";

/** Minimal ABI — POP Factory: create_collection */
export const POPFactoryABI = [
  {
    type: "enum",
    name: "launchpad::pop::EventType",
    variants: [
      { name: "Conference", type: "()" },
      { name: "Bootcamp",   type: "()" },
      { name: "Workshop",   type: "()" },
      { name: "Hackathon",  type: "()" },
      { name: "Meetup",     type: "()" },
      { name: "Course",     type: "()" },
      { name: "Other",      type: "()" },
    ],
  },
  {
    type: "function",
    name: "create_collection",
    inputs: [
      { name: "name",           type: "core::byte_array::ByteArray"                   },
      { name: "symbol",         type: "core::byte_array::ByteArray"                   },
      { name: "base_uri",       type: "core::byte_array::ByteArray"                   },
      { name: "claim_end_time", type: "core::integer::u64"                            },
      { name: "event_type",     type: "launchpad::pop::EventType"                     },
    ],
    outputs: [{ type: "core::starknet::contract_address::ContractAddress" }],
    state_mutability: "external",
  },
] as const;

/** Minimal ABI — POP Collection: claim, batch_add_to_allowlist, remove_from_allowlist */
export const POPCollectionABI = [
  {
    type: "function",
    name: "claim",
    inputs: [],
    outputs: [],
    state_mutability: "external",
  },
  {
    type: "function",
    name: "batch_add_to_allowlist",
    inputs: [
      { name: "addresses_len", type: "core::integer::u32" },
      { name: "addresses",     type: "core::array::Array::<core::starknet::contract_address::ContractAddress>" },
    ],
    outputs: [],
    state_mutability: "external",
  },
  {
    type: "function",
    name: "remove_from_allowlist",
    inputs: [{ name: "address", type: "core::starknet::contract_address::ContractAddress" }],
    outputs: [],
    state_mutability: "external",
  },
] as const;
