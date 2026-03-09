async function run() {
  const cid = "bafkreigv5edug537qwy5vx56ki5ydxk2nbfjcar3rudqprofv6kj2s6jdm";
  const gateways = [
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/'
  ];

  for (const gateway of gateways) {
    try {
      console.log(`Checking gateway: ${gateway}`);
      const res = await fetch(`${gateway}${cid}`);
      if (res.ok) {
        const json = await res.json();
        console.log("Metadata Content:", JSON.stringify(json, null, 2));
        return;
      }
    } catch (e) {
      console.warn(`Gateway ${gateway} failed:`, e.message);
    }
  }
}

run();
