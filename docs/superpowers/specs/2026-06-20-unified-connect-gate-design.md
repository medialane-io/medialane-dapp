# Unified Connect Gate — Launchpad & Portfolio

**Date:** 2026-06-20
**Status:** Design — approved, pending implementation plan

## Problem

A creator who opens a Launchpad or Portfolio page **without a connected wallet**
hits a different experience on almost every page. Each protected page decides
independently how to gate on connection, and they disagree. The observed
behaviors today:

| Page | Disconnected behavior | Verdict |
|---|---|---|
| `/portfolio/*` (gated in `portfolio/layout.tsx`) | **Infinite skeleton.** `if (!isConnected && !walletAddress)` is *true* for a genuinely disconnected user, so the connect panel below it is never reached. | Bug — "loads forever" |
| `/create/asset` | **No gate.** Renders the full form + the "You don't have any collections yet. Create one first." empty state. | Bug — "no collection, confusing" |
| `/create/collection` | No gate — full form, only blocks on submit with a toast. | Inconsistent |
| `/launchpad/coin/create` | Inline `<ConnectWallet>` on the launch button only; the rest of the form still renders. | Inconsistent |
| `/launchpad/drop/create`, `/launchpad/nfteditions/create`, `/launchpad/pop/create`, `/launchpad/pop/my-events` | Full-page connect panel — the **right pattern**, but each hand-rolls slightly different copy / icon / spacing. | Correct idea, 4+ copies |
| `/launchpad/drop/my-drops` | Full-page gate, bespoke markup, does **not** use the shared `<ConnectWallet/>`. | Inconsistent |

### Root cause of the flash / infinite-load class of bugs

The app already has a single source of truth for the wallet (`useWallet()`) and a
single shared connect button (`<ConnectWallet/>`). The instability comes from one
gap: the **manual reconnect loop** in `src/contexts/wallet-context.tsx`
(approx. lines 110–146) retries injected-wallet reconnection for ~6 seconds on
page load for a returning user, but it **does not report itself** through
`isConnecting`. `isConnecting` is derived only from starknet-react's
`injectedStatus` (`"connecting"` / `"reconnecting"`) plus StarkZap's
`szConnecting`. During the manual-retry window `injectedStatus` is typically
`"disconnected"`, so a *settling* returning user reads exactly the same state as a
*never-connected* user: `isConnected=false, isConnecting=false`.

Consequently:
- Pages that gate naively on `!isConnected` **flash the connect panel** for a
  returning user before reconnect completes.
- `portfolio/layout.tsx` tried to suppress that flash with a
  `!isConnected && !walletAddress` skeleton branch — but that condition is *also*
  true for a genuinely disconnected user, so it shows the skeleton **forever** and
  never reaches its own connect panel.

Any unified gate must distinguish "still settling" from "settled-disconnected,"
which is impossible until the context surfaces the reconnect window. **The fix has
a root part (context) and a presentation part (gate component).**

## Goals

- One consistent, friendly "connect your wallet" experience across every protected
  Launchpad and Portfolio page.
- A returning user never sees a connect-panel flash, and never an infinite
  skeleton.
- A disconnected user on `/create/asset` is asked to connect — not shown an empty
  form claiming they have no collections.
- Each page can still give a context-specific, friendly message.

## Non-goals

- No redesign of the connect panel's visual style — reuse the current
  icon + heading + `<ConnectWallet/>` look. (A richer panel can come later.)
- No change to wallet connection logic, connectors, persistence, or the provider
  tree beyond surfacing the existing reconnect window.
- No gating of public discovery pages — `/launchpad` landing, `/marketplace`,
  `/asset/*`, `/collections/*` stay open. These are "outer" pages; only "inner
  content" (create / manage / my-* / portfolio sub-pages) is gated.
- No backend changes. No new dependencies.

## Design

### 1. Root fix — make "reconnecting" observable (`src/contexts/wallet-context.tsx`)

Introduce a bounded `reconnecting` state that tracks the manual reconnect loop:

- Set `true` when the loop actually starts — i.e. the persisted choice
  (`readPersistedWallet()`) is `"argent"` or `"braavos"` **and** no wallet is
  currently live (`!liveConnectedRef.current && !liveSzRef.current`).
- Set `false` in the loop's completion path: on successful `connectAsync`, when the
  retry budget is exhausted, and in the effect cleanup (`cancelled`).

Fold it into the existing derived flag:

```ts
const isConnecting =
  szConnecting ||
  injectedStatus === "connecting" ||
  injectedStatus === "reconnecting" ||
  reconnecting;
```

Because the loop is already bounded to ~6s (15 × 400ms after a 500ms warm-up),
`isConnecting` is guaranteed to settle — it can never stick on indefinitely, so
this removes the *infinite-skeleton* failure mode at the source while also closing
the *flash* window. `isConnecting` is already exposed through `useWalletContext()`
→ `useWallet()`; no API surface change.

### 2. New component — `<ConnectGate>` (`src/components/connect-gate.tsx`)

A single client-component wrapper that renders one of three states off
`useWallet()`:

```tsx
type ConnectGateProps = {
  children: React.ReactNode;
  title?: string;       // default: "Connect your wallet"
  subtitle?: string;    // default: "Connect your wallet to continue."
  icon?: React.ReactNode; // default: <Wallet/>
};
```

- **`isConnecting`** → a centered skeleton/spinner placeholder. Returning users see
  this (not the connect panel) until reconnect settles.
