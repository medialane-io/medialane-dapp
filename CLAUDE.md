# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npx tsc --noEmit # Type-check (zero-error target)
```

No test suite is configured. TypeScript build errors are intentionally ignored (`typescript.ignoreBuildErrors: true` in `next.config.ts`), but `npx tsc --noEmit` should stay clean.

## Architecture Overview

Medialane is a Next.js (App Router) dapp on **Starknet** with two primary features:

1. **Creator Launchpad** (`/launchpad`, `/create`) — mint and manage tokenized IP assets (IP Coins, Collection Drops, etc.)
2. **NFT Marketplace** (`/marketplace`) — list, buy, make offers, and auction IP NFTs

The app is deployed at [medialane.io](https://medialane.io) on Starknet Mainnet.

## Key Environment Variables

```
# Network
NEXT_PUBLIC_STARKNET_NETWORK          # "mainnet" or "sepolia" (defaults to mainnet)
NEXT_PUBLIC_RPC_URL                   # Alchemy/custom RPC endpoint

# Contracts
NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS  # Mediolano collection registry contract
NEXT_PUBLIC_MEDIALANE_CONTRACT_ADDRESS   # Marketplace contract
NEXT_PUBLIC_COLLECTIONS_CONTRACT_START_BLOCK  # Starting block for event queries

# IPFS
NEXT_PUBLIC_GATEWAY_URL               # Pinata IPFS gateway URL
PINATA_JWT                            # Server-side Pinata JWT (for uploads)

# Explorer
NEXT_PUBLIC_EXPLORER_URL              # Block explorer (default: voyager.online)

# Privy (social/email wallet — server-side secret must never be exposed to client)
NEXT_PUBLIC_PRIVY_APP_ID              # Privy app ID (public)
PRIVY_APP_SECRET                      # Privy app secret (server only)

# AVNU Paymaster (gasless/sponsored transactions)
NEXT_PUBLIC_AVNU_PAYMASTER_API_KEY    # AVNU API key — all tx types sponsored when present
```

## Wallet System

The app supports three wallet connection strategies, unified by `useUnifiedWallet`:

1. **Argent / Braavos** — injected browser wallets via `starknetkit` + `@starknet-react/core`
2. **Cartridge Controller** — session-key gaming wallet via StarkZap SDK (`OnboardStrategy.Cartridge`). Auto-gasless, policies scoped to collection + marketplace contracts.
3. **Privy** — email/social login via StarkZap SDK (`OnboardStrategy.Privy`). Keys managed server-side; no seed phrase required. Requires the two Privy API routes.

**Priority**: StarkZap wallet (Cartridge/Privy) takes priority over injected in `useUnifiedWallet`.

**Provider tree** (in `src/app/layout.tsx`):
```
ThemeProvider
  └─ Providers (PrivyProvider + StarkZapWalletProvider)  ← src/components/providers.tsx
       └─ StarknetProvider                               ← src/components/starknet-provider.tsx
