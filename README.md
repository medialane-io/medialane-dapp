# Medialane: Creators Capital Markets on the Integrity Web

Medialane is the monetization hub and financial infrastructure for the Creators Capital Markets — a Creator Launchpad and IP Marketplace engineered for the integrity web, enabling trustless, verifiable financial activity. Our vision is to ensure that creators, businesses, and AI can fully own, trade, and generate capital from intellectual property with sovereignty, control, and transparency.

Our ecosystem is engineered to support the next generation of finance: a verifiable engine that allows humans and autonomous AI agents to generate value and revenue streams from creative work.

**Live dApp (Starknet Mainnet):** https://medialane.io

---

## Core Features

### Creator Launchpad
The engine for capital structuring — create financial assets and structured revenue products:
- **IP Coins** — tokenize intellectual property into tradeable assets
- **Creator Coins** — personal creator economy tokens
- **Collection Drops** — curated NFT collection launches
- **IP Clubs** — gated creator communities
- **Memberships & Subscriptions** — recurring revenue streams
- **IP Tickets** — tokenized access and event passes

### NFT Marketplace
The High-Integrity Exchange — the central secondary market for licensing and trading all tokenized creator assets:
- List, buy, and auction IP NFTs
- Make and accept offers
- Cart-based multi-asset checkout
- On-chain provenance and ownership verification
- Programmable licensing terms enforced by smart contracts

---

## Fee Structure

| Service | Fee |
|---|---|
| Creator Launchpad revenue products | 2% |
| NFT Marketplace trading, auctions, remix & licensing | 1% |

Gas fees are sponsored for all users via the AVNU Paymaster — the protocol fee covers these costs, so users transact with zero friction.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Blockchain | Starknet Mainnet |
| RPC | Alchemy |
| Wallet — Browser | Argent / Braavos via starknetkit |
| Wallet — Gaming | Cartridge Controller (session keys, auto-gasless) |
| Wallet — Social | Privy (email / Google / Twitter, no seed phrase) |
| Wallet SDK | StarkZap |
| Gasless Transactions | AVNU Paymaster |
| IP Tokenization | Mediolano Protocol (zero-fee) |
| Marketplace Protocol | Medialane Protocol (SNIP-12 signed orders) |
| Styling | Tailwind CSS + shadcn/ui |
| Language | TypeScript |
| IPFS | Pinata |
| Deployment | Vercel |

---

## Wallet Options

Medialane supports three wallet strategies side by side — users choose what suits them:

| Strategy | Best for | Gas |
|---|---|---|
| **Argent / Braavos** | Existing Starknet users | Sponsored via AVNU |
| **Cartridge Controller** | Gamers, power users | Auto-gasless (session keys) |
| **Privy (Email / Social)** | Web2 onboarding | Sponsored via AVNU |

All strategies are unified under a single `useUnifiedWallet` hook. The connected wallet type is shown as a badge in the account panel.

---

## Architecture

