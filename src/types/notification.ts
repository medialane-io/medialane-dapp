export type NotificationType =
  | "offer"
  | "offer_accepted"
  | "sale"
  | "listing"
  | "mint"
  | "transfer"
  | "asset_received"
  | "cancelled"
  | "announcement";

/** "spotlight" notifications open the full-attention panel on login; "normal" go to the feed only. */
export type NotificationPriority = "normal" | "spotlight";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  image: string | null;
  href: string;
  timestamp: string;
  isUnread: boolean;
  priority: NotificationPriority;
  /** True for positive outcomes that trigger confetti in the spotlight panel. */
  celebratory?: boolean;
  /** Extra structured data for rich spotlight rendering. */
  metadata?: {
    amount?: string;
    currency?: string;
    txHash?: string;
    assetName?: string;
  };
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  image: string | null;
  href: string;
  created_at: string;
  pinned?: boolean;
}
