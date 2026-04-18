"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ListingCard as PackageListingCard,
  ListingCardSkeleton,
  ipfsToHttp,
  formatDisplayPrice,
} from "@medialane/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ExternalLink, Layers, Flag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { ReportDialog } from "@/components/report-dialog";
import type { ApiOrder } from "@medialane/sdk";

export { ListingCardSkeleton };

interface ListingCardProps {
  order: ApiOrder;
  onBuy?: (order: ApiOrder) => void;
  compact?: boolean;
}

export function ListingCard({ order, onBuy, compact = false }: ListingCardProps) {
  const { addItem, items } = useCart();
  const [reportOpen, setReportOpen] = useState(false);
  const inCart = items.some((i) => i.orderHash === order.orderHash);

  const name = order.token?.name ?? `Token #${order.nftTokenId}`;
  const image = order.token?.image ? ipfsToHttp(order.token.image) : null;

  const handleCart = (o: ApiOrder) => {
    if (inCart) return;
    addItem({
      orderHash: o.orderHash,
      nftContract: o.nftContract ?? "",
      nftTokenId: o.nftTokenId ?? "",
      name,
      image: image ?? "",
      price: formatDisplayPrice(o.price?.formatted),
      currency: o.price?.currency ?? "",
      currencyDecimals: o.price?.decimals,
      offerer: o.offerer ?? "",
      considerationToken: o.consideration?.token ?? "",
      considerationAmount: o.consideration?.startAmount ?? "",
    });
  };

  const overflowMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-9 w-9 p-0 shrink-0 rounded-[9px]"
          onClick={(e) => e.preventDefault()}
          aria-label="More actions"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href={`/asset/${order.nftContract}/${order.nftTokenId}`} className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            View Asset
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/collections/${order.nftContract}`} className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
            View Collection
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2 text-destructive focus:text-destructive"
          onClick={(e) => { e.preventDefault(); setReportOpen(true); }}
        >
          <Flag className="h-3.5 w-3.5" />
          Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <PackageListingCard
        order={order}
        inCart={inCart}
        onBuy={onBuy}
        onCart={handleCart}
        compact={compact}
        overflowMenu={overflowMenu}
      />
      {reportOpen && (
        <ReportDialog
          target={{
            type: "TOKEN",
            contract: order.nftContract ?? "",
            tokenId: order.nftTokenId ?? "",
            name: order.token?.name ?? undefined,
          }}
          open={reportOpen}
          onOpenChange={setReportOpen}
        />
      )}
    </>
  );
}
