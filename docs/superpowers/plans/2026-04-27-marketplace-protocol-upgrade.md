# Marketplace Protocol Upgrade — ERC-721 / ERC-1155 Feature Parity

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade medialane-dapp from SDK v0.7.2 to v0.8.2, wire the new immutable ERC-721 and ERC-1155 marketplace contracts, fix the ERC-1155 SNIP-12 signing schema, and add partial-fill UI for ERC-1155 — without breaking any existing ERC-721 or offer functionality.

**Architecture:** Surgical edits only. ERC-1155 corrections are added as early-return branches; the existing ERC-721 code paths remain byte-for-byte identical beneath each branch. No function is wholesale replaced. `makeOffer` is not touched. Asset security is the top priority: approvals always target the correct marketplace contract address for each token standard.

**Tech Stack:** Next.js 15, Starknet.js v8, @medialane/sdk 0.8.2, @starknet-react/core v5, starknetkit v3, React 19, TypeScript, Tailwind, shadcn/ui, sonner toasts, AVNU paymaster

---

## Background: What Changed in the Protocol

Both marketplace contracts were redeployed as immutable (no admin key) in SDK v0.8.0. The ERC-1155 contract has a fundamentally different order schema from ERC-721:

| Aspect | ERC-721 | ERC-1155 |
|--------|---------|----------|
| SDK constant | `MARKETPLACE_CONTRACT_MAINNET` | `MARKETPLACE_1155_CONTRACT_MAINNET` |
| SNIP-12 domain | `"Medialane"` | `"Medialane1155"` |
| OrderParameters | nested OfferItem + ConsiderationItem | flat: `offerer, nft_contract, token_id, amount, payment_token, price_per_unit, start_time, end_time, salt, nonce` |
| OrderFulfillment | `order_hash, fulfiller, nonce` | `order_hash, fulfiller, quantity, nonce` |
| Fill model | single fill | partial fills (`quantity ≤ remainingAmount`) |
| New API field | — | `ApiOrder.remainingAmount: string \| null` |

**Current bugs in dapp (all in ERC-1155 branches only):**
1. `medialane1155Contract` initialized with wrong ABI (`IPMarketplaceABI` instead of `Medialane1155ABI`)
2. `createListing` for ERC-1155 uses ERC-721 SNIP-12 schema (wrong domain + nested struct)
3. `checkoutCart` routes all items to ERC-721 contract regardless of token standard
4. `cancelOrder` uses wrong SNIP-12 domain for ERC-1155
5. `acceptOffer` uses wrong SNIP-12 domain and missing `quantity` field for ERC-1155

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Modify | `package.json` | Bump `@medialane/sdk` to `^0.8.2` |
| Modify | `src/lib/constants.ts` | Import new SDK constants; add start-block exports |
| Create | `src/abis/ip_market_1155.ts` | Re-export `Medialane1155ABI` from SDK |
| Modify | `src/utils/marketplace-utils.ts` | Add ERC-1155 SNIP-12 typed data builders |
| Modify | `src/hooks/use-marketplace.ts` | Surgical fixes to ERC-1155 branches only |
| Modify | `src/components/marketplace/listing-dialog.tsx` | Add `amount` field for ERC-1155 (additive only) |
| Modify | `src/components/marketplace/purchase-dialog.tsx` | Add quantity + remaining display for ERC-1155 (additive only) |
| Modify | `src/app/asset/[contract]/[tokenId]/asset-markets-tab.tsx` | Show `remainingAmount` for ERC-1155 (additive only) |
| Modify | `src/hooks/use-marketplace-events.ts` | Replace deprecated constant with canonical one |
| Modify | `.env.example` | Document new env variables |

---

## Task 1: Upgrade SDK Dependency

**Files:** `package.json`

- [ ] **Step 1: Bump the SDK version**

In `package.json`, change line 14:
```json
"@medialane/sdk": "^0.8.2",
```

- [ ] **Step 2: Install**

```bash
npm install
```
Expected: `package-lock.json` updated, no errors.

- [ ] **Step 3: Verify new exports**

