export interface FriendlyWalletError {
  title: string;
  message: string;
  description?: string;
  isUserRejection: boolean;
}

function collectErrorText(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  if (typeof error === "object") {
    const source = error as Record<string, unknown>;
    const parts: string[] = [];

    for (const key of ["message", "name", "code", "shortMessage"]) {
      const value = source[key];
      if (value !== undefined) parts.push(String(value));
    }

    const messages = source.errorMessages;
    if (messages && typeof messages === "object") {
      parts.push(...Object.values(messages).map(String));
    }

    return parts.join(" ");
  }

  return String(error);
}

export function isUserRejectedRequest(error: unknown): boolean {
  const text = collectErrorText(error).toLowerCase();
  return (
    text.includes("user_refused_op") ||
    text.includes("user refused") ||
    text.includes("user rejected") ||
    text.includes("user aborted") ||
    text.includes("request rejected") ||
    text.includes("rejected by user") ||
    text.includes("cancelled") ||
    text.includes("canceled")
  );
}

export function getFriendlyWalletError(error: unknown): FriendlyWalletError {
  if (isUserRejectedRequest(error)) {
    return {
      title: "Request cancelled",
      message: "Request cancelled. Nothing was submitted.",
      description: "You closed or rejected the wallet request. Review the details and try again whenever you're ready.",
      isUserRejection: true,
    };
  }

  const message = collectErrorText(error) || "An unexpected wallet error occurred.";
  return {
    title: "Transaction failed",
    message,
    isUserRejection: false,
  };
}
