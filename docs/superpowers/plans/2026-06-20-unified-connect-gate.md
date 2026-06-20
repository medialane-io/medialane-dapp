# Unified Connect Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every protected Launchpad and Portfolio page one consistent, friendly "connect your wallet" experience, with no connect-panel flash for returning users and no infinite skeleton or confusing empty form for disconnected ones.

**Architecture:** Surface the wallet context's existing ~6s manual reconnect window through `isConnecting` (root fix), then route every protected page's connected/connecting/disconnected branching through a single new `<ConnectGate>` wrapper that reuses the current connect-panel visuals.

**Tech Stack:** Next.js (App Router), React client components, TypeScript, Tailwind, `@starknet-react/core`, `@medialane/sdk`, `lucide-react`.

## Global Constraints

- **No test framework exists** in this repo (`CLAUDE.md`: "No test suite is configured"). The per-task verification gate is `npx tsc --noEmit` (zero-error target) plus manual smoke; the final task additionally runs `npm run build`. Do **not** scaffold a test runner.
- **`useWallet()` is the single wallet hook** — `{ address, isConnected, isConnecting, walletType, error, connect, disconnect, execute }`. Use it in new/edited code; do not reach for the `useUnifiedWallet()` / `useWalletSession()` compat shims.
- **`<ConnectWallet/>`** (`src/components/ConnectWallet.tsx`) is the single connect-button entry point. Props: `{ label?: string; className?: string }`. Never use `starknetkit`'s `useStarknetkitConnectModal`.
- **Filenames:** `kebab-case`; components: `PascalCase`. Absolute imports with `@/` prefix. Tailwind only.
- **Public discovery pages stay public:** `/launchpad` landing, `/marketplace`, `/asset/*`, `/collections/*`. Only "inner content" (create / manage / my-* / portfolio sub-pages) is gated.
- **Mid-flow submit guards** (`toast.error("Connect your wallet first")`) in form `onSubmit` handlers stay in place as a defensive second line — do not remove them.

---

### Task 1: Surface the manual reconnect window in `isConnecting`

**Files:**
- Modify: `src/contexts/wallet-context.tsx` (`isConnecting` derivation ~line 89; reconnect effect ~lines 108–146)

**Interfaces:**
- Consumes: existing `injectedStatus`, `szConnecting`, `readPersistedWallet()`, `liveConnectedRef`, `liveSzRef`, `connectAsync`, `connectors`.
- Produces: no API change — `isConnecting` (already exposed via `useWalletContext()` → `useWallet()`) now also reads `true` during the ~6s injected manual-reconnect retry window.

- [ ] **Step 1: Add the `reconnecting` state**

Add a `useState` near the other context state (ensure `useState` is imported from `react`):

```tsx
const [reconnecting, setReconnecting] = useState(false);
```

- [ ] **Step 2: Fold it into the derived `isConnecting`**

Replace the existing derivation (~line 89):

```tsx
const isConnecting =
  szConnecting ||
  injectedStatus === "connecting" ||
  injectedStatus === "reconnecting";
```

with:

```tsx
const isConnecting =
  szConnecting ||
  injectedStatus === "connecting" ||
  injectedStatus === "reconnecting" ||
  reconnecting;
```

- [ ] **Step 3: Drive `reconnecting` from the manual reconnect effect**

In the reconnect `useEffect` (the block that begins `if (reconnectRan.current) return;`), set the flag `true` right after the loop commits to running, and clear it on every exit path. The edited effect body:

```tsx
useEffect(() => {
  if (reconnectRan.current) return;
  const persisted = readPersistedWallet();
  if (persisted !== "argent" && persisted !== "braavos") return;
  if (liveConnectedRef.current || liveSzRef.current) return;
  reconnectRan.current = true;
  setReconnecting(true);

  let cancelled = false;
  const targetId = persisted === "braavos" ? "braavos" : "argentX";

  (async () => {
    // Let starknet-react's own one-shot autoConnect try first (warm loads
    // where the extension is already injected) so we don't double-connect.
    await new Promise((r) => setTimeout(r, 500));
    // Up to ~6s of retries (15 × 400ms) to outlast slow extension injection.
    for (let i = 0; i < 15 && !cancelled; i++) {
      if (liveConnectedRef.current || liveSzRef.current) { setReconnecting(false); return; }
      const connector = connectors.find((c) => c.id === targetId);
      if (connector) {
        try {
          if (await connector.ready()) {
            await connectAsync({ connector });
            setReconnecting(false);
            return;
          }
        } catch {
          // extension not ready / transient — retry on the next tick
        }
      }
      await new Promise((r) => setTimeout(r, 400));
    }
    setReconnecting(false);
  })();

  return () => {
    cancelled = true;
    setReconnecting(false);
  };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [connectors]);
```

