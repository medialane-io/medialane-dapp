"use client";

import Link from "next/link";
import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTokensByOwner } from "@/hooks/use-tokens";
import { useUserOrders } from "@/hooks/use-orders";
import { useCollections } from "@/hooks/use-collections";
import { CollectionCard, CollectionCardSkeleton } from "@/components/shared/collection-card";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/motion-primitives";
import { BRAND } from "@/lib/brand";
import {
  LaunchpadServicesGrid,
  LAUNCHPAD_SERVICE_DEFINITIONS,
} from "@medialane/ui";
import type { ServiceCardProps } from "@medialane/ui";
import {
  Zap, Package, Tag, ShoppingCart, Star, Rocket, ArrowRight,
} from "lucide-react";

function HeroStats({ address }: { address: string }) {
  const { tokens, isLoading: tl } = useTokensByOwner(address);
  const { orders, isLoading: ol } = useUserOrders(address);
  const activeListings = orders.filter(
    (o) => o.status === "ACTIVE" && o.offer.itemType === "ERC721"
  );
  const totalSales = orders.filter((o) => o.status === "FULFILLED");
  const pills = [
    { label: "Owned",  value: tl ? null : tokens.length,        icon: Package,      color: BRAND.purple.text },
    { label: "Listed", value: ol ? null : activeListings.length, icon: Tag,          color: BRAND.blue.text   },
    { label: "Sold",   value: ol ? null : totalSales.length,     icon: ShoppingCart, color: BRAND.orange.text },
  ];
  return (
    <div className="flex flex-wrap gap-2 mt-5">
      {pills.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 text-sm">
          <Icon className={`h-3.5 w-3.5 ${color}`} />
          {value === null
            ? <Skeleton className="h-4 w-6 inline-block" />
            : <span className="font-bold">{value}</span>}
          <span className="text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}

// Inject dapp-specific hrefs for each service key
const DAPP_HREFS: Record<string, Pick<ServiceCardProps, "href" | "buttonLabel" | "browseHref">> = {
  "mint-ip-asset":      { href: "/create/asset",          buttonLabel: "Mint asset"         },
  "create-collection":  { href: "/create/collection",     buttonLabel: "Create collection"  },
  "remix-asset":        { href: "/marketplace",           buttonLabel: "Browse to remix"    },
  "pop-protocol":       { href: "/launchpad/pop/create",  buttonLabel: "Create Event",      browseHref: "/launchpad/pop"  },
  "collection-drop":    { href: "/launchpad/drop/create", buttonLabel: "Launch Drop",       browseHref: "/launchpad/drop" },
  "ip-collection-1155": { href: "/launchpad/ip1155/create", buttonLabel: "Create Collection" },
  "mint-editions":      { href: "/launchpad/ip1155",      buttonLabel: "Mint editions"      },
};

const SERVICES: ServiceCardProps[] = LAUNCHPAD_SERVICE_DEFINITIONS.map((def) => ({
  ...def,
  ...(DAPP_HREFS[def.key] ?? {}),
}));

export function LaunchpadContent() {
  const { isConnected: isSignedIn, address: walletAddress } = useUnifiedWallet();
  const { collections: featured, isLoading: featuredLoading } = useCollections(1, 6, true);

  return (
    <div className="pb-16 space-y-10">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="px-4 py-14 sm:py-20">
          <FadeIn>
            <span className="pill-badge mb-5 inline-flex">
              <Zap className="h-3 w-3" />
              Creator Capital Markets
            </span>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-3">
              The Financial Hub for<br />
              <span className="gradient-text">Creator IP on Starknet</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="text-muted-foreground text-base max-w-xl leading-relaxed">
              Mint, structure, and monetize your intellectual property as programmable financial assets.
              No intermediaries. Full sovereignty.
            </p>
          </FadeIn>
          {isSignedIn && walletAddress && (
            <FadeIn delay={0.24}>
              <HeroStats address={walletAddress} />
            </FadeIn>
          )}
        </div>
      </section>

      {/* ── Services grid (from @medialane/ui) ───────────────── */}
      <section className="px-4">
        <LaunchpadServicesGrid services={SERVICES} />
      </section>

      {/* ── Portfolio shortcut (signed in only) ──────────────── */}
      {isSignedIn && (
        <section className="px-4">
          <FadeIn>
            <div className="bento-cell p-5 bg-gradient-to-r from-brand-navy/10 to-brand-purple/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="section-label">Manage</p>
                <p className="font-bold text-base mt-0.5">Your portfolio</p>
                <p className="text-sm text-muted-foreground mt-1">Assets, listings, offers, and activity.</p>
              </div>
              <Button variant="outline" asChild className="shrink-0">
                <Link href="/portfolio">
                  View portfolio <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </section>
      )}

      {/* ── Featured drops ────────────────────────────────────── */}
      <section className="px-4 space-y-4">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <p className="section-label">Curated</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Star className={`h-4 w-4 ${BRAND.orange.text}`} />
                <h2 className="text-xl font-bold">Featured drops</h2>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground">
              <Link href="/collections">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </FadeIn>
        {featuredLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <CollectionCardSkeleton key={i} />)}
          </div>
        ) : featured.length > 0 ? (
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((col) => (
              <StaggerItem key={col.contractAddress}>
                <CollectionCard collection={col} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <FadeIn>
            <div className="bento-cell border-dashed p-12 text-center space-y-3">
              <div className="flex justify-center gap-2 text-muted-foreground/30">
                <Star className="h-6 w-6" /><Rocket className="h-6 w-6" /><Star className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">Curated creator drops will appear here.</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/marketplace">Browse marketplace</Link>
              </Button>
            </div>
          </FadeIn>
        )}
      </section>

    </div>
  );
}