- **`!isConnected`** → the friendly connect panel: the existing centered
  icon + heading + subtitle + `<ConnectWallet/>` button, styled to match the
  current `drop/create` / `pop/create` panels (unchanged visuals). Uses the
  `title` / `subtitle` / `icon` props, falling back to the generic defaults.
- **connected** → renders `children`.

The panel markup is lifted verbatim from the existing
`pop/create` / `drop/create` not-connected branch so there is no visual
regression — it is simply centralized.

### 3. Adoption — wrap each "inner content" page body in `<ConnectGate>`

**Replace** existing hand-rolled gates (delete the bespoke not-connected branch,
wrap the page body instead):

- `src/app/launchpad/drop/create/page.tsx`
- `src/app/launchpad/nfteditions/create/page.tsx`
- `src/app/launchpad/pop/create/page.tsx`
- `src/app/launchpad/pop/my-events/page.tsx`
- `src/app/launchpad/drop/my-drops/page.tsx`
- `src/app/launchpad/coin/create/page.tsx` — currently an inline button-only gate;
  promote to a full-page gate for consistency. (The launch button keeps its own
  disabled/validation state for the connected case.)

**Add** gates where missing:

- `src/app/create/asset/page.tsx` — wrap the form. Fixes the confusing "no
  collections, create one first" empty state for disconnected users (that branch is
  only reachable once connected).
- `src/app/create/collection/page.tsx` — wrap the form.

**Portfolio** (`src/app/portfolio/layout.tsx`):

- Remove the buggy `!isConnected && !walletAddress` skeleton branch and the
  near-dead connect-panel branch.
- Wrap the rendered body (Portfolio header + `PortfolioSubnav` + `children`) in a
  single `<ConnectGate>`, so all `/portfolio/*` sub-pages are covered in one place.
  The address header / stat pills only make sense once connected, so they live
  inside the gate.
- Remove the now-redundant bespoke loading/connect gate in
  `src/app/portfolio/settings/page.tsx` (it is covered by the layout gate). Keep its
  own *data*-loading skeleton (`profileLoading`) — that is a different concern.

**Stays public (no change):** `/launchpad` landing (`launchpad-content.tsx` —
service discovery cards), `/marketplace`, `/asset/*`, `/collections/*`. Mid-flow
submit guards (`toast.error("Connect your wallet first")` in form `onSubmit`
handlers) stay as a defensive second line.

### 4. Consistency cleanup (opportunistic, no behavior change)

While editing the gated pages, standardize the few that still read the
`useUnifiedWallet()` compat shim onto `useWallet()` directly (per CLAUDE.md:
`useUnifiedWallet`/`useWalletSession` are legacy shims; new/edited code uses
`useWallet()`). Pure rename of the destructured hook — identical return shape.

## Affected files

| File | Change |
|---|---|
| `src/contexts/wallet-context.tsx` | Add bounded `reconnecting` state; fold into `isConnecting` |
| `src/components/connect-gate.tsx` | **New** — `<ConnectGate>` wrapper |
| `src/app/portfolio/layout.tsx` | Replace buggy skeleton/dead-panel branches with `<ConnectGate>` |
| `src/app/portfolio/settings/page.tsx` | Drop redundant connect/loading gate (keep data skeleton) |
| `src/app/create/asset/page.tsx` | Wrap body in `<ConnectGate>` |
| `src/app/create/collection/page.tsx` | Wrap body in `<ConnectGate>` |
| `src/app/launchpad/coin/create/page.tsx` | Inline button-gate → full-page `<ConnectGate>` |
| `src/app/launchpad/drop/create/page.tsx` | Hand-rolled gate → `<ConnectGate>` |
| `src/app/launchpad/nfteditions/create/page.tsx` | Hand-rolled gate → `<ConnectGate>` |
| `src/app/launchpad/pop/create/page.tsx` | Hand-rolled gate → `<ConnectGate>` |
| `src/app/launchpad/pop/my-events/page.tsx` | Hand-rolled gate → `<ConnectGate>` |
| `src/app/launchpad/drop/my-drops/page.tsx` | Bespoke gate → `<ConnectGate>` |

## Risks & edge cases

- **Reconnect never completes (extension uninstalled between sessions):** the loop
  exhausts its ~6s budget and sets `reconnecting=false`; the gate then shows the
  connect panel. Bounded by construction — no infinite skeleton.
- **Cartridge / Privy returning users:** covered by the existing `szConnecting`
  term in `isConnecting`; the new `reconnecting` term only adds the injected case.
- **Pages that need the wallet address for data fetching** (e.g. portfolio
  sub-pages, `create/asset` collections) only render their `children` once
  connected, so `address` is always defined inside the gate — no `?? null`
  spinner-forever paths downstream.
- **Public pages unaffected:** no gate is added to discovery routes, so SEO/landing
  behavior is unchanged.

## Verification

- `npx tsc --noEmit` clean.
- `npm run build` succeeds.
- Manual (local `npm run dev`), disconnected wallet: `/portfolio`,
  `/portfolio/assets`, `/create/asset`, `/create/collection`, and each
  `/launchpad/*/create` + `/launchpad/drop/my-drops` + `/launchpad/pop/my-events`
  show the same friendly connect panel — no infinite skeleton, no empty form.
- Manual, returning injected wallet (hard reload): no connect-panel flash before
  reconnect settles; content appears once connected.
- `/launchpad` landing and `/marketplace` still render publicly while disconnected.