(Only additions are the four `setReconnecting(...)` calls — the early `true`, the three `false` exit paths. Keep the rest byte-for-byte as it is, including the existing `eslint-disable` line.)

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Manual smoke (returning injected wallet)**

With a previously-connected Argent/Braavos extension and `localStorage["ml_wallet"]` set, hard-reload any page. Expected: `useWallet().isConnecting` is `true` during the reconnect window (verify the gate behavior in Task 3+; here just confirm no console errors and the wallet still reconnects).

- [ ] **Step 6: Commit**

```bash
git add src/contexts/wallet-context.tsx
git commit -m "fix(wallet): surface manual reconnect window in isConnecting"
```

---

### Task 2: Create the `<ConnectGate>` wrapper component

**Files:**
- Create: `src/components/connect-gate.tsx`

**Interfaces:**
- Consumes: `useWallet()` from Task 1 (`isConnected`, `isConnecting`), `<ConnectWallet/>`, `Skeleton`.
- Produces: `ConnectGate` — `function ConnectGate(props: ConnectGateProps): JSX.Element`, where
  ```ts
  type ConnectGateProps = {
    children: React.ReactNode;
    title?: string;     // default "Connect your wallet"
    subtitle?: string;  // default "Connect your wallet to continue."
    icon?: React.ReactNode; // default <Wallet className="h-10 w-10 text-muted-foreground mx-auto" />
  };
  ```
  Renders a skeleton while `isConnecting`, the connect panel while `!isConnected`, and `children` once connected. Used by all later tasks.

- [ ] **Step 1: Write the component**

```tsx
"use client";

import type { ReactNode } from "react";
import { Wallet } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { ConnectWallet } from "@/components/ConnectWallet";
import { Skeleton } from "@/components/ui/skeleton";

export type ConnectGateProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
};

/**
 * Single source of truth for "you must connect to use this page".
 *
 * Three states off useWallet():
 *  - isConnecting  → skeleton placeholder (returning users never flash the panel)
 *  - !isConnected  → friendly connect panel (reuses the shared <ConnectWallet/>)
 *  - connected     → children
 *
 * Wrap the body of any protected launchpad/portfolio page in this. Public
 * discovery pages (/launchpad landing, /marketplace, /asset, /collections)
 * must NOT use it.
 */
export function ConnectGate({ children, title, subtitle, icon }: ConnectGateProps) {
  const { isConnected, isConnecting } = useWallet();

  if (isConnecting) {
    return (
      <div className="container max-w-lg mx-auto px-4 pt-24 pb-8 space-y-4">
        <Skeleton className="h-10 w-10 rounded-full mx-auto" />
        <Skeleton className="h-7 w-56 mx-auto" />
        <Skeleton className="h-4 w-72 mx-auto" />
        <Skeleton className="h-10 w-44 mx-auto rounded-md" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="container max-w-lg mx-auto px-4 pt-24 pb-8 text-center space-y-4">
        {icon ?? <Wallet className="h-10 w-10 text-muted-foreground mx-auto" />}
        <h1 className="text-2xl font-bold">{title ?? "Connect your wallet"}</h1>
        <p className="text-muted-foreground">
          {subtitle ?? "Connect your wallet to continue."}
        </p>
        <div className="flex justify-center">
          <ConnectWallet />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/connect-gate.tsx
git commit -m "feat(wallet): add shared <ConnectGate> wrapper"
```

---

### Task 3: Gate the Portfolio route group

**Files:**
- Modify: `src/app/portfolio/layout.tsx` (replace the `!isConnected && !walletAddress` skeleton branch ~lines 71–104)
- Modify: `src/app/portfolio/settings/page.tsx` (remove redundant connect/loading gate; keep the `profileLoading` data skeleton)

