/** Friendly messaging for IPFS upload failures.
 *
 * Uploads are gated by a one-time SIWS sign-in signature. Wallets surface that
 * request in their own UX (Ready X asks email-account users to unlock their
 * smart account first) — when the user declines, the generic "upload failed"
 * toast hid what actually happened. Detect the rejection and say so.
 */

export function isUserRejection(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /reject|denied|declin|abort|cancel|refus/i.test(msg);
}

export function uploadFailureToast(err: unknown): { title: string; description?: string } {
  if (isUserRejection(err)) {
    return {
      title: "Signature declined",
      description:
        "Uploads need a one-time, free sign-in signature — it's not a transaction and costs nothing. Try again and approve the request in your wallet.",
    };
  }
  return {
    title: "Image upload failed",
    description: err instanceof Error ? err.message : undefined,
  };
}
