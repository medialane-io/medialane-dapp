import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FEATURED_COLLECTION_IDS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { SUPPORTED_TOKENS } from "./constants";

// Helper function to shorten address
export const shortenAddress = (address: string) => {
  if (!address || address === "N/A" || address.length < 10) return address || "N/A";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Helper function to convert hex to decimal and format it
export const formatAmount = (hex: string) => {
  const decimal = parseInt(hex, 16);
  return decimal.toString();
};

export const getCurrency = (tokenAddress: string) => {
  if (!tokenAddress) return { symbol: "TOKEN", decimals: 18 };
  const normalized = normalizeStarknetAddress(tokenAddress).toLowerCase();
  for (const token of SUPPORTED_TOKENS) {
    const tokenNormalized = normalizeStarknetAddress(token.address).toLowerCase();
    if (tokenNormalized === normalized) {
      return { symbol: token.symbol, decimals: token.decimals };
    }
  }
  return { symbol: "TOKEN", decimals: 18 };
};

function adaptiveDecimals(num: number): number {
  if (num === 0 || num >= 1) return 2;
  if (num >= 0.01) return 4;
  // Show enough decimals to reveal 2 significant figures (e.g. 0.000014 → 6)
  const leadingZeros = Math.floor(-Math.log10(Math.abs(num)));
  return leadingZeros + 2;
}

export const formatPrice = (amount: string | number, decimals: number = 18) => {
  if (amount === undefined || amount === null) return "0.00";
  try {
    let num: number;
    if (typeof amount === "number") {
      num = amount;
    } else {
      const val = BigInt(amount);
      num = Number(val) / Math.pow(10, decimals);
    }
    
    if (num === 0) return "0.00";
    
    // Determine min/max fraction digits based on the number's magnitude
    const maxFractions = Math.min(20, adaptiveDecimals(num));
    const minFractions = num >= 1 ? 2 : undefined;
    
    return num.toLocaleString("en-US", {
      minimumFractionDigits: minFractions,
      maximumFractionDigits: maxFractions,
    });
  } catch {
    return "0.00";
  }
};

// Helper function to truncate long strings
export const truncateString = (str: string, maxLength: number = 30) => {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
};

export function formatDate(dateString: string) {
  const date = new Date(dateString);

  // Check if the date is today
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }

  // Check if the date is yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  // If within the last 7 days, show the day name
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  if (date > oneWeekAgo) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }

  // Otherwise, show the date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function normalizeStarknetAddress(address: string): string {
  if (!address || address === "N/A") return address;
  try {
    const bigIntAddr = BigInt(address);
    return "0x" + bigIntAddr.toString(16).toLowerCase();
  } catch {
    return address;
  }
}
export function toHexString(value: string | number | bigint): string {
  try {
    const num = BigInt(value);
    return "0x" + num.toString(16);
  } catch {
    throw new Error(`Invalid input for hex conversion: ${value}`);
  }
}

export function toEpochTime(date: string | Date): number {
  const d = typeof date === "string" ? new Date(date) : date;
  return Math.floor(d.getTime() / 1000);
}

export function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 300
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt === retries) throw e;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Max retry attempts reached");
}

export async function fetchInBatches<T>(
  tasks: (() => Promise<T>)[],
  batchSize = 5,
  delayMs = 300
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map((t) => t()));

    for (const res of batchResults) {
      if (res.status === "fulfilled") {
        results.push(res.value);
      } else {
        console.warn("Data fetch failed:", res.reason);
      }
    }

    if (i + batchSize < tasks.length) {
      await delay(delayMs);
    }
  }

  return results;
}

// Enhanced rate limiting with exponential backoff
export async function fetchWithRateLimit<T>(
  tasks: (() => Promise<T>)[],
  baseDelayMs = 1500,
  maxDelayMs = 10000
): Promise<T[]> {
  const results: T[] = [];
  let currentDelay = baseDelayMs;

  for (const task of tasks) {
    try {
      const result = await task();
      results.push(result);
      // Reset delay on success
      currentDelay = baseDelayMs;
    } catch (err) {
      console.warn("Fetch failed:", err);

      // If it's a rate limit error, use exponential backoff
      if (err instanceof Error && (err.message.includes('429') || err.message.includes('Too Many Requests'))) {
        console.log(`Rate limit hit, waiting ${currentDelay}ms...`);
        await new Promise((res) => setTimeout(res, currentDelay));
        // Exponential backoff: double the delay, but cap it
        currentDelay = Math.min(currentDelay * 2, maxDelayMs);

        // Retry logic could be added here if needed, but for now we just skip and log
      }
    }

    // Always wait between requests to be polite
    await new Promise((res) => setTimeout(res, baseDelayMs));
  }

  return results;
}

export function isCollectionFeatured(collectionId: string | bigint): boolean {
  const idString = String(collectionId);
  return FEATURED_COLLECTION_IDS.includes(idString);
}