**Interfaces:**
- Consumes: `ConnectGate` from Task 2.
- Produces: every `/portfolio/*` page now shows the unified gate when disconnected and a skeleton while reconnecting.

- [ ] **Step 1: Wrap the portfolio body in `<ConnectGate>`**

In `src/app/portfolio/layout.tsx`:

1. Add the import: `import { ConnectGate } from "@/components/connect-gate";`
2. Delete the two early-return branches — the skeleton block (`if (!isConnected && !walletAddress) { return ( … ) }`) and the connect-panel block (`if (!isConnected) { return ( … ) }`).
3. Wrap the final returned tree (the `<div className="px-4 sm:px-6 lg:px-8 pt-20 pb-8 space-y-6">…</div>`) in the gate:

```tsx
return (
  <ConnectGate
    title="Connect your wallet"
    subtitle="Connect your wallet to view your assets, listings, and offers."
  >
    <div className="px-4 sm:px-6 lg:px-8 pt-20 pb-8 space-y-6">
      {/* …existing header, stat pills, PortfolioSubnav, and {children}… */}
    </div>
  </ConnectGate>
);
```

4. Remove the now-unused `Skeleton` and `Wallet` imports **only if** nothing else in the file uses them (the header still uses `Briefcase`; check the stat-pill block — it uses an inline `animate-pulse` span, not `Skeleton`). Remove `ConnectWallet` import (now unused). Leave `isConnected`/`address` destructuring as-is; they are still read for the header.

- [ ] **Step 2: Remove the redundant gate in portfolio/settings**

In `src/app/portfolio/settings/page.tsx`, the layout now guarantees a connected wallet, so the page-level connect/blank-wallet handling is dead. Keep the **data** skeleton that keys on `profileLoading` (that is a separate concern). Concretely: leave the `if (profileLoading || …) { return <skeleton/> }` block, but remove any `!walletAddress`-driven connect/return branch if present, and drop the `disabled={!walletAddress}` guards' reliance on a possibly-absent address is fine to leave (harmless). Switch its `useUnifiedWallet()` to `useWallet()`:

```tsx
import { useWallet } from "@/hooks/use-wallet";
// …
const { address: walletAddress, disconnect } = useWallet();
```

Remove the now-unused `useUnifiedWallet` import.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Manual smoke**

`npm run dev`, disconnected: visit `/portfolio` and `/portfolio/assets` → unified connect panel, **no infinite skeleton**. Returning injected wallet, hard reload `/portfolio` → skeleton, then content (no panel flash).

- [ ] **Step 5: Commit**

```bash
git add src/app/portfolio/layout.tsx src/app/portfolio/settings/page.tsx
git commit -m "feat(portfolio): gate route group via <ConnectGate>"
```

---

### Task 4: Gate the `/create` pages

**Files:**
- Modify: `src/app/create/asset/page.tsx` (wrap the returned body)
- Modify: `src/app/create/collection/page.tsx` (wrap the returned body)

**Interfaces:**
- Consumes: `ConnectGate` from Task 2.
- Produces: disconnected users see the connect panel instead of an empty form / "no collections" state.

- [ ] **Step 1: Gate `/create/asset`**

In `src/app/create/asset/page.tsx`:

1. Add: `import { ConnectGate } from "@/components/connect-gate";`
2. The component returns a `<>…</>` fragment containing `<MintProgressDialog …/>` and the `<div className="container max-w-2xl …">` form. Wrap **the form `<div>` only** (not the dialog) in the gate:

```tsx
return (
  <>
    <MintProgressDialog /* …existing props… */ />
    <ConnectGate
      title="Connect to create an asset"
      subtitle="Connect your wallet to mint your work and pick a collection."
    >
      <div className="container max-w-2xl mx-auto px-4 pt-14 pb-8 space-y-8">
        {/* …existing form… */}
      </div>
    </ConnectGate>
  </>
);
```

This makes the "You don't have any collections yet" branch reachable only once connected.

- [ ] **Step 2: Gate `/create/collection`**

In `src/app/create/collection/page.tsx`:

1. Add: `import { ConnectGate } from "@/components/connect-gate";`
2. Wrap the page's returned root container in the gate:

```tsx
return (
  <ConnectGate
    title="Connect to create a collection"
    subtitle="Connect your wallet to deploy a collection on Starknet."
  >
    {/* …existing returned tree… */}
  </ConnectGate>
);
```

(`create/collection` already uses `useWallet()` — no hook change.)

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Manual smoke**

Disconnected: `/create/asset` → connect panel (not the empty "create a collection first" form); `/create/collection` → connect panel.

- [ ] **Step 5: Commit**

```bash
git add src/app/create/asset/page.tsx src/app/create/collection/page.tsx
git commit -m "feat(create): gate asset + collection pages via <ConnectGate>"
```

---

### Task 5: Replace hand-rolled gates on the Launchpad create pages

**Files:**
- Modify: `src/app/launchpad/drop/create/page.tsx` (remove `if (!isConnected)` panel ~line 236)
- Modify: `src/app/launchpad/nfteditions/create/page.tsx` (remove `if (!isConnected)` panel ~line 258)
- Modify: `src/app/launchpad/pop/create/page.tsx` (remove `if (!isConnected)` panel ~line 201)
- Modify: `src/app/launchpad/coin/create/page.tsx` (promote inline button-gate ~line 435 to a full-page gate)

**Interfaces:**
- Consumes: `ConnectGate` from Task 2.
- Produces: all four create pages share one connect experience.

- [ ] **Step 1: drop/create**

Add `import { ConnectGate } from "@/components/connect-gate";`. Delete the `if (!isConnected) { return ( … <ConnectWallet/> … ) }` block. Wrap the page's main returned tree:

```tsx
return (
  <ConnectGate
    title="Connect wallet to launch a drop"
    subtitle="Connect your Starknet wallet to create and manage a collection drop."
  >
    {/* …existing returned tree… */}
  </ConnectGate>
);
```

Switch `useUnifiedWallet()` → `useWallet()` (return shape is identical); remove the `useUnifiedWallet` import. Remove the `ConnectWallet` import if it is now unused on the page.

- [ ] **Step 2: nfteditions/create**

Same edit. Delete the `if (!isConnected)` panel block, wrap the returned tree:

```tsx
return (
  <ConnectGate
    title="Connect wallet to create a collection"
    subtitle="Connect your Starknet wallet to create an editions collection."
  >
    {/* …existing returned tree… */}
  </ConnectGate>
);
```

Switch `useUnifiedWallet()` → `useWallet()`; drop unused imports (`useUnifiedWallet`, and `ConnectWallet` if now unused).

- [ ] **Step 3: pop/create**

Same edit. Delete the `if (!isConnected)` panel block (the one rendering `<Award/>` + `<ConnectWallet/>`), wrap the create-form return:

```tsx
return (
  <ConnectGate
    title="Connect your wallet"
    subtitle="Connect your Starknet wallet to deploy a POP credential collection."
  >
    {/* …existing create-form tree… */}
  </ConnectGate>
);
```

Note: pop/create has an *earlier* loading/return branch before the `!isConnected` one — leave any genuine data-loading branch intact; only remove the `!isConnected` connect-panel branch. Switch `useUnifiedWallet()` → `useWallet()`; drop unused imports.

- [ ] **Step 4: coin/create**

Today the page renders the full form and only swaps in `<ConnectWallet label="Connect wallet to launch" />` at the launch-button slot (~line 435). Promote to a full-page gate so a disconnected user does not see the whole launch form:

Add `import { ConnectGate } from "@/components/connect-gate";`, wrap the returned tree:

```tsx
return (
  <ConnectGate
    title="Connect wallet to launch a coin"
    subtitle="Connect your Starknet wallet to create a creator coin."
  >
    {/* …existing returned tree… */}
  </ConnectGate>
);
```

Inside the (now always-connected) form, replace the `{!isConnected ? <ConnectWallet … /> : <launch button> }` conditional with just the launch button — `isConnected` is guaranteed true inside the gate. Keep `canLaunch`'s other validation terms; drop the `isConnected &&` term from `canLaunch` since it is now always true (or leave it — harmless). Remove the `ConnectWallet` import if now unused.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 6: Manual smoke**