```

**Key files**:
- `src/lib/starkzap.ts` — SDK singleton (`getStarkZapSdk()`), token presets, staking config
- `src/contexts/starkzap-wallet-context.tsx` — `StarkZapWalletProvider` + `useStarkZapWallet()`
- `src/hooks/use-unified-wallet.ts` — normalises all wallet types into one interface
- `src/components/providers.tsx` — PrivyProvider + StarkZapWalletProvider client wrapper
- `src/app/api/wallet/starknet/route.ts` — Privy wallet get-or-create (server)
- `src/app/api/wallet/sign/route.ts` — Privy raw signing endpoint (server)

**Compat note**: StarkZap bundles starknet v9 internally; the app uses v8 via starknet-react. They coexist — share primitives (addresses, tx hashes) as plain strings only; never mix Account objects across stacks.

## Starknet Integration Patterns

**Contract ABIs** live in `src/abis/` (e.g., `ip_market.ts`, `ip_collection.ts`, `ip_nft.ts`). Always import via these files rather than inline JSON.

**Marketplace order flow** (in `src/hooks/use-marketplace.ts`):
- Orders use **SNIP-12 typed data signing** (`getOrderParametersTypedData`, `getOrderFulfillmentTypedData` from `src/utils/marketplace-utils.ts`)
- Listings: sign → ERC721 `approve` + `register_order` multicall
- Offers: sign → ERC20 `approve` + `register_order` multicall
- Cart checkout: approve per-currency totals + sequential `fulfill_order` signatures, then one atomic multicall
- Cancellations: sign typed cancellation data → `cancel_order`

**Event/provenance queries** (`src/hooks/use-events.ts`): queries the registry contract for `TokenMinted`/`TokenTransferred` events plus the asset contract's standard ERC721 `Transfer` events, deduplicating across sources. Block timestamps are fetched in parallel.

**Constants** (`src/lib/constants.ts`): contract addresses, supported tokens (USDC, USDT, ETH, STRK with decimals), start blocks, and `AVNU_PAYMASTER_CONFIG`.

## AVNU Paymaster (Gasless Transactions)

Medialane collects a 1% fee on all marketplace and launchpad transactions, so gas costs are absorbed for users via AVNU.

**Core hook**: `usePaymasterTransaction` (`src/hooks/use-paymaster-transaction.ts`)
- `executeAuto(calls)` — **primary path**: tries sponsored gas first, silently falls back to `account.execute()` if AVNU rejects. Use this everywhere.
- `executeSponsored(calls)` — explicit sponsored path (requires API key)
- `executeGasless(calls, gasToken, maxAmount)` — user pays with alt token (USDC/USDT/etc.)
- `executeTraditional(calls)` — normal ETH/STRK gas

**Feature hooks**:
- `usePaymasterMinting` — `mint(recipient, tokenURI)` calls `executeAuto` internally
- `usePaymasterMarketplace` — re-exports `usePaymasterTransaction` for marketplace calls

**Rule**: always use `executeAuto` in new UI flows. Only use the explicit variants for advanced/override scenarios.

## StarkZap Feature Hooks

- `useTxTracker(txHash)` — real-time tx monitoring (status, explorerUrl, isConfirmed)
- `useTokenBalance(tokenKey, address)` — ERC20 balance for STRK/ETH/USDC/USDT
- `useAllTokenBalances(address)` — all four balances in parallel
- `useStaking(validatorAddress)` — STRK delegation: stake, exitIntent, exitPool, claimRewards

## Data Flow

1. **IPFS/Pinata**: Asset metadata and images are uploaded via server actions (`src/app/api/pinata/`, `src/app/api/forms-ipfs/`). Server-side Pinata SDK is configured in `src/services/config/server.config.ts`.
2. **On-chain reads**: Hooks in `src/hooks/` call Starknet contracts directly using `useContract`/`useProvider` from `@starknet-react/core`.
3. **Zustand stores**: Used for cart state and mint state (`src/hooks/use-mint.ts`).
4. **User profiles**: Stored/fetched via `src/services/user_settings.ts` (off-chain).

## Directory Structure

- `src/app/` — App Router pages/layouts. Key routes: `/marketplace`, `/launchpad`, `/create`, `/asset`, `/collections`, `/creator`, `/portfolio`, `/provenance`, `/licensing`
  - `src/app/api/wallet/` — Privy signing endpoints (server-side)
- `src/components/` — All UI components. `src/components/ui/` contains shadcn/ui base components
  - `src/components/providers.tsx` — PrivyProvider + StarkZapWalletProvider
- `src/contexts/` — React contexts (StarkZap wallet context)
- `src/hooks/` — React hooks for contract interaction, data fetching, and state
  - `src/hooks/contracts/` — Low-level contract hooks
  - `src/hooks/use-unified-wallet.ts` — unified wallet interface
  - `src/hooks/use-paymaster-transaction.ts` — core paymaster hook
  - `src/hooks/use-paymaster-minting.ts` — sponsored minting
  - `src/hooks/use-paymaster-marketplace.ts` — sponsored marketplace ops
  - `src/hooks/use-tx-tracker.ts` — real-time transaction monitoring
  - `src/hooks/use-token-balance.ts` — ERC20 balance reads
  - `src/hooks/use-staking.ts` — STRK delegation staking
- `src/lib/` — Shared utilities, types, and constants
  - `src/lib/types.ts` — Core types: `NFT`, `Collection`, `Asset`, `DisplayAsset`, `UserProfile`, `IPType`
  - `src/lib/constants.ts` — Contract addresses, supported tokens, block numbers, AVNU config
  - `src/lib/starkzap.ts` — StarkZap SDK singleton and token presets
- `src/abis/` — Starknet contract ABI files
- `src/services/` — Service layer: Pinata config, licensing service
- `src/types/` — Shared TypeScript types (paymaster, etc.)
- `src/utils/` — Helper functions (SEO, marketplace utils, IPFS, starknet address utils, paymaster utils)
- `src/actions/` — Next.js Server Actions

## Conventions

- Filenames: `kebab-case`; components: `PascalCase`
- Absolute imports with `@/` prefix throughout
- Tailwind CSS for all styling; avoid custom CSS
- Starknet addresses should be normalized using `normalizeStarknetAddress` from `src/lib/utils.ts`
- Token IDs are represented as `bigint` in contract calls and decoded as `u256` (low + high << 128)
- All contract calls that modify state go through `executeAuto` (paymaster) or `account.execute()` — never call contracts directly in server code
- New transaction flows should default to `executeAuto` from `usePaymasterTransaction` or the feature-specific paymaster hook