```bash
node -e "
const s = require('./node_modules/@medialane/sdk/dist/index.cjs');
console.log('ABI:', !!s.Medialane1155ABI);
console.log('build1155:', !!s.build1155OrderTypedData);
console.log('721:', s.MARKETPLACE_721_CONTRACT_MAINNET?.slice(0,10));
console.log('1155:', s.MARKETPLACE_1155_CONTRACT_MAINNET?.slice(0,10));
"
```
Expected:
```
ABI: true
build1155: true
721: 0x00f8ccaa
1155: 0x04a0a65b
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: upgrade @medialane/sdk to 0.8.2"
```

---

## Task 2: Update Constants

**Files:** `src/lib/constants.ts`

- [ ] **Step 1: Expand the import from `@medialane/sdk` at the top of the file**

Replace the current import block (lines 1–6):
```typescript
import {
  MARKETPLACE_CONTRACT_MAINNET,
  MARKETPLACE_1155_CONTRACT_MAINNET,
  COLLECTION_CONTRACT_MAINNET,
  SUPPORTED_TOKENS,
} from "@medialane/sdk";
```
With:
```typescript
import {
  MARKETPLACE_721_CONTRACT_MAINNET,
  MARKETPLACE_CONTRACT_MAINNET,
  MARKETPLACE_721_START_BLOCK_MAINNET,
  MARKETPLACE_1155_CONTRACT_MAINNET,
  MARKETPLACE_1155_START_BLOCK_MAINNET,
  COLLECTION_721_CONTRACT_MAINNET,
  COLLECTION_CONTRACT_MAINNET,
  COLLECTION_1155_CONTRACT_MAINNET,
  NFTCOMMENTS_CONTRACT_MAINNET,
  SUPPORTED_TOKENS,
} from "@medialane/sdk";
```

- [ ] **Step 2: Add new exports after the existing `MARKETPLACE_1155_CONTRACT` export**

After:
```typescript
export const MARKETPLACE_1155_CONTRACT =
  (process.env.NEXT_PUBLIC_MARKETPLACE_1155_CONTRACT as `0x${string}`) ||
  MARKETPLACE_1155_CONTRACT_MAINNET;
```

Add:
```typescript
export const MARKETPLACE_721_CONTRACT = MARKETPLACE_CONTRACT;

export const MARKETPLACE_721_START_BLOCK = Number(
  process.env.NEXT_PUBLIC_MARKETPLACE_721_START_BLOCK || MARKETPLACE_721_START_BLOCK_MAINNET
);

export const MARKETPLACE_1155_START_BLOCK = Number(
  process.env.NEXT_PUBLIC_MARKETPLACE_1155_START_BLOCK || MARKETPLACE_1155_START_BLOCK_MAINNET
);

export const COLLECTION_1155_CONTRACT =
  (process.env.NEXT_PUBLIC_COLLECTION_1155_CONTRACT as `0x${string}`) ||
  COLLECTION_1155_CONTRACT_MAINNET;

export const NFTCOMMENTS_CONTRACT =
  (process.env.NEXT_PUBLIC_NFTCOMMENTS_CONTRACT as `0x${string}`) ||
  NFTCOMMENTS_CONTRACT_MAINNET;
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit 2>&1 | head -30
```
Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/constants.ts
git commit -m "feat: add canonical marketplace constants from SDK 0.8.2"
```

---

## Task 3: Create ERC-1155 Marketplace ABI File

**Files:** `src/abis/ip_market_1155.ts` (new)

- [ ] **Step 1: Create the file**

```typescript
// ABI for the Medialane1155 marketplace contract.
// Contract: 0x04a0a65bd13e1ec9a2ce92c36115578486331e941b395f97d49fe488baac8309
// Sourced from @medialane/sdk v0.8.2

export { Medialane1155ABI as IPMarketplace1155ABI } from "@medialane/sdk";
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "ip_market_1155"
```
Expected: no output (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/abis/ip_market_1155.ts
git commit -m "feat: add ERC-1155 marketplace ABI from SDK"
```

---

## Task 4: Add ERC-1155 SNIP-12 Typed Data Builders

**Files:** `src/utils/marketplace-utils.ts`

The existing `getOrderParametersTypedData`, `getOrderCancellationTypedData`, `getOrderFulfillmentTypedData` are correct for ERC-721 — do not touch them. Append ERC-1155 variants at the end of the file.

- [ ] **Step 1: Append to the end of `src/utils/marketplace-utils.ts` (after line 122)**

