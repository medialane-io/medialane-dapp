import { RpcProvider } from "starknet";
const p = new RpcProvider({ nodeUrl: "https://starknet-mainnet.public.blastapi.io" });
p.getBlock("latest").then(b => console.log(b.timestamp));