Disconnected: `/launchpad/drop/create`, `/launchpad/nfteditions/create`, `/launchpad/pop/create`, `/launchpad/coin/create` all show the same unified connect panel (no partial forms).

- [ ] **Step 7: Commit**

```bash
git add src/app/launchpad/drop/create/page.tsx src/app/launchpad/nfteditions/create/page.tsx src/app/launchpad/pop/create/page.tsx src/app/launchpad/coin/create/page.tsx
git commit -m "feat(launchpad): unify create-page connect gates via <ConnectGate>"
```

---

### Task 6: Gate the Launchpad "my-*" list pages

**Files:**
- Modify: `src/app/launchpad/drop/my-drops/page.tsx` (replace bespoke gate ~lines 74–82)
- Modify: `src/app/launchpad/pop/my-events/page.tsx` (replace hand-rolled gate ~lines 61–68)

**Interfaces:**
- Consumes: `ConnectGate` from Task 2.
- Produces: both list pages share the unified gate. `useMyDrops` / event hooks only run inside the connected branch, so `walletAddress` is defined.

- [ ] **Step 1: drop/my-drops**

Add `import { ConnectGate } from "@/components/connect-gate";`. Delete the bespoke `if (!isConnected) { return ( … "Connect wallet to view your drops" … ) }` block (which lacks `<ConnectWallet/>`). Wrap the returned tree:

```tsx
return (
  <ConnectGate
    title="Connect wallet to view your drops"
    subtitle="Connect your Starknet wallet to see the drops you've deployed."
  >
    {/* …existing returned tree… */}
  </ConnectGate>
);
```

(Already uses `useWallet()` — no hook change.)

- [ ] **Step 2: pop/my-events**

Delete the `if (!isConnected) { return ( … <ConnectWallet/> … ) }` block. Wrap the returned tree:

```tsx
return (
  <ConnectGate
    title="Connect your wallet"
    subtitle="Connect your Starknet wallet to see the POP events you've created."
  >
    {/* …existing returned tree… */}
  </ConnectGate>
);
```

(Already uses `useWallet()`.) Remove the `ConnectWallet` import if now unused.

- [ ] **Step 3: Type-check + full build**

Run: `npx tsc --noEmit` → no new errors.
Then run: `npm run build` → succeeds (do not filter the output).

- [ ] **Step 4: Manual smoke (full sweep, disconnected)**

`npm run dev`, wallet disconnected — confirm the **same** friendly connect panel on: `/portfolio`, `/portfolio/assets`, `/portfolio/settings`, `/create/asset`, `/create/collection`, `/launchpad/drop/create`, `/launchpad/nfteditions/create`, `/launchpad/pop/create`, `/launchpad/coin/create`, `/launchpad/drop/my-drops`, `/launchpad/pop/my-events`. Confirm `/launchpad` landing and `/marketplace` still render publicly. Returning injected wallet, hard reload `/portfolio` → skeleton then content, no flash.

- [ ] **Step 5: Commit**

```bash
git add src/app/launchpad/drop/my-drops/page.tsx src/app/launchpad/pop/my-events/page.tsx
git commit -m "feat(launchpad): unify my-drops + my-events connect gates via <ConnectGate>"
```

---

## Self-Review

**Spec coverage:**
- Root fix (reconnect window) → Task 1. ✓
- `<ConnectGate>` component (3 states, message props) → Task 2. ✓
- Portfolio layout fix + settings cleanup → Task 3. ✓
- `/create/asset` + `/create/collection` gates → Task 4. ✓
- Replace 4 hand-rolled launchpad create gates (incl. coin promote) → Task 5. ✓
- my-drops + my-events → Task 6. ✓
- `useUnifiedWallet` → `useWallet` cleanup → folded into Tasks 3 & 5. ✓
- Public pages untouched; submit guards retained → Global Constraints + per-task notes. ✓

**Placeholder scan:** No TBD/TODO; the `{/* …existing… */}` markers point at concrete existing code identified by file + line, with the wrapper code shown in full. Acceptable — the engineer wraps, not rewrites.

**Type consistency:** `ConnectGate` / `ConnectGateProps` (`children`, `title?`, `subtitle?`, `icon?`) defined in Task 2 and consumed unchanged in Tasks 3–6. `useWallet()` return shape consistent throughout.