```
src/
├── app/                        # Next.js App Router pages
│   ├── api/
│   │   ├── wallet/sign/        # Privy server-side signing
│   │   ├── wallet/starknet/    # Privy wallet provisioning
│   │   ├── pinata/             # IPFS upload endpoints
│   │   └── forms-ipfs/         # Form-based IPFS uploads
│   ├── marketplace/            # NFT Marketplace
│   ├── launchpad/              # Creator Launchpad
│   ├── create/                 # Asset & collection creation
│   ├── portfolio/              # User portfolio & activity
│   ├── collections/            # Collection explorer
│   ├── creator/[slug]/         # Creator profiles
│   ├── asset/[slug]/           # Asset detail pages
│   ├── provenance/             # On-chain provenance
│   └── licensing/              # IP licensing
├── components/
│   ├── providers.tsx           # PrivyProvider + StarkZapWalletProvider
│   ├── starknet-provider.tsx   # StarknetConfig (starknet-react)
│   ├── header/
│   │   └── wallet-connect.tsx  # 3-option connect dialog + account sheet
│   └── ui/                     # shadcn/ui base components
├── contexts/
│   └── starkzap-wallet-context.tsx  # Cartridge + Privy wallet state
├── hooks/
│   ├── use-unified-wallet.ts        # Single interface across all wallet types
│   ├── use-paymaster-transaction.ts # Core AVNU paymaster hook (executeAuto)
│   ├── use-paymaster-minting.ts     # Sponsored minting
│   ├── use-paymaster-marketplace.ts # Sponsored marketplace ops
│   ├── use-tx-tracker.ts           # Real-time transaction monitoring
│   ├── use-token-balance.ts        # ERC20 balance reads
│   ├── use-staking.ts              # STRK delegation staking
│   ├── use-marketplace.ts          # SNIP-12 order creation & fulfillment
│   ├── use-activities.ts           # On-chain activity feed
│   └── ...                         # Collection, asset, portfolio hooks
├── lib/
│   ├── starkzap.ts             # StarkZap SDK singleton + token presets
│   ├── constants.ts            # Contract addresses, tokens, AVNU config
│   └── types.ts                # Core domain types
├── abis/                       # Starknet contract ABIs
├── types/
│   └── paymaster.ts            # AVNU Paymaster types
└── utils/
    ├── paymaster.ts            # AVNU SDK wrappers
    ├── marketplace-utils.ts    # SNIP-12 typed data helpers
    └── ...
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_STARKNET_NETWORK` | `mainnet` or `sepolia` |
| `NEXT_PUBLIC_RPC_URL` | Alchemy or custom RPC endpoint |
| `NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS` | Mediolano collection registry |
| `NEXT_PUBLIC_MEDIALANE_CONTRACT_ADDRESS` | Medialane marketplace contract |
| `NEXT_PUBLIC_COLLECTIONS_CONTRACT_START_BLOCK` | Starting block for event queries |
| `NEXT_PUBLIC_EXPLORER_URL` | Block explorer base URL |
| `NEXT_PUBLIC_GATEWAY_URL` | IPFS gateway URL |
| `PINATA_JWT` | Pinata JWT for server-side uploads |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy app ID (public) |
| `PRIVY_APP_SECRET` | Privy app secret (**server only, never expose**) |
| `NEXT_PUBLIC_AVNU_PAYMASTER_API_KEY` | AVNU API key for sponsored gas |

---

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type-check (zero-error target)
npx tsc --noEmit

# Lint
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Protocol Integrations

### Mediolano Protocol
Zero-fee IP tokenization layer. Provides the collection registry contract, on-chain provenance tracking, and ERC721 asset ownership.

### Medialane Protocol
Marketplace smart contracts built on SNIP-12 typed data signing. Order flow:
1. Seller signs order parameters off-chain
2. ERC721 `approve` + `register_order` multicall submitted on-chain
3. Buyer fulfills via signed `fulfill_order` data + `approve` + execute multicall
4. Cancellations signed off-chain → `cancel_order`

### AVNU Paymaster
All transactions attempt sponsored execution first (`executeAuto`), falling back silently to traditional gas if AVNU rejects. Users never need to hold ETH/STRK to interact with the protocol.

### StarkZap SDK
Abstracts Cartridge Controller (session keys, gaming UX) and Privy (email/social, server-managed keys) wallet strategies. Transaction monitoring (`useTxTracker`), ERC20 balance reads (`useTokenBalance`), and STRK staking (`useStaking`) are all powered by StarkZap.

---

## Roadmap

| Milestone | Date |
|---|---|
| Medialane Protocol @ Starknet Sepolia | Nov 2025 |
| Medialane Dapp @ Starknet Sepolia | Nov 2025 |
| Medialane Onboarding @ Starknet Mainnet | Jan 2026 |
| Medialane Protocol @ Starknet Mainnet | Feb 2026 |
| Medialane Creator Launchpad @ Starknet Mainnet | Mar 2026 |
| Medialane Marketplace @ Starknet Mainnet | Mar 2026 |

---

## License

Medialane Protocol. All rights reserved.