```typescript
import {
    build1155OrderTypedData,
    build1155FulfillmentTypedData,
    build1155CancellationTypedData,
} from "@medialane/sdk";

/** SNIP-12 typed data for ERC-1155 OrderParameters. Domain: "Medialane1155". Flat struct. */
export const get1155OrderParametersTypedData = (
    message: Record<string, unknown>,
    chainId: constants.StarknetChainId
): TypedData => build1155OrderTypedData(message, chainId);

/** SNIP-12 typed data for ERC-1155 OrderFulfillment. Includes `quantity` field. */
export const get1155OrderFulfillmentTypedData = (
    message: Record<string, unknown>,
    chainId: constants.StarknetChainId
): TypedData => build1155FulfillmentTypedData(message, chainId);

/** SNIP-12 typed data for ERC-1155 OrderCancellation. Domain: "Medialane1155". */
export const get1155OrderCancellationTypedData = (
    message: Record<string, unknown>,
    chainId: constants.StarknetChainId
): TypedData => build1155CancellationTypedData(message, chainId);
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "marketplace-utils"
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/utils/marketplace-utils.ts
git commit -m "feat: add ERC-1155 SNIP-12 typed data builders"
```

---

## Task 5: Fix ERC-1155 Contract Init + createListing (Surgical)

**Files:** `src/hooks/use-marketplace.ts`

**Rule:** The ERC-721 code path inside `createListing` must not change. Only the ERC-1155 branch is replaced. `makeOffer` is not touched at all.

- [ ] **Step 1: Add new import — ABI**

After line 5 (`import { IPMarketplaceABI } from "@/abis/ip_market";`), add:
```typescript
import { IPMarketplace1155ABI } from "@/abis/ip_market_1155";
```

- [ ] **Step 2: Add new imports — SNIP-12 helpers**

Replace line 7:
```typescript
import { getOrderParametersTypedData, getOrderCancellationTypedData, getOrderFulfillmentTypedData, stringifyBigInts } from "@/utils/marketplace-utils";
```
With:
```typescript
import {
    getOrderParametersTypedData,
    getOrderCancellationTypedData,
    getOrderFulfillmentTypedData,
    get1155OrderParametersTypedData,
    get1155OrderFulfillmentTypedData,
    get1155OrderCancellationTypedData,
    stringifyBigInts,
} from "@/utils/marketplace-utils";
```

- [ ] **Step 3: Fix medialane1155Contract ABI (lines 65–68)**

Replace:
```typescript
    const { contract: medialane1155Contract } = useContract({
        address: MARKETPLACE_1155_CONTRACT,
        abi: IPMarketplaceABI as any[],
    });
```
With:
```typescript
    const { contract: medialane1155Contract } = useContract({
        address: MARKETPLACE_1155_CONTRACT,
        abi: IPMarketplace1155ABI as any[],
    });
```

- [ ] **Step 4: Add `amount` to the interface and function signature**

In the `UseMarketplaceReturn` interface, add `amount?: string` to `createListing`:
```typescript
    createListing: (
        assetContractAddress: string,
        tokenId: string,
        price: string,
        currencySymbol: string,
        durationSeconds: number,
        tokenStandard?: string,
        amount?: string
    ) => Promise<string | undefined>;
```

In the `createListing` useCallback declaration, add `amount?: string` as 7th param:
```typescript
    const createListing = useCallback(async (
        assetContractAddress: string,
        tokenId: string,
        price: string,
        currencySymbol: string,
        durationSeconds: number,
        tokenStandard?: string,
        amount?: string
    ) => {
```

- [ ] **Step 5: Add ERC-1155 early-return inside createListing's withProcessing body**

The current `withProcessing` body starts at line 198 with:
```typescript
        return withProcessing(async () => {
            const priceWei = toWei(price, currencySymbol);
            const { startTime, endTime, salt, currencyAddress, nonce } =
                await buildBaseOrderParams(currencySymbol, durationSeconds, contract);

            const orderParams = {
```

Insert an ERC-1155 early-return block between `buildBaseOrderParams` and the `const orderParams` line, so it reads:

```typescript
        return withProcessing(async () => {
            const priceWei = toWei(price, currencySymbol);
            const { startTime, endTime, salt, currencyAddress, nonce } =
                await buildBaseOrderParams(currencySymbol, durationSeconds, contract);

            // ── ERC-1155 path ─────────────────────────────────────────────────
            if (is1155) {
                const listAmount = amount ?? "1";
                const orderParams = {
                    offerer: walletAddress,
                    nft_contract: assetContractAddress,
                    token_id: tokenId,
                    amount: listAmount,
                    payment_token: currencyAddress,
                    price_per_unit: priceWei,
                    start_time: startTime,
                    end_time: endTime,
                    salt,
                    nonce,
                };
                const chainId = chain!.id as any as constants.StarknetChainId;
                const typedData = stringifyBigInts(
                    get1155OrderParametersTypedData(orderParams, chainId)
                );
                const signature = await account!.signMessage(typedData);
                const signatureArray = Array.isArray(signature)
                    ? signature
                    : [signature.r.toString(), signature.s.toString()];
                const registerCall = contract.populate("register_order", [{
                    parameters: orderParams,
                    signature: signatureArray,
                }]);
                let isAlreadyApproved = false;
                try {
                    const res = await provider.callContract({
                        contractAddress: assetContractAddress,
                        entrypoint: "is_approved_for_all",
                        calldata: [walletAddress!, contract.address],
                    });
                    isAlreadyApproved = BigInt(res[0]) !== 0n;
                } catch (err) {
                    console.warn("Failed to check ERC1155 approval status", err);
                }
                const approveCall = {
                    contractAddress: assetContractAddress,
                    entrypoint: "set_approval_for_all",
                    calldata: [contract.address, "1"],
                };
                const calls = isAlreadyApproved ? [registerCall] : [approveCall, registerCall];
                const hash = await executeWithSponsor(calls);
                setTxHash(hash);
                const receipt = await provider.waitForTransaction(hash);
                if ((receipt as any).execution_status === "REVERTED") {
                    throw new Error((receipt as any).revert_reason || "Transaction reverted on-chain.");
                }
                toast.success("Listing Created", { description: "Your edition has been listed successfully." });
                return hash;
            }
            // ── ERC-721 path — unchanged below ────────────────────────────────

            const orderParams = {
```

Everything from `const orderParams = {` down to the end of `withProcessing` is **unchanged** — leave it exactly as it is.

- [ ] **Step 6: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "use-marketplace" | head -20
```
Expected: zero errors.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/use-marketplace.ts src/abis/ip_market_1155.ts
git commit -m "fix: correct ABI and SNIP-12 schema for ERC-1155 createListing; ERC-721 path unchanged"
```

---

## Task 6: Fix checkoutCart, cancelOrder, acceptOffer (Surgical)

**Files:** `src/hooks/use-marketplace.ts`

**Rule:** For each function, ERC-1155 items/branches get correct logic; ERC-721 logic is byte-for-byte identical to current code.

### checkoutCart

The current `checkoutCart` (lines 355–437) handles only ERC-721. The fix adds ERC-1155 handling by splitting the loop and approval aggregation by token standard.

- [ ] **Step 1: Replace the `tokenTotals` map and `approveCalls` build in checkoutCart**

Current code inside `withProcessing`:
```typescript
            const tokenTotals = new Map<string, bigint>();
            items.forEach((item) => {
                const token = item.considerationToken;
                const amount = BigInt(item.considerationAmount);
                tokenTotals.set(token, (tokenTotals.get(token) || 0n) + amount);
            });

            const { cairo } = await import("starknet");
            const approveCalls = Array.from(tokenTotals.entries()).map(([token, totalWei]) => {
                const amountUint256 = cairo.uint256(totalWei.toString());
                return {
                    contractAddress: token,
                    entrypoint: "approve",
                    calldata: [medialaneContract.address, amountUint256.low.toString(), amountUint256.high.toString()],
                };
            });
```

