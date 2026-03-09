const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/'
];

function processIPFSHashToUrl(input, fallbackUrl) {
  if (typeof input !== "string") return fallbackUrl;

  let processedUrl = input.replace(/\0/g, "").trim();

  // Handle undefined prefix
  if (processedUrl.startsWith("undefined/")) {
    const cid = processedUrl.replace("undefined/", "");
    if (cid.match(/^[a-zA-Z0-9]+$/) && cid.length >= 34) {
      return `${IPFS_GATEWAYS[0]}${cid}`;
    } else {
      return fallbackUrl;
    }
  }

  // Reject inputs too short to be valid CIDs
  if (
    processedUrl.length < 34 &&
    !processedUrl.startsWith("http") &&
    !processedUrl.startsWith("/")
  ) {
    return fallbackUrl;
  }

  // Raw CID
  if (processedUrl.match(/^[a-zA-Z0-9]+$/) && processedUrl.length >= 34) {
    return `${IPFS_GATEWAYS[0]}${processedUrl}`;
  }

  // Existing gateway URLs
  if (IPFS_GATEWAYS.some((gateway) => processedUrl.startsWith(gateway))) {
    return processedUrl;
  }

  // ipfs:/CID, ipfs://CID, ipfs:ipfs/CID
  if (processedUrl.startsWith("ipfs:")) {
    const cid = processedUrl.replace(/^ipfs:(?:ipfs)?\/+/, "");
    return `${IPFS_GATEWAYS[1]}${cid}`;
  }

  if (processedUrl.startsWith("http")) {
    return processedUrl;
  }

  return fallbackUrl || "";
}

const testInputs = [
    "ipfs://bafybeids4ev5yqyfzifzcgh6snzhiozju7j753r7npoje6d2tqkpy7qy7u",
    "bafybeids4ev5yqyfzifzcgh6snzhiozju7j753r7npoje6d2tqkpy7qy7u",
    "ipfs://bafkreigv5edug537qwy5vx56ki5ydxk2nbfjcar3rudqprofv6kj2s6jdm",
    "undefined/bafybeids4ev5yqyfzifzcgh6snzhiozju7j753r7npoje6d2tqkpy7qy7u"
];

testInputs.forEach(input => {
    console.log(`Input: ${input}`);
    console.log(`Output: ${processIPFSHashToUrl(input, "/placeholder.svg")}`);
    console.log("---");
});
