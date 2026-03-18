import { RpcProvider, shortString } from "starknet";

const provider = new RpcProvider({ nodeUrl: "https://starknet-mainnet.g.alchemy.com/v2/xEm-WxiDbsIS1fnd5qC0s" });

async function main() {
    // A known featured collection from src/lib/featured-collections.ts
    const contract = "0x00b618e6abbfe1131d31bcd5d8e57c333adae57b0a271289e39d6e4091c0160b";
    const tokenId = "1";

    console.log("Calling token_uri via raw RPC...");
    try {
        const uriData = await provider.callContract({
            contractAddress: contract,
            entrypoint: "token_uri",
            calldata: [tokenId, "0"]
        });
        console.log("Raw response length:", uriData.length);
        console.dir(uriData, { maxArrayLength: null });

        function decodeByteArray(data) {
            if (!data || data.length < 1) return "";
            try {
                const firstValue = BigInt(data[0]);
                if (firstValue > 1000n && data.length === 1) {
                    return shortString.decodeShortString(data[0]).replace(/\0/g, "").trim();
                }

                const numWords = Number(firstValue);
                let str = "";
                for (let i = 0; i < numWords; i++) {
                    const word = data[i + 1];
                    if (word) str += shortString.decodeShortString(word);
                }
                if (data.length >= numWords + 3) {
                    const pendingWord = data[numWords + 1];
                    const pendingLen = Number(data[numWords + 2]);
                    if (pendingLen > 0 && pendingWord) {
                        const decoded = shortString.decodeShortString(pendingWord);
                        str += decoded.substring(0, pendingLen);
                    }
                }
                return str.replace(/\0/g, "").trim();
            } catch (e) {
                return data[0] ? shortString.decodeShortString(data[0]).replace(/\0/g, "").trim() : "";
            }
        }

        console.log("Decoded string (ByteArray method):", decodeByteArray(uriData));
    } catch (e) {
        console.error("Error with token_uri:", e.message);
    }
}

main();