Replace with:
```typescript
            const tokenTotals721 = new Map<string, bigint>();
            const tokenTotals1155 = new Map<string, bigint>();
            items.forEach((item) => {
                const token = item.considerationToken;
                const amt = BigInt(item.considerationAmount);
                if (item.isERC1155) {
                    tokenTotals1155.set(token, (tokenTotals1155.get(token) || 0n) + amt);
                } else {
                    tokenTotals721.set(token, (tokenTotals721.get(token) || 0n) + amt);
                }
            });

            const { cairo } = await import("starknet");
            const approveCalls721 = Array.from(tokenTotals721.entries()).map(([token, totalWei]) => {
                const amountUint256 = cairo.uint256(totalWei.toString());
                return {
                    contractAddress: token,
                    entrypoint: "approve",
                    calldata: [medialaneContract.address, amountUint256.low.toString(), amountUint256.high.toString()],
                };
            });
            const approveCalls1155 = Array.from(tokenTotals1155.entries()).map(([token, totalWei]) => {
                const amountUint256 = cairo.uint256(totalWei.toString());
                return {
                    contractAddress: token,
                    entrypoint: "approve",
                    calldata: [medialane1155Contract!.address, amountUint256.low.toString(), amountUint256.high.toString()],
                };
            });
```

- [ ] **Step 2: Replace the nonce fetch and fulfill loop in checkoutCart**

Current code:
```typescript
            const currentNonce = await medialaneContract.nonces(walletAddress);
            const baseNonce = BigInt(currentNonce);

            const chainId = chain.id as any as constants.StarknetChainId;
            const fulfillCalls = [];

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const executionNonce = baseNonce + BigInt(i);

                const fulfillmentParams = {
                    order_hash: item.orderHash,
                    fulfiller: walletAddress,
                    nonce: executionNonce.toString(),
                };

                const typedData = stringifyBigInts(getOrderFulfillmentTypedData(fulfillmentParams, chainId));

                toast.info(`Signature Required (${i + 1}/${items.length})`, {
                    description: `Please sign the request for ${item.offerIdentifier}`,
                });

                const signature = await account.signMessage(typedData);
                const signatureArray = Array.isArray(signature)
                    ? signature
                    : [signature.r.toString(), signature.s.toString()];

                fulfillCalls.push(
                    medialaneContract.populate("fulfill_order", [{
                        fulfillment: fulfillmentParams,
                        signature: signatureArray,
                    }])
                );
            }
```

Replace with:
```typescript
            const baseNonce721 = BigInt(await medialaneContract.nonces(walletAddress));
            const baseNonce1155 = medialane1155Contract
                ? BigInt(await medialane1155Contract.nonces(walletAddress))
                : 0n;

            const chainId = chain.id as any as constants.StarknetChainId;
            const fulfillCalls: any[] = [];
            let counter721 = 0;
            let counter1155 = 0;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];

                if (item.isERC1155) {
                    const executionNonce = baseNonce1155 + BigInt(counter1155++);
                    const quantity = item.quantity ?? "1";
                    const fulfillmentParams = {
                        order_hash: item.orderHash,
                        fulfiller: walletAddress,
                        quantity,
                        nonce: executionNonce.toString(),
                    };
                    const typedData = stringifyBigInts(
                        get1155OrderFulfillmentTypedData(fulfillmentParams, chainId)
                    );
                    toast.info(`Signature Required (${i + 1}/${items.length})`, {
                        description: `Please sign the purchase for edition ${item.offerIdentifier}`,
                    });
                    const signature = await account.signMessage(typedData);
                    const signatureArray = Array.isArray(signature)
                        ? signature
                        : [signature.r.toString(), signature.s.toString()];
                    fulfillCalls.push(
                        medialane1155Contract!.populate("fulfill_order", [{
                            fulfillment: fulfillmentParams,
                            signature: signatureArray,
                        }])
                    );
                } else {
                    const executionNonce = baseNonce721 + BigInt(counter721++);
                    const fulfillmentParams = {
                        order_hash: item.orderHash,
                        fulfiller: walletAddress,
                        nonce: executionNonce.toString(),
                    };
                    const typedData = stringifyBigInts(
                        getOrderFulfillmentTypedData(fulfillmentParams, chainId)
                    );
                    toast.info(`Signature Required (${i + 1}/${items.length})`, {
                        description: `Please sign the request for ${item.offerIdentifier}`,
                    });
                    const signature = await account.signMessage(typedData);
                    const signatureArray = Array.isArray(signature)
                        ? signature
                        : [signature.r.toString(), signature.s.toString()];
                    fulfillCalls.push(
                        medialaneContract.populate("fulfill_order", [{
                            fulfillment: fulfillmentParams,
                            signature: signatureArray,
                        }])
                    );
                }
            }
```

- [ ] **Step 3: Update the final `executeWithSponsor` call in checkoutCart**

Replace:
```typescript
            const hash = await executeWithSponsor([...approveCalls, ...fulfillCalls]);
```
With:
```typescript
            const hash = await executeWithSponsor([...approveCalls721, ...approveCalls1155, ...fulfillCalls]);
```

- [ ] **Step 4: Update the `checkoutCart` useCallback dependency array**

Replace:
```typescript
    }, [account, walletAddress, medialaneContract, chain, provider, withProcessing, executeWithSponsor]);
```
With:
```typescript
    }, [account, walletAddress, medialaneContract, medialane1155Contract, chain, provider, withProcessing, executeWithSponsor]);
```

### cancelOrder

- [ ] **Step 5: Add ERC-1155 typed data routing in cancelOrder**

In `cancelOrder`, find:
```typescript
            const typedData = stringifyBigInts(getOrderCancellationTypedData(cancelParams, chainId));
```
Replace with:
```typescript
            const typedData = stringifyBigInts(
                is1155
                    ? get1155OrderCancellationTypedData(cancelParams, chainId)
                    : getOrderCancellationTypedData(cancelParams, chainId)
            );
```

### acceptOffer

- [ ] **Step 6: Add `quantity` field and ERC-1155 typed data routing in acceptOffer**

In `acceptOffer`, find:
```typescript
            const fulfillmentParams = {
                order_hash: orderHash,
                fulfiller: walletAddress,
                nonce: currentNonce.toString(),
            };

            const chainId = chain.id as any as constants.StarknetChainId;
            const typedData = stringifyBigInts(getOrderFulfillmentTypedData(fulfillmentParams, chainId));
```

Replace with:
```typescript
            const fulfillmentParams: Record<string, unknown> = {
                order_hash: orderHash,
                fulfiller: walletAddress,
                nonce: currentNonce.toString(),
                ...(is1155 ? { quantity: "1" } : {}),
            };

            const chainId = chain.id as any as constants.StarknetChainId;
            const typedData = stringifyBigInts(
                is1155
                    ? get1155OrderFulfillmentTypedData(fulfillmentParams, chainId)
                    : getOrderFulfillmentTypedData(fulfillmentParams, chainId)
            );
```

- [ ] **Step 7: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "use-marketplace" | head -20
```
Expected: zero errors.

- [ ] **Step 8: Commit**

```bash
git add src/hooks/use-marketplace.ts
git commit -m "fix: correct ERC-1155 SNIP-12 and contract routing in checkout/cancel/acceptOffer"
```

---

## Task 7: Update ListingDialog for ERC-1155 Amount

**Files:** `src/components/marketplace/listing-dialog.tsx`

Additive only: add `amount` to the schema and form. The existing ERC-721 UI is unchanged.

- [ ] **Step 1: Add `amount` to the zod schema**

Replace:
```typescript
const schema = z.object({
  price: z.string().min(1, "Price required").refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Must be positive"),
  currency: z.string().refine((v) => getListableTokens().some((t) => t.symbol === v), "Invalid currency"),
  durationSeconds: z.number().min(86400),
});
```
With:
```typescript
const schema = z.object({
  price: z.string().min(1, "Price required").refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Must be positive"),
  currency: z.string().refine((v) => getListableTokens().some((t) => t.symbol === v), "Invalid currency"),
  durationSeconds: z.number().min(86400),
  amount: z.string().optional(),
});
```

- [ ] **Step 2: Pass `amount` in `onSubmit`**

Replace:
```typescript
    const hash = await createListing(assetContract, tokenId, values.price, values.currency, values.durationSeconds, tokenStandard);
```
With:
```typescript
    const hash = await createListing(
      assetContract,
      tokenId,
      values.price,
      values.currency,
      values.durationSeconds,
      tokenStandard,
      values.amount?.trim() || undefined
    );
```

- [ ] **Step 3: Add `amount` input and conditional price label inside the form JSX**

Update the price `<FormLabel>`:
```tsx
                    <FormLabel>{tokenStandard === "ERC1155" ? "Price per edition" : "Price"}</FormLabel>
```

After the price `</FormItem>`, before the currency `<FormField>`, add:
```tsx
                {tokenStandard === "ERC1155" && (
                  <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity to list</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" min="1" placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
```

- [ ] **Step 4: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "listing-dialog"
```
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/components/marketplace/listing-dialog.tsx
git commit -m "feat: add quantity/amount field for ERC-1155 in ListingDialog"
```

---

## Task 8: Update PurchaseDialog for ERC-1155 Quantity

**Files:** `src/components/marketplace/purchase-dialog.tsx`

Additive only: ERC-1155 quantity UI appears only when `order.offer.itemType === "ERC1155"`.

- [ ] **Step 1: Add state after the existing state declarations**

After `const [txStatus, setTxStatus] = useState<"idle" | "confirmed">("idle");`, add:
```typescript
  const isERC1155 = order.offer.itemType === "ERC1155";
  const maxQty = isERC1155 && order.remainingAmount ? parseInt(order.remainingAmount, 10) : 1;
  const [quantity, setQuantity] = useState(1);
```

- [ ] **Step 2: Reset quantity on dialog open**

Find:
```typescript
  useEffect(() => {
    if (open) { resetState(); setTxStatus("idle"); }
  }, [open]);
```
Replace with:
```typescript
  useEffect(() => {
    if (open) { resetState(); setTxStatus("idle"); setQuantity(1); }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 3: Update `handleBuy` to pass ERC-1155 fields**

Replace the existing `handleBuy`:
```typescript
  const handleBuy = async () => {
    if (!isConnected) { toast.error("Connect your wallet first"); return; }
    try {
      const item = {
        orderHash: order.orderHash,
        considerationToken: order.consideration.token,
        considerationAmount: order.consideration.startAmount,
        offerIdentifier: order.offer.identifier,
      };
      const hash = await checkoutCart([item as any]);
      if (hash) setTxStatus("confirmed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Purchase failed");
    }
  };
```
With:
```typescript
  const handleBuy = async () => {
    if (!isConnected) { toast.error("Connect your wallet first"); return; }
    try {
      let considerationAmount = order.consideration.startAmount;
      if (isERC1155 && quantity > 1) {
        const totalUnits = parseInt(order.offer.startAmount || "1", 10) || 1;
        const perUnitRaw = BigInt(order.consideration.startAmount) / BigInt(totalUnits);
        considerationAmount = (perUnitRaw * BigInt(quantity)).toString();
      }
      const item = {
        orderHash: order.orderHash,
        considerationToken: order.consideration.token,
        considerationAmount,
        offerIdentifier: order.offer.identifier,
        isERC1155,
        quantity: quantity.toString(),
      };
      const hash = await checkoutCart([item as any]);
      if (hash) setTxStatus("confirmed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Purchase failed");
    }
  };
```

- [ ] **Step 4: Add quantity UI in the idle form body**

After the price display block and before the `{error && ...}` alert, add:
```tsx
            {isERC1155 && maxQty > 1 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="text-muted-foreground">{order.remainingAmount} available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="icon" className="h-8 w-8 shrink-0"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}>
                    <span className="text-lg leading-none">−</span>
                  </Button>
                  <Input type="number" min={1} max={maxQty} value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(maxQty, parseInt(e.target.value, 10) || 1)))}
                    className="h-8 text-center" />
                  <Button type="button" variant="outline" size="icon" className="h-8 w-8 shrink-0"
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))} disabled={quantity >= maxQty}>
                    <span className="text-lg leading-none">+</span>
                  </Button>
                </div>
              </div>
            )}
```

- [ ] **Step 5: Update price label**

Find the price label in the idle form and replace:
```tsx
                <span className="text-sm text-muted-foreground">Price</span>
```
With:
```tsx
                <span className="text-sm text-muted-foreground">{isERC1155 ? "Price per edition" : "Price"}</span>
```

- [ ] **Step 6: Ensure `Input` is imported**

Check imports at top of file. If `Input` is not imported, add:
```typescript
import { Input } from "@/components/ui/input";
```

- [ ] **Step 7: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "purchase-dialog"
```
Expected: no output.

- [ ] **Step 8: Commit**

```bash
git add src/components/marketplace/purchase-dialog.tsx
git commit -m "feat: add ERC-1155 quantity selector and remaining display in PurchaseDialog"
```

---

## Task 9: Show remainingAmount in AssetMarketsTab

**Files:** `src/app/asset/[contract]/[tokenId]/asset-markets-tab.tsx`

Additive only: two small additions to the listings row.

- [ ] **Step 1: Add "/ edition" label to price for ERC-1155**

Find the price `<p>` in the listings map:
```tsx
                    <p className="font-bold text-sm inline-flex items-center gap-1.5">
                      {formatDisplayPrice(order.price.formatted)}
                      <CurrencyIcon symbol={order.price.currency ?? ""} size={14} />
                    </p>
```
Replace with:
```tsx
                    <p className="font-bold text-sm inline-flex items-center gap-1.5">
                      {formatDisplayPrice(order.price.formatted)}
                      <CurrencyIcon symbol={order.price.currency ?? ""} size={14} />
                      {order.offer.itemType === "ERC1155" && (
                        <span className="text-xs font-normal text-muted-foreground">/ edition</span>
                      )}
                    </p>
```

- [ ] **Step 2: Add remaining availability line after the time-remaining div**

After:
```tsx
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3" />
                      {timeUntil(order.endTime)}
                    </div>
```
Add:
```tsx
                    {order.offer.itemType === "ERC1155" && order.remainingAmount !== null && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {order.remainingAmount} of {order.offer.startAmount} available
                      </div>
                    )}
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "asset-markets-tab"
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add "src/app/asset/[contract]/[tokenId]/asset-markets-tab.tsx"
git commit -m "feat: show ERC-1155 remainingAmount and per-edition price in AssetMarketsTab"
```

---

## Task 10: Fix use-marketplace-events.ts and Update .env.example

**Files:** `src/hooks/use-marketplace-events.ts`, `.env.example`

- [ ] **Step 1: Update import in `use-marketplace-events.ts` (line 5)**

Replace:
```typescript
import { MEDIALANE_CONTRACT_ADDRESS, START_BLOCK } from "@/lib/constants";
```
With:
```typescript
import { MARKETPLACE_CONTRACT, MARKETPLACE_721_START_BLOCK } from "@/lib/constants";
```

- [ ] **Step 2: Replace all uses of the old constants in the file**

```bash
grep -n "MEDIALANE_CONTRACT_ADDRESS\|[^_]START_BLOCK[^_]" src/hooks/use-marketplace-events.ts
```

For each occurrence: replace `MEDIALANE_CONTRACT_ADDRESS` → `MARKETPLACE_CONTRACT` and `START_BLOCK` → `MARKETPLACE_721_START_BLOCK`.

- [ ] **Step 3: Add new env vars to `.env.example`**

After line `NEXT_PUBLIC_MEDIALANE_CONTRACT_START_BLOCK=6873567`, add:
```
NEXT_PUBLIC_MARKETPLACE_721_CONTRACT=
NEXT_PUBLIC_MARKETPLACE_721_START_BLOCK=9196722
NEXT_PUBLIC_MARKETPLACE_1155_CONTRACT=
NEXT_PUBLIC_MARKETPLACE_1155_START_BLOCK=9197091
NEXT_PUBLIC_COLLECTION_1155_CONTRACT=
NEXT_PUBLIC_NFTCOMMENTS_CONTRACT=
```

- [ ] **Step 4: Typecheck**

```bash
npx tsc --noEmit 2>&1 | grep "use-marketplace-events"
```
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-marketplace-events.ts .env.example
git commit -m "fix: use canonical MARKETPLACE_CONTRACT constant in use-marketplace-events"
```

---

## Task 11: Final Verification

- [ ] **Step 1: Full typecheck — must be zero errors**

```bash
npx tsc --noEmit 2>&1
```

- [ ] **Step 2: Build**

```bash
npm run build 2>&1 | tail -20
```
Expected: successful build.

- [ ] **Step 3: Verify makeOffer is untouched**

```bash
grep -n "makeOffer" src/hooks/use-marketplace.ts | head -10
```
Expected: function still present, signature unchanged.

- [ ] **Step 4: Verify ERC-721 approval still goes to correct contract**

```bash
grep -n "medialaneContract.address" src/hooks/use-marketplace.ts
```
Expected: used in approveCalls721 (checkoutCart) and in createListing's ERC-721 path.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: marketplace protocol upgrade complete — ERC-721/ERC-1155 parity"
```
